import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PLAID_BASE_URL = 'https://sandbox.plaid.com';

// Sandbox test institution (First Platypus Bank)
const SANDBOX_INSTITUTION = 'ins_109508';
const SANDBOX_PRODUCTS = ['auth', 'transactions'];

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
    // Verify user is authenticated
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

    const clientId = Deno.env.get('PLAID_CLIENT_ID');
    const secret = Deno.env.get('PLAID_SECRET');

    // Step 1: Create a sandbox public token (simulates user going through Plaid Link)
    const createRes = await fetch(`${PLAID_BASE_URL}/sandbox/public_token/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        secret,
        institution_id: SANDBOX_INSTITUTION,
        initial_products: SANDBOX_PRODUCTS,
      }),
    });

    const createData = await createRes.json();
    if (createData.error_code) {
      return new Response(JSON.stringify({ error: createData.error_message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const publicToken = createData.public_token;

    // Step 2: Exchange public token for access token
    const exchangeRes = await fetch(`${PLAID_BASE_URL}/item/public_token/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        secret,
        public_token: publicToken,
      }),
    });

    const exchangeData = await exchangeRes.json();
    if (exchangeData.error_code) {
      return new Response(JSON.stringify({ error: exchangeData.error_message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { access_token, item_id } = exchangeData;

    // Step 3: Fetch account details and balances
    const balanceRes = await fetch(`${PLAID_BASE_URL}/accounts/balance/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        secret,
        access_token,
      }),
    });

    const balanceData = await balanceRes.json();
    if (balanceData.error_code) {
      return new Response(JSON.stringify({ error: balanceData.error_message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Pick the first checking/savings account
    const accounts = balanceData.accounts ?? [];
    const primaryAccount = accounts.find((a: any) =>
      a.subtype === 'checking' || a.subtype === 'savings'
    ) ?? accounts[0];

    if (!primaryAccount) {
      return new Response(JSON.stringify({ error: 'No accounts found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 4: Store in linked_accounts
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { error: dbError } = await serviceClient
      .from('linked_accounts')
      .upsert({
        user_id: user.id,
        plaid_item_id: item_id,
        plaid_access_token: access_token,
        account_id: primaryAccount.account_id,
        institution_name: 'First Platypus Bank',
        institution_id: SANDBOX_INSTITUTION,
        account_name: primaryAccount.name,
        account_mask: primaryAccount.mask,
        account_subtype: primaryAccount.subtype,
      }, { onConflict: 'user_id' });

    if (dbError) {
      return new Response(JSON.stringify({ error: dbError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return account info + balance
    const balanceCents = Math.round((primaryAccount.balances.current ?? 0) * 100);

    return new Response(JSON.stringify({
      success: true,
      institution_name: 'First Platypus Bank',
      account_name: primaryAccount.name,
      account_mask: primaryAccount.mask,
      account_subtype: primaryAccount.subtype,
      balance_cents: balanceCents,
      all_accounts: accounts.map((a: any) => ({
        name: a.name,
        mask: a.mask,
        subtype: a.subtype,
        balance: a.balances.current,
      })),
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
