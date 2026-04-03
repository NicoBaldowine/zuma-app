import { useState, useCallback } from 'react';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';
import { seedMainBucketBalance } from '@/lib/api/transfers';
import { createLinkToken, exchangePublicToken } from '@/lib/api/plaid';

const isExpoGo = Constants.appOwnership === 'expo';

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
  await seedMainBucketBalance(data.balance_cents);

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
      if (!plaidSdk) {
        const result = await sandboxLink();
        setLoading(false);
        return result;
      }

      // Real Plaid Link flow
      const linkToken = await createLinkToken();

      const result = await Promise.race<PlaidLinkResult>([
        new Promise<PlaidLinkResult>((resolve) => {
          const onSuccess = async (success: any) => {
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
            resolve({
              success: false,
              error: exit.error?.displayMessage ?? 'Link cancelled',
            });
          };

          try {
            plaidSdk!.create({ token: linkToken });
            plaidSdk!.open({ onSuccess, onExit });
          } catch (err: any) {
            resolve({ success: false, error: err.message ?? 'Failed to open Plaid Link' });
          }
        }),
        // Safety timeout
        new Promise<PlaidLinkResult>((resolve) =>
          setTimeout(() => resolve({ success: false, error: 'Plaid Link timed out' }), 15000),
        ),
      ]);

      setLoading(false);
      return result;
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message ?? 'Failed to initialize Plaid Link' };
    }
  }, []);

  return { open: openLink, loading };
}
