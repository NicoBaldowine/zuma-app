import { useState, useCallback } from 'react';
import { create, open, LinkSuccess, LinkExit } from 'react-native-plaid-link-sdk';
import { createLinkToken, exchangePublicToken } from '@/lib/api/plaid';

type PlaidLinkResult = {
  success: boolean;
  institutionName?: string;
  accountMask?: string;
  error?: string;
};

export function usePlaidLink() {
  const [loading, setLoading] = useState(false);

  const openLink = useCallback(async (): Promise<PlaidLinkResult> => {
    setLoading(true);
    try {
      // Step 1: Get a link_token from our backend
      const linkToken = await createLinkToken();

      // Step 2: Create the Link configuration
      const linkOpenConfig = {
        onSuccess: (_success: LinkSuccess) => {},
        onExit: (_exit: LinkExit) => {},
      };

      // Step 3: Create and open Plaid Link
      return new Promise<PlaidLinkResult>((resolve) => {
        linkOpenConfig.onSuccess = async (success: LinkSuccess) => {
          try {
            const result = await exchangePublicToken(
              success.publicToken,
              {
                accounts: success.metadata.accounts.map((a) => ({
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

            setLoading(false);
            resolve({
              success: true,
              institutionName: result.institutionName,
              accountMask: result.accountMask,
            });
          } catch (err: any) {
            setLoading(false);
            resolve({ success: false, error: err.message ?? 'Failed to link account' });
          }
        };

        linkOpenConfig.onExit = (exit: LinkExit) => {
          setLoading(false);
          if (exit.error) {
            resolve({ success: false, error: exit.error.displayMessage ?? 'Link cancelled' });
          } else {
            resolve({ success: false, error: 'Link cancelled' });
          }
        };

        create({ token: linkToken });
        open(linkOpenConfig);
      });
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message ?? 'Failed to initialize Plaid Link' };
    }
  }, []);

  return { open: openLink, loading };
}
