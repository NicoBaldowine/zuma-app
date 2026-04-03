import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Execute all due auto-deposits
    const { data, error } = await supabase.rpc('execute_auto_deposits');

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // For any notifications that were queued, trigger the send-push function
    const { data: unsent } = await supabase
      .from('notifications')
      .select('*')
      .eq('sent', false)
      .order('created_at', { ascending: true });

    if (unsent && unsent.length > 0) {
      for (const notification of unsent) {
        await supabase.functions.invoke('send-push', {
          body: notification,
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: data,
      notificationsSent: unsent?.length ?? 0,
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
