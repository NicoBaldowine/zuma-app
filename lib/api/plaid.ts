import { Platform } from 'react-native';
import { supabase } from '../supabase';
import { getCurrentUserId } from '../auth/get-user-id';

export async function createLinkToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await supabase.functions.invoke('create-link-token', {
    headers: { Authorization: `Bearer ${session?.access_token}` },
    body: { platform: Platform.OS },
  });

  if (response.error) throw new Error(response.error.message);
  return response.data.link_token;
}

export async function exchangePublicToken(
  publicToken: string,
  metadata: {
    accounts?: Array<{ id: string; name: string; mask: string; subtype: string }>;
    institution?: { name: string; institution_id: string };
  },
): Promise<{ institutionName?: string; accountMask?: string }> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await supabase.functions.invoke('exchange-plaid-token', {
    headers: { Authorization: `Bearer ${session?.access_token}` },
    body: { public_token: publicToken, metadata },
  });

  if (response.error) throw new Error(response.error.message);
  return {
    institutionName: response.data.institution_name,
    accountMask: response.data.account_mask,
  };
}

export async function getBalance(): Promise<Array<{
  id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
  available: number;
  current: number;
  currency: string;
}>> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await supabase.functions.invoke('get-plaid-balance', {
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });

  if (response.error) throw new Error(response.error.message);
  return response.data.accounts;
}

export async function hasLinkedAccount(userId: string = getCurrentUserId()): Promise<boolean> {
  const { data } = await supabase
    .from('linked_accounts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  return !!data;
}

export async function getLinkedAccountMask(userId: string = getCurrentUserId()): Promise<string | undefined> {
  const { data } = await supabase
    .from('linked_accounts')
    .select('account_mask')
    .eq('user_id', userId)
    .maybeSingle();

  return data?.account_mask ?? undefined;
}
