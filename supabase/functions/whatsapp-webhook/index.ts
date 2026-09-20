// Supabase Edge Function: whatsapp-webhook
// Deploy via: supabase functions deploy whatsapp-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hub-signature-256',
};

function normalizePhoneNumber(raw: string | null | undefined): string {
  if (!raw) return '';
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 10) digits = `91${digits}`;
  else if (digits.length === 11 && digits.startsWith('0')) digits = `91${digits.slice(1)}`;
  return digits;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const verifyToken = Deno.env.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN') || '';
  const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN') || '';
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '';
  const apiVersion = Deno.env.get('WHATSAPP_API_VERSION') || 'v21.0';
  const rawAdmin = Deno.env.get('WHATSAPP_ADMIN_PHONE_NUMBER') || '';
  const adminPhones = rawAdmin.split(',').map(p => normalizePhoneNumber(p.trim())).filter(Boolean);

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. GET Webhook Verification
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[Edge Function] Webhook verified successfully');
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain', ...corsHeaders },
      });
    }

    return new Response('Verification token mismatch', { status: 403, headers: corsHeaders });
  }

  // 2. POST Event Handler
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const entries = body?.entry || [];

      for (const entry of entries) {
        for (const change of entry?.changes || []) {
          const val = change?.value;
          if (!val || val.messaging_product !== 'whatsapp') continue;

          for (const msg of val.messages || []) {
            const from = normalizePhoneNumber(msg.from);
            const messageId = msg.id;

            // Check authorization
            if (!adminPhones.includes(from)) {
              console.warn(`[Edge Function] Unauthorized sender: ${from}`);
              continue;
            }

            // Extract action and booking ID
            let action: string | null = null;
            let bookingId: string | null = null;

            const buttonId = msg.interactive?.button_reply?.id || msg.button?.payload || msg.text?.body || '';
            const match = buttonId.match(/^(ACCEPT|REJECT)[_:\s]+([A-Za-z0-9-]+)$/i);
            if (match) {
              action = match[1].toUpperCase();
              bookingId = match[2];
            }

            if (!action || !bookingId) continue;

            // Fetch booking
            const { data: booking } = await supabase.from('bookings').select('*').eq('id', bookingId).maybeSingle();
            if (!booking) continue;

            // Prevent double actions
            if (booking.status !== 'pending') {
              console.log(`[Edge Function] Booking ${bookingId} already in status ${booking.status}`);
              continue;
            }

            const now = new Date().toISOString();
            const targetStatus = action === 'ACCEPT' ? 'accepted' : 'cancelled';

            await supabase.from('bookings').update({
              status: targetStatus,
              updated_at: now,
              ...(action === 'ACCEPT'
                ? { accepted_at: now, accepted_by: `whatsapp:+${from}` }
                : { rejected_at: now, rejected_by: `whatsapp:+${from}`, rejection_reason: 'Admin rejected via WhatsApp' }),
            }).eq('id', bookingId).eq('status', 'pending');

            // Record notification
            await supabase.from('whatsapp_notifications').insert({
              booking_id: bookingId,
              recipient_phone: from,
              message_type: 'incoming_action',
              provider_message_id: messageId,
              status: 'processed',
              payload: { action, bookingId, from },
            });
          }
        }
      }

      return new Response(JSON.stringify({ status: 'OK' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (err: any) {
      console.error('[Edge Function] Error:', err);
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders });
});
