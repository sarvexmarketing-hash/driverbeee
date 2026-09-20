import type { IncomingMessage, ServerResponse } from 'node:http';
import type { DBBookingLike } from '../../src/services/whatsapp.service.ts';
import {
  getWhatsAppConfig,
  verifyWebhookSignature,
  isAuthorizedAdmin,
  normalizePhoneNumber,
  whatsappService,
} from '../../src/services/whatsapp.service.ts';
import { getServerSupabase } from '../../src/services/serverSupabase.ts';

export interface WebhookProcessResult {
  statusCode: number;
  body: string | Record<string, any>;
  headers?: Record<string, string>;
}

/**
 * Core processor for WhatsApp Webhook requests.
 * Decoupled from specific server runtime (Vercel Serverless, Vite dev middleware, or Node test runner).
 */
export async function processWhatsAppWebhook(
  method: string,
  query: Record<string, any>,
  body: any,
  headers: Record<string, any>,
  rawBody: string = ''
): Promise<WebhookProcessResult> {
  const config = getWhatsAppConfig();

  // ───────────────────────────────────────────────────────────────────────────
  // 1. GET: Meta Webhook Verification
  // ───────────────────────────────────────────────────────────────────────────
  if (method === 'GET') {
    const mode = query['hub.mode'] || query['hub_mode'];
    const token = query['hub.verify_token'] || query['hub_verify_token'];
    const challenge = query['hub.challenge'] || query['hub_challenge'];

    console.log('[DriverBee WhatsApp Webhook] Verification request received:', {
      mode,
      tokenMatches: token === config.webhookVerifyToken,
    });

    if (mode === 'subscribe' && token && token === config.webhookVerifyToken) {
      console.log('[DriverBee WhatsApp Webhook] Meta Webhook verified successfully.');
      return {
        statusCode: 200,
        body: challenge || 'OK',
        headers: { 'Content-Type': 'text/plain' },
      };
    }

    console.warn('[DriverBee WhatsApp Webhook] Webhook verification failed. Tokens do not match.');
    return {
      statusCode: 403,
      body: { error: 'Verification failed. hub.verify_token mismatch.' },
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. POST: Meta Event Processing
  // ───────────────────────────────────────────────────────────────────────────
  if (method === 'POST') {
    // A. Signature verification
    const signatureHeader = headers['x-hub-signature-256'] || headers['X-Hub-Signature-256'];
    if (config.appSecret) {
      const isValidSig = verifyWebhookSignature(rawBody, signatureHeader, config.appSecret);
      if (!isValidSig) {
        console.warn('[DriverBee WhatsApp Security] Invalid webhook signature from Meta.');
        return {
          statusCode: 401,
          body: { error: 'Invalid x-hub-signature-256 signature.' },
        };
      }
    }

    // B. Parse incoming messages from Meta WhatsApp payload
    const entries = body?.entry || [];
    const supabase = getServerSupabase();

    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        const val = change?.value;
        if (!val || val.messaging_product !== 'whatsapp') continue;

        const messages = val.messages || [];
        for (const msg of messages) {
          const from = normalizePhoneNumber(msg.from);
          const messageId = msg.id; // e.g. wamid.HBgL...

          console.log('[DriverBee WhatsApp Webhook] Incoming message event:', {
            from,
            type: msg.type,
            messageId,
          });

          // C. Idempotency check: Have we processed this provider_message_id already?
          if (messageId) {
            try {
              const { data: existing } = await supabase
                .from('whatsapp_notifications')
                .select('id, status')
                .eq('provider_message_id', messageId)
                .maybeSingle();

              if (existing) {
                console.log(`[DriverBee WhatsApp Webhook] Duplicate event detected for ${messageId}, skipping.`);
                continue;
              }
            } catch (err) {
              console.warn('[DriverBee WhatsApp Webhook] Idempotency lookup error:', err);
            }
          }

          // D. Admin Authorization check
          const isAuthorized = isAuthorizedAdmin(from, config.adminPhoneNumbers);
          if (!isAuthorized) {
            console.warn(`[DriverBee WhatsApp Security] UNAUTHORIZED WhatsApp action attempt from: +${from}`);
            
            // Log security event in notifications table
            await supabase.from('whatsapp_notifications').insert({
              recipient_phone: from,
              message_type: 'incoming_action',
              provider_message_id: messageId,
              status: 'failed',
              error_message: `Unauthorized sender: +${from}`,
              payload: { from, rawMsg: msg },
            }).catch(() => {});

            // Send polite rejection to unauthorized sender
            if (config.enabled) {
              await whatsappService.sendTextMessage(
                from,
                '⚠️ *DriverBee Security Alert*\n\nYour WhatsApp number is not authorized to accept or reject bookings. This attempt has been logged.'
              ).catch(() => {});
            }

            continue;
          }

          // E. Extract Action and Booking ID
          let action: 'ACCEPT' | 'REJECT' | null = null;
          let bookingId: string | null = null;

          // 1. From Interactive button reply: { button_reply: { id: 'ACCEPT_DB-123456' } }
          if (msg.type === 'interactive' && msg.interactive?.button_reply) {
            const btnId = msg.interactive.button_reply.id || '';
            const match = btnId.match(/^(ACCEPT|REJECT)[_:\s]+([A-Za-z0-9-]+)$/i);
            if (match) {
              action = match[1].toUpperCase() as 'ACCEPT' | 'REJECT';
              bookingId = match[2];
            }
          }

          // 2. From Template quick-reply button: { button: { payload: 'ACCEPT_DB-123456' } }
          if (!action && msg.type === 'button' && msg.button?.payload) {
            const payload = msg.button.payload;
            const match = payload.match(/^(ACCEPT|REJECT)[_:\s]+([A-Za-z0-9-]+)$/i);
            if (match) {
              action = match[1].toUpperCase() as 'ACCEPT' | 'REJECT';
              bookingId = match[2];
            }
          }

          // 3. From text message: "ACCEPT DB-123456"
          if (!action && msg.type === 'text' && msg.text?.body) {
            const text = msg.text.body.trim();
            const match = text.match(/^(ACCEPT|REJECT)[_:\s]+([A-Za-z0-9-]+)$/i);
            if (match) {
              action = match[1].toUpperCase() as 'ACCEPT' | 'REJECT';
              bookingId = match[2];
            }
          }

          if (!action || !bookingId) {
            console.log('[DriverBee WhatsApp Webhook] Unrecognized message content or format:', msg);
            continue;
          }

          console.log(`[DriverBee WhatsApp Webhook] Action parsed: ${action} for Booking: ${bookingId} by Admin: ${from}`);

          // F. Retrieve Booking from Database
          const { data: booking, error: fetchErr } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .maybeSingle();

          if (fetchErr || !booking) {
            console.warn(`[DriverBee WhatsApp Webhook] Booking not found in database: ${bookingId}`);
            if (config.enabled) {
              await whatsappService.sendTextMessage(
                from,
                `❌ *Booking Not Found*\n\nBooking ref *${bookingId}* could not be located in the DriverBee database.`
              ).catch(() => {});
            }
            continue;
          }

          const currentStatus = booking.status;

          // G. Double-Action Prevention / State Transition Protection
          // PENDING -> ACCEPTED is valid
          // PENDING -> CANCELLED/REJECTED is valid
          // Any action on already ACCEPTED or REJECTED booking must be safely rejected
          if (currentStatus === 'accepted') {
            const msgNotice = action === 'ACCEPT'
              ? `ℹ️ Booking *${bookingId}* has already been ACCEPTED.`
              : `⚠️ Action blocked: Booking *${bookingId}* is already ACCEPTED and cannot be rejected.`;
            
            console.log(`[DriverBee WhatsApp Webhook] State protection: ${msgNotice}`);
            if (config.enabled) {
              await whatsappService.sendTextMessage(from, msgNotice).catch(() => {});
            }
            continue;
          }

          if (currentStatus === 'cancelled' || currentStatus === 'rejected') {
            const msgNotice = action === 'REJECT'
              ? `ℹ️ Booking *${bookingId}* has already been REJECTED.`
              : `⚠️ Action blocked: Booking *${bookingId}* was already REJECTED and cannot be accepted.`;

            console.log(`[DriverBee WhatsApp Webhook] State protection: ${msgNotice}`);
            if (config.enabled) {
              await whatsappService.sendTextMessage(from, msgNotice).catch(() => {});
            }
            continue;
          }

          if (currentStatus !== 'pending') {
            const msgNotice = `⚠️ Booking *${bookingId}* is currently in status *${currentStatus.toUpperCase()}* and cannot be modified via WhatsApp.`;
            if (config.enabled) {
              await whatsappService.sendTextMessage(from, msgNotice).catch(() => {});
            }
            continue;
          }

          // H. Valid State Transition: Perform the update!
          const nowIso = new Date().toISOString();
          let targetStatus: string;
          let updatePayload: Record<string, any> = {
            updated_at: nowIso,
          };

          if (action === 'ACCEPT') {
            targetStatus = 'accepted';
            updatePayload = {
              ...updatePayload,
              status: 'accepted',
              accepted_at: nowIso,
              accepted_by: `whatsapp:+${from}`,
              notes: booking.notes ? `${booking.notes}\n• [WhatsApp Admin Accepted at ${nowIso}]` : `[WhatsApp Admin Accepted at ${nowIso}]`,
            };
          } else {
            targetStatus = 'cancelled';
            updatePayload = {
              ...updatePayload,
              status: 'cancelled',
              rejected_at: nowIso,
              rejected_by: `whatsapp:+${from}`,
              rejection_reason: 'Admin rejected via WhatsApp',
              notes: booking.notes ? `${booking.notes}\n• [WhatsApp Admin Rejected at ${nowIso}]` : `[WhatsApp Admin Rejected at ${nowIso}]`,
            };
          }

          const { error: updateErr } = await supabase
            .from('bookings')
            .update(updatePayload)
            .eq('id', bookingId)
            .eq('status', 'pending'); // Ensure optimistic concurrency lock

          if (updateErr) {
            console.error(`[DriverBee WhatsApp Webhook] Database update error for ${bookingId}:`, updateErr);
            continue;
          }

          console.log(`[DriverBee WhatsApp Webhook] Booking ${bookingId} successfully transitioned to ${targetStatus}`);

          const updatedBooking: DBBookingLike = {
            ...booking,
            ...updatePayload,
            status: targetStatus,
          };

          // I. Send Confirmation to Admin
          if (action === 'ACCEPT') {
            await whatsappService.sendBookingAcceptedNotification(updatedBooking, from).catch(() => {});
          } else {
            await whatsappService.sendBookingRejectedNotification(updatedBooking, from).catch(() => {});
          }

          // J. Dispatch Notification to Customer
          await whatsappService.sendCustomerStatusNotification(
            updatedBooking,
            action === 'ACCEPT' ? 'accepted' : 'rejected'
          ).catch((err) => console.warn('[DriverBee WhatsApp] Customer status alert warning:', err));

          // K. Record In Notifications Audit Table
          await supabase.from('whatsapp_notifications').insert({
            booking_id: bookingId,
            recipient_phone: from,
            message_type: 'incoming_action',
            provider_message_id: messageId,
            status: 'processed',
            payload: {
              action,
              bookingId,
              from,
              transition: `${currentStatus} -> ${targetStatus}`,
            },
          }).catch((err) => console.warn('[DriverBee WhatsApp] Audit logging error:', err));
        }
      }
    }

    return {
      statusCode: 200,
      body: { status: 'EVENT_RECEIVED' },
    };
  }

  return {
    statusCode: 405,
    body: { error: `Method ${method} not allowed` },
  };
}

/**
 * Standard Vercel Serverless Function Handler
 */
export default async function handler(req: any, res: any) {
  const method = req.method || 'GET';
  const urlObj = new URL(req.url || '/', `http://${req.headers?.host || 'localhost'}`);
  const query = Object.fromEntries(urlObj.searchParams.entries());

  // Buffer raw body for signature verification if not already provided
  let rawBody = '';
  if (typeof req.body === 'string') {
    rawBody = req.body;
  } else if (req.rawBody) {
    rawBody = req.rawBody.toString('utf8');
  } else if (req.body && typeof req.body === 'object') {
    rawBody = JSON.stringify(req.body);
  }

  const result = await processWhatsAppWebhook(
    method,
    query,
    req.body || {},
    req.headers || {},
    rawBody
  );

  if (result.headers) {
    for (const [k, v] of Object.entries(result.headers)) {
      res.setHeader(k, v);
    }
  }

  if (typeof res.status === 'function') {
    res.status(result.statusCode);
  } else {
    res.statusCode = result.statusCode;
  }

  if (typeof result.body === 'string') {
    if (typeof res.send === 'function') {
      res.send(result.body);
    } else {
      if (!res.getHeader || !res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'text/plain');
      }
      res.end(result.body);
    }
  } else {
    if (typeof res.json === 'function') {
      res.json(result.body);
    } else {
      if (!res.getHeader || !res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/json');
      }
      res.end(JSON.stringify(result.body));
    }
  }
}
