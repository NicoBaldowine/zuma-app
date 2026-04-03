import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const payload = await req.json();
    const record = payload.record ?? payload;

    const { user_id, title, body, data, id: notificationId } = record;

    if (!user_id || !title || !body) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Get all push tokens for this user
    const { data: tokens, error: tokenError } = await supabase
      .from('push_tokens')
      .select('expo_push_token')
      .eq('user_id', user_id);

    if (tokenError || !tokens?.length) {
      return new Response(JSON.stringify({ error: 'No push tokens found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build messages for Expo push API
    const messages = tokens.map((t: { expo_push_token: string }) => ({
      to: t.expo_push_token,
      title,
      body,
      sound: 'default' as const,
      data: data ?? {},
    }));

    // Send to Expo
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const expoToken = Deno.env.get('EXPO_ACCESS_TOKEN');
    if (expoToken) {
      headers['Authorization'] = `Bearer ${expoToken}`;
    }

    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(messages),
    });

    const result = await res.json();

    // Mark notification as sent
    if (notificationId) {
      await supabase
        .from('notifications')
        .update({ sent: true })
        .eq('id', notificationId);
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
