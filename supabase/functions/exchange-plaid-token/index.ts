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

    const { public_token, metadata } = await req.json();

    // Exchange public_token for access_token
    const exchangeResponse = await fetch(`${PLAID_BASE_URL}/item/public_token/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: Deno.env.get('PLAID_CLIENT_ID'),
        secret: Deno.env.get('PLAID_SECRET'),
        public_token,
      }),
    });

    const exchangeData = await exchangeResponse.json();

    if (exchangeData.error_code) {
      return new Response(JSON.stringify({ error: exchangeData.error_message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { access_token, item_id } = exchangeData;
    const account = metadata?.accounts?.[0];
    const institution = metadata?.institution;

    // Store in linked_accounts (upsert — one per user for MVP)
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
        account_id: account?.id ?? '',
        institution_name: institution?.name ?? null,
        institution_id: institution?.institution_id ?? null,
        account_name: account?.name ?? null,
        account_mask: account?.mask ?? null,
        account_subtype: account?.subtype ?? null,
      }, { onConflict: 'user_id' });

    if (dbError) {
      return new Response(JSON.stringify({ error: dbError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      institution_name: institution?.name,
      account_mask: account?.mask,
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
