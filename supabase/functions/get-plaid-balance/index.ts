import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PLAID_ENV = Deno.env.get('PLAID_ENV') ?? 'sandbox';
const PLAID_BASE_URL = PLAID_ENV === 'production'
  ? 'https://production.plaid.com'
  : PLAID_ENV === 'development'
    ? 'https://development.plaid.com'
    : 'https://sandbox.plaid.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user's access token
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: connection, error: dbError } = await serviceClient
      .from('linked_accounts')
      .select('plaid_access_token, account_id')
      .eq('user_id', user.id)
      .single();

    if (dbError || !connection) {
      return new Response(JSON.stringify({ error: 'No linked account found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch balance from Plaid
    const response = await fetch(`${PLAID_BASE_URL}/accounts/balance/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: Deno.env.get('PLAID_CLIENT_ID'),
        secret: Deno.env.get('PLAID_SECRET'),
        access_token: connection.plaid_access_token,
      }),
    });

    const data = await response.json();

    if (data.error_code) {
      return new Response(JSON.stringify({ error: data.error_message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return simplified account balances
    const accounts = (data.accounts ?? []).map((acc: any) => ({
      id: acc.account_id,
      name: acc.name,
      mask: acc.mask,
      type: acc.type,
      subtype: acc.subtype,
      available: acc.balances.available,
      current: acc.balances.current,
      currency: acc.balances.iso_currency_code,
    }));

    return new Response(JSON.stringify({ accounts }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
