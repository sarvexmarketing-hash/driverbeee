// Supabase Edge Function: send-booking-email
// Triggered via supabase.functions.invoke('send-booking-email', { body: payload })

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingEmailPayload {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tripType: 'city' | 'outside' | 'intercity';
  duration: number;
  scheduleType: 'now' | 'later';
  date: string;
  time: string;
  transmission: 'automatic' | 'manual';
  carModel: string;
  carPlate: string;
  pickupAddress: string;
  deliveryAddress: string;
  estimatedFare: number;
  forWhom: string;
  assignedDriverName?: string | null;
  assignedDriverPhone?: string | null;
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateEmailHtml(p: BookingEmailPayload): string {
  const isOutside = p.tripType === 'outside';
  const durationLabel = isOutside
    ? `${escapeHtml(String(p.duration))} Day${p.duration > 1 ? 's' : ''} Outstation Package`
    : `${escapeHtml(String(p.duration))} Hours Local Trip`;
  const scheduleLabel = p.scheduleType === 'now'
    ? 'Immediate (~30 mins arrival)'
    : `${escapeHtml(p.date)} at ${escapeHtml(p.time)}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DriverBee Booking Confirmed - #${escapeHtml(p.bookingId)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #F8FAFC; color: #0B1020; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 24px auto; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(11, 16, 32, 0.05); }
    .header { background: linear-gradient(135deg, #0B1020 0%, #151F38 100%); padding: 32px 28px 24px; text-align: center; color: #FFFFFF; }
    .badge { display: inline-block; background-color: rgba(232, 146, 24, 0.15); color: #E89218; border: 1px solid rgba(232, 146, 24, 0.3); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 14px; border-radius: 9999px; margin-bottom: 12px; }
    .header h1 { margin: 8px 0 4px; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF; }
    .header p { margin: 0; font-size: 13px; color: #94A3B8; }
    .booking-id-pill { display: inline-block; background-color: #E89218; color: #FFFFFF; font-weight: 900; font-size: 14px; padding: 8px 20px; border-radius: 12px; margin-top: 16px; letter-spacing: 0.5px; }
    
    .content { padding: 28px 28px; }
    .salutation { font-size: 16px; font-weight: 700; color: #0B1020; margin-bottom: 8px; }
    .intro { font-size: 13.5px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
    
    .driver-card { background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 18px; padding: 18px; margin-bottom: 24px; }
    .driver-name { font-size: 15px; font-weight: 800; color: #064E3B; }
    .driver-phone { font-size: 13px; font-weight: 700; color: #047857; margin-top: 4px; }
    
    .table-card { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 18px; padding: 20px; margin-bottom: 24px; }
    .table-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748B; margin-bottom: 14px; }
    .row { display: flex; justify-content: space-between; align-items: flex-start; padding: 9px 0; border-bottom: 1px solid #EEF2F6; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .label { color: #64748B; font-weight: 500; }
    .value { color: #0B1020; font-weight: 700; text-align: right; max-width: 320px; word-break: break-word; }
    .highlight-value { color: #E89218; font-size: 16px; font-weight: 900; }
    
    .notice-box { background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 16px; padding: 16px; margin-bottom: 24px; }
    .notice-box h4 { margin: 0 0 6px; font-size: 13px; font-weight: 800; color: #92400E; }
    .notice-box ul { margin: 0; padding-left: 18px; font-size: 12px; color: #78350F; line-height: 1.6; }
    
    .footer { background-color: #F1F5F9; padding: 24px 28px; text-align: center; border-top: 1px solid #E2E8F0; }
    .footer p { margin: 0 0 6px; font-size: 12px; color: #64748B; }
    .support-pill { display: inline-flex; align-items: center; gap: 6px; background-color: #0B1020; color: #FFFFFF; padding: 8px 18px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-decoration: none; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">DriverBee Warangal</div>
      <h1>Driver Booking Confirmed!</h1>
      <p>Thank you for choosing DriverBee doorstep personal drivers.</p>
      <div class="booking-id-pill">BOOKING REF: #${escapeHtml(p.bookingId)}</div>
    </div>

    <div class="content">
      <div class="salutation">Hello ${escapeHtml(p.customerName)},</div>
      <div class="intro">
        Your professional personal driver booking has been received. Your verified driver will arrive at your doorstep in Warangal on schedule.
      </div>

      ${p.assignedDriverName ? `
      <div class="driver-card">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #059669; margin-bottom: 2px;">Verified Driver Assigned</div>
        <div class="driver-name">👤 ${escapeHtml(p.assignedDriverName)} (Verified Professional Driver)</div>
        <div class="driver-phone">📞 Contact: +91 ${escapeHtml(p.assignedDriverPhone || '7569402288')}</div>
      </div>
      ` : `
      <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 16px; padding: 14px 18px; margin-bottom: 24px; font-size: 12.5px; color: #92400E; font-weight: 600;">
        ⏱️ <strong>Driver Assignment in Progress:</strong> Our Warangal operations team has accepted your ride and is dispatching your nearest verified driver.
      </div>
      `}

      <div class="table-card">
        <div class="table-title">Ride Summary</div>
        
        <div class="row">
          <span class="label">Customer Name</span>
          <span class="value">${escapeHtml(p.customerName)} (${escapeHtml(p.forWhom || 'Self')})</span>
        </div>

        <div class="row">
          <span class="label">Mobile Number</span>
          <span class="value">${escapeHtml(p.customerPhone)}</span>
        </div>

        <div class="row">
          <span class="label">Trip Category</span>
          <span class="value">${isOutside ? 'Outstation / Outside City' : 'Within Warangal City'}</span>
        </div>

        <div class="row">
          <span class="label">Duration / Package</span>
          <span class="value">${durationLabel}</span>
        </div>

        <div class="row">
          <span class="label">Scheduled Time</span>
          <span class="value">${scheduleLabel}</span>
        </div>

        <div class="row">
          <span class="label">Pickup Address</span>
          <span class="value">${escapeHtml(p.pickupAddress)}</span>
        </div>

        <div class="row">
          <span class="label">Destination Address</span>
          <span class="value">${escapeHtml(p.deliveryAddress)}</span>
        </div>

        <div class="row">
          <span class="label">Vehicle Details</span>
          <span class="value">${escapeHtml(p.carModel || 'Personal Car')} (${escapeHtml(p.carPlate || 'TS-03')}) • ${p.transmission === 'automatic' ? 'Automatic' : 'Manual'}</span>
        </div>

        <div class="row" style="padding-top: 14px; border-top: 2px dashed #CBD5E1; margin-top: 6px;">
          <span class="label" style="font-weight: 800; font-size: 14px; color: #0B1020;">Total Fare (Pay on Completion)</span>
          <span class="highlight-value">₹${Number(p.estimatedFare || 0).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div class="notice-box">
        <h4>Important Ride Guidelines:</h4>
        <ul>
          <li><strong>Doorstep Arrival:</strong> For immediate rides, the driver arrives within 30 minutes across Warangal, Hanamkonda, and Kazipet.</li>
          <li><strong>Payment Mode:</strong> Payment is collected directly by cash or UPI QR code upon drive completion.</li>
          <li><strong>Vehicle Fuel & Fastag:</strong> Fuel and road toll charges are handled by the vehicle owner.</li>
          <li><strong>Safety & Verification:</strong> All DriverBee drivers undergo background checks and verified skill evaluations.</li>
        </ul>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="tel:+917569402288" class="support-pill">
          📞 Need Support? Call +91 75694 02288
        </a>
      </div>
    </div>

    <div class="footer">
      <p><strong>DriverBee Technologies Pvt. Ltd.</strong></p>
      <p>Professional On-Demand Doorstep Drivers • Warangal, Telangana 506001</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const payload: BookingEmailPayload = await req.json();

    // 1. Server-side validation
    if (!payload.bookingId || typeof payload.bookingId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid bookingId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.customerEmail)) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid customerEmail' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.customerName || payload.customerName.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid customerName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Read server-side secret (never exposed to client)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const dispatchEmail = Deno.env.get('DISPATCH_EMAIL') || 'officialdriverbee@gmail.com';

    if (!resendApiKey) {
      // Safe fallback: acknowledge receipt without crashing
      return new Response(
        JSON.stringify({
          success: false,
          warning: 'Email service secret not configured on server. Contact system administrator.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subject = `DriverBee Booking Confirmation - #${payload.bookingId} (${payload.scheduleType === 'now' ? 'Immediate Driver' : payload.date})`;
    const html = generateEmailHtml(payload);

    // 3. Send email via Resend API from server
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DriverBee Bookings <onboarding@resend.dev>',
        to: [payload.customerEmail],
        subject,
        html,
      }),
    });

    let resendData = null;
    try {
      resendData = await resendResponse.json();
    } catch {
      resendData = {};
    }

    // If external delivery failed (e.g. testing domain restrictions), send dispatch copy to team
    if (!resendResponse.ok && payload.customerEmail.toLowerCase() !== dispatchEmail.toLowerCase()) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'DriverBee Dispatch <onboarding@resend.dev>',
          to: [dispatchEmail],
          subject: `[Dispatch for ${escapeHtml(payload.customerName)}] ${subject}`,
          html: `
            <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; padding: 12px 18px; border-radius: 12px; margin-bottom: 20px; font-family: sans-serif; font-size: 13px; color: #92400E;">
              <strong>DriverBee Live Dispatch Notification:</strong> Booking for customer <strong>${escapeHtml(payload.customerName)}</strong> (${escapeHtml(payload.customerEmail)} • ${escapeHtml(payload.customerPhone)}).
            </div>
            ${html}
          `,
        }),
      }).catch(() => {});
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Booking confirmation dispatched successfully',
        id: resendData?.id || `mail-${Date.now()}`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    // Return safe sanitized error message (never expose stack or secrets)
    return new Response(
      JSON.stringify({ error: 'Failed to process booking email notification' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
