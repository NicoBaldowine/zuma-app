import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// Seasonal & trendy Gen Z bucket suggestions
// Each month has multiple options — one is picked randomly per send
const SUGGESTIONS: Record<number, { title: string; body: string }[]> = {
  0: [ // January
    { title: 'New year, new goals 🎯', body: 'Start a savings bucket for something you\'ve been wanting all year.' },
    { title: 'Resolution fund 💪', body: 'Gym membership? New hobby? Create a bucket and make it happen.' },
  ],
  1: [ // February
    { title: 'Valentine\'s Day idea 💝', body: 'Start a date night fund — even if it\'s self-care.' },
    { title: 'Treat yourself month 🛍️', body: 'Create a "just because" bucket. You deserve it.' },
  ],
  2: [ // March
    { title: 'Spring break loading ☀️', body: 'Beach trip? Road trip? Start saving now.' },
    { title: 'New tattoo fund 🖋️', body: 'That design you\'ve been thinking about? Make it real.' },
  ],
  3: [ // April
    { title: 'Festival season 🎶', body: 'Coachella, Rolling Loud, Lolla — pick your vibe and start saving.' },
    { title: 'Sneaker drop incoming 👟', body: 'New releases every month. Stay ready with a sneaker fund.' },
  ],
  4: [ // May
    { title: 'Summer wardrobe 🧥', body: 'Refresh your fits. Start a style bucket.' },
    { title: 'Concert tickets 🎤', body: 'Your favorite artist is touring. Don\'t miss out.' },
  ],
  5: [ // June
    { title: 'Summer trip fund ✈️', body: 'Where are you going this summer? Start saving today.' },
    { title: 'Gaming setup upgrade 🎮', body: 'New monitor? Better chair? Level up your setup.' },
  ],
  6: [ // July
    { title: '4th of July road trip 🇺🇸', body: 'Plan the ultimate weekend getaway. Start a bucket.' },
    { title: 'Beach fund 🏖️', body: 'Sunscreen, snacks, and good vibes. Save for the perfect beach day.' },
  ],
  7: [ // August
    { title: 'Back to school 📚', body: 'New semester, new gear. Create a school supplies bucket.' },
    { title: 'Apartment glow-up 🏠', body: 'Moving in or refreshing? Start a home fund.' },
  ],
  8: [ // September
    { title: 'Fall festival fund 🍂', body: 'Music fests, food fairs, haunted houses — save for the vibes.' },
    { title: 'Side hustle investment 💡', body: 'That project you\'ve been planning? Fund it.' },
  ],
  9: [ // October
    { title: 'Halloween costume 🎃', body: 'Go all out this year. Start saving for the fit.' },
    { title: 'Skincare haul season 🧴', body: 'Winter prep starts now. Create a self-care bucket.' },
  ],
  10: [ // November
    { title: 'Black Friday deals 🛒', body: 'Be ready when the sales drop. Start your deal fund.' },
    { title: 'Friendsgiving fund 🦃', body: 'Host the dinner everyone talks about. Save for it.' },
  ],
  11: [ // December
    { title: 'Holiday gift fund 🎁', body: 'Get ahead on gifts. Your wallet will thank you.' },
    { title: 'New Year\'s Eve plans 🥂', body: 'NYE outfit, tickets, dinner — make it legendary.' },
  ],
};

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

    // Get users who opted in to bucket suggestions
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('user_id')
      .eq('bucket_suggestions', true);

    if (!prefs?.length) {
      return new Response(JSON.stringify({ sent: 0, reason: 'No opted-in users' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userIds = prefs.map((p: { user_id: string }) => p.user_id);

    // Get their push tokens
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('user_id, expo_push_token')
      .in('user_id', userIds);

    if (!tokens?.length) {
      return new Response(JSON.stringify({ sent: 0, reason: 'No push tokens' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Pick a random suggestion for this month
    const month = new Date().getMonth();
    const options = SUGGESTIONS[month] ?? SUGGESTIONS[0];
    const suggestion = options[Math.floor(Math.random() * options.length)];

    // Build messages
    const messages = tokens.map((t: { expo_push_token: string }) => ({
      to: t.expo_push_token,
      title: suggestion.title,
      body: suggestion.body,
      sound: 'default' as const,
      data: { type: 'bucket_suggestion' },
    }));

    // Send in batches of 100 (Expo limit)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const expoToken = Deno.env.get('EXPO_ACCESS_TOKEN');
    if (expoToken) headers['Authorization'] = `Bearer ${expoToken}`;

    let totalSent = 0;
    for (let i = 0; i < messages.length; i += 100) {
      const batch = messages.slice(i, i + 100);
      await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(batch),
      });
      totalSent += batch.length;
    }

    return new Response(JSON.stringify({ sent: totalSent, suggestion: suggestion.title }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
