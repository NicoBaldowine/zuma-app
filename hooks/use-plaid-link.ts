import { useState, useCallback } from 'react';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';
import { seedMainBucketBalance } from '@/lib/api/transfers';
import { createLinkToken, exchangePublicToken, getBalance } from '@/lib/api/plaid';

const isExpoGo = Constants.appOwnership === 'expo';
const plaidEnv = process.env.EXPO_PUBLIC_PLAID_ENV ?? 'sandbox';

let plaidSdk: typeof import('react-native-plaid-link-sdk') | null = null;
if (!isExpoGo) {
  try {
    plaidSdk = require('react-native-plaid-link-sdk');
  } catch {
    // Native module not available
  }
}

type PlaidLinkResult = {
  success: boolean;
  institutionName?: string;
  accountMask?: string;
  balanceCents?: number;
  error?: string;
};

async function sandboxLink(): Promise<PlaidLinkResult> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await supabase.functions.invoke('sandbox-link', {
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  const data = response.data;

  if (!data.success) {
    throw new Error(data.error ?? 'Sandbox link failed');
  }

  // Seed main bucket with the real Plaid sandbox balance
  try {
    await seedMainBucketBalance(data.balance_cents);
  } catch {
    // Seed may fail if balance already exists — non-blocking
  }

  return {
    success: true,
    institutionName: data.institution_name,
    accountMask: data.account_mask,
    balanceCents: data.balance_cents,
  };
}

export function usePlaidLink() {
  const [loading, setLoading] = useState(false);

  const openLink = useCallback(async (): Promise<PlaidLinkResult> => {
    setLoading(true);
    try {
      // Native Plaid Link SDK (required for production)
      if (plaidSdk) {
        const linkToken = await createLinkToken();

        const nativeResult = await new Promise<PlaidLinkResult>((resolve) => {
          const fallbackTimer = setTimeout(() => {
            resolve({ success: false, error: 'Plaid Link timed out. Please try again.' });
          }, 15000);

          const onSuccess = async (success: any) => {
            clearTimeout(fallbackTimer);
            try {
              const exchangeResult = await exchangePublicToken(
                success.publicToken,
                {
                  accounts: success.metadata.accounts.map((a: any) => ({
                    id: a.id,
                    name: a.name ?? '',
                    mask: a.mask ?? '',
                    subtype: String(a.subtype ?? ''),
                  })),
                  institution: success.metadata.institution
                    ? {
                        name: success.metadata.institution.name,
                        institution_id: success.metadata.institution.id,
                      }
                    : undefined,
                },
              );
              try {
                const accounts = await getBalance();
                const balanceCents = Math.round((accounts[0]?.current ?? 0) * 100);
                if (balanceCents > 0) await seedMainBucketBalance(balanceCents);
              } catch {}
              resolve({
                success: true,
                institutionName: exchangeResult.institutionName,
                accountMask: exchangeResult.accountMask,
              });
            } catch (err: any) {
              resolve({ success: false, error: err.message ?? 'Failed to link account' });
            }
          };

          const onExit = (exit: any) => {
            clearTimeout(fallbackTimer);
            resolve({
              success: false,
              error: exit.error?.displayMessage ?? exit.error?.errorMessage ?? 'Link cancelled',
            });
          };

          plaidSdk!.create({
            token: linkToken,
            noLoadingState: false,
            onLoad: () => {
              clearTimeout(fallbackTimer);
              plaidSdk!.open({ onSuccess, onExit });
            },
          });
        });

        setLoading(false);
        return nativeResult;
      }

      // Sandbox fallback — only allowed in development
      if (plaidEnv === 'sandbox') {
        const result = await sandboxLink();
        setLoading(false);
        return result;
      }

      // Production without native SDK (Expo Go) — not supported
      setLoading(false);
      return {
        success: false,
        error: 'Bank connection requires a native build. Please use the installed app.',
      };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message ?? 'Failed to initialize Plaid Link' };
    }
  }, []);

  return { open: openLink, loading };
}
