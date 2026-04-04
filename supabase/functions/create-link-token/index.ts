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

    // Determine platform from request body (optional)
    let platform = 'ios';
    try {
      const body = await req.json();
      if (body?.platform) platform = body.platform;
    } catch {
      // No body or invalid JSON — default to iOS
    }

    // Build link token request with platform-specific fields
    const linkTokenRequest: Record<string, unknown> = {
      client_id: Deno.env.get('PLAID_CLIENT_ID'),
      secret: Deno.env.get('PLAID_SECRET'),
      user: { client_user_id: user.id },
      client_name: 'Zuma',
      products: ['auth', 'transactions'],
      country_codes: ['US'],
      language: 'en',
    };

    // iOS requires redirect_uri for OAuth; Android requires android_package_name
    if (platform === 'android') {
      linkTokenRequest.android_package_name = 'com.nicobaldovino.zumaapp';
    } else {
      // redirect_uri must be a universal link registered in the Plaid Dashboard
      const redirectUri = Deno.env.get('PLAID_REDIRECT_URI');
      if (redirectUri) {
        linkTokenRequest.redirect_uri = redirectUri;
      }
    }

    // Create link token via Plaid API
    const response = await fetch(`${PLAID_BASE_URL}/link/token/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(linkTokenRequest),
    });

    const data = await response.json();

    if (data.error_code) {
      return new Response(JSON.stringify({ error: data.error_message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ link_token: data.link_token }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
