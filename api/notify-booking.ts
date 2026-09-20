import type { DBBookingLike } from '../src/services/whatsapp.service.ts';
import { whatsappService } from '../src/services/whatsapp.service.ts';
import { getServerSupabase } from '../src/services/serverSupabase.ts';

export async function processNotifyBooking(bookingId: string, directBooking?: DBBookingLike) {
  const supabase = getServerSupabase();

  let booking: DBBookingLike | null = directBooking || null;

  if (!booking && bookingId) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .maybeSingle();

      if (!error && data) {
        booking = data as DBBookingLike;
      }
    } catch (fetchErr) {
      console.warn('[DriverBee Notify API] Error fetching booking for notification:', fetchErr);
    }
  }

  if (!booking) {
    return {
      statusCode: 404,
      body: { success: false, error: `Booking ${bookingId} not found` },
    };
  }

  try {
    const result = await whatsappService.sendBookingNotification(booking);

    // Record attempt in whatsapp_notifications table
    await supabase.from('whatsapp_notifications').insert({
      booking_id: booking.id,
      recipient_phone: whatsappService['config']?.adminPhoneNumbers?.[0] || 'admin',
      message_type: 'admin_booking_alert',
      provider_message_id: result.messageId || null,
      status: result.success ? 'sent' : 'failed',
      error_message: result.error || null,
      payload: { bookingId: booking.id, fare: booking.estimated_fare },
    }).catch((logErr) => console.warn('[DriverBee Notify API] Failed to record notification:', logErr));

    return {
      statusCode: 200,
      body: {
        success: result.success,
        messageId: result.messageId,
        simulated: result.simulated,
        error: result.error,
      },
    };
  } catch (err: any) {
    console.error('[DriverBee Notify API] WhatsApp notification exception:', err);
    return {
      statusCode: 200, // Still return 200 to prevent customer front-end failure
      body: { success: false, error: err.message || 'WhatsApp notification error' },
    };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const { bookingId, booking } = req.body || {};
  if (!bookingId && !booking?.id) {
    res.status(400).json({ error: 'Missing bookingId in request body.' });
    return;
  }

  const id = bookingId || booking?.id;
  const result = await processNotifyBooking(id, booking);

  if (typeof res.status === 'function') {
    res.status(result.statusCode);
  } else {
    res.statusCode = result.statusCode;
  }

  if (typeof res.json === 'function') {
    res.json(result.body);
  } else {
    if (!res.getHeader || !res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json');
    }
    res.end(JSON.stringify(result.body));
  }
}

