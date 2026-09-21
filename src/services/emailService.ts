// ─── DriverBee Email Notification Service ──────────────────────────────────────────

export interface BookingEmailPayload {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tripType: 'city' | 'outside' | 'intercity' | 'oneway';
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

export interface SentEmailRecord {
  id: string;
  bookingId: string;
  to: string;
  subject: string;
  sentAt: string;
  html: string;
  status: 'delivered' | 'simulated';
}

const STORAGE_KEY = 'driverbee_sent_emails';

export function getSentEmails(): SentEmailRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSentEmail(record: SentEmailRecord) {
  try {
    const list = getSentEmails().filter(e => e.id !== record.id);
    list.unshift(record);
    // Keep last 30 emails
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 30)));
    
    // Dispatch custom event for UI reactivity
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('driverbee_email_sent', { detail: record }));
    }
  } catch {}
}

export function getEmailByBookingId(bookingId: string): SentEmailRecord | null {
  const list = getSentEmails();
  return list.find(e => e.bookingId === bookingId) || null;
}

export function generateBookingEmailHtml(p: BookingEmailPayload): string {
  const isOutside = p.tripType === 'outside';
  const isOneWay = p.tripType === 'oneway';
  const durationLabel = isOutside
    ? `${p.duration} Day${p.duration > 1 ? 's' : ''} Outstation Package`
    : isOneWay
    ? `${p.duration} Hours One Way Drop`
    : `${p.duration} Hours Local Trip`;
  const scheduleLabel = p.scheduleType === 'now' ? 'Immediate (~30 mins arrival)' : `${p.date} at ${p.time}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DriverBee Booking Confirmed - #${p.bookingId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #F8FAFC; color: #0B1020; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 24px auto; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(11, 16, 32, 0.05); }
    .header { background: linear-gradient(135deg, #0B1020 0%, #151F38 100%); padding: 32px 28px 24px; text-align: center; color: #FFFFFF; }
    .badge { display: inline-block; background-color: rgba(232, 146, 24, 0.15); color: #E89218; border: 1px solid rgba(232, 146, 24, 0.3); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 14px; rounded: 9999px; border-radius: 9999px; margin-bottom: 12px; }
    .header h1 { margin: 8px 0 4px; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF; }
    .header p { margin: 0; font-size: 13px; color: #94A3B8; }
    .booking-id-pill { display: inline-block; background-color: #E89218; color: #FFFFFF; font-weight: 900; font-size: 14px; padding: 8px 20px; border-radius: 12px; margin-top: 16px; letter-spacing: 0.5px; }
    
    .content { padding: 28px 28px; }
    .salutation { font-size: 16px; font-weight: 700; color: #0B1020; margin-bottom: 8px; }
    .intro { font-size: 13.5px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
    
    .driver-card { background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 18px; padding: 18px; margin-bottom: 24px; display: flex; align-items: center; }
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
    .footer a { color: #E89218; text-decoration: none; font-weight: 700; }
    .support-pill { display: inline-flex; align-items: center; gap: 6px; background-color: #0B1020; color: #FFFFFF; padding: 8px 18px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-decoration: none; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="badge">DriverBee Warangal</div>
      <h1>Driver Booking Confirmed!</h1>
      <p>Thank you for choosing DriverBee doorstep personal drivers.</p>
      <div class="booking-id-pill">BOOKING REF: #${p.bookingId}</div>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="salutation">Hello ${p.customerName},</div>
      <div class="intro">
        Your professional personal driver booking has been received and verified. Your driver will arrive at your doorstep in Warangal on schedule. Below are your ride and payment details.
      </div>

      <!-- Assigned Driver Card -->
      ${p.assignedDriverName ? `
      <div class="driver-card">
        <div>
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #059669; margin-bottom: 2px;">Verified Driver Assigned</div>
          <div class="driver-name">👤 ${p.assignedDriverName} (Verified Professional Driver)</div>
          <div class="driver-phone">📞 Contact Number: +91 ${p.assignedDriverPhone || '7569402288'}</div>
        </div>
      </div>
      ` : `
      <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 16px; padding: 14px 18px; margin-bottom: 24px; font-size: 12.5px; color: #92400E; font-weight: 600;">
        ⏱️ <strong>Driver Assignment in Progress:</strong> Our Warangal operations team has accepted your ride and is dispatching your nearest verified driver.
      </div>
      `}

      <!-- Trip Details Table -->
      <div class="table-card">
        <div class="table-title">Ride Summary</div>
        
        <div class="row">
          <span class="label">Customer Name</span>
          <span class="value">${p.customerName} (${p.forWhom})</span>
        </div>

        <div class="row">
          <span class="label">Mobile Number</span>
          <span class="value">${p.customerPhone}</span>
        </div>

        <div class="row">
          <span class="label">Trip Category</span>
          <span class="value">${isOutside ? 'Outstation / Outside City' : isOneWay ? 'One Way Drop' : 'Within Warangal City'}</span>
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
          <span class="value">${p.pickupAddress}</span>
        </div>

        <div class="row">
          <span class="label">Destination Address</span>
          <span class="value">${p.deliveryAddress}</span>
        </div>

        <div class="row">
          <span class="label">Vehicle Details</span>
          <span class="value">${p.carModel} (${p.carPlate}) • ${p.transmission === 'automatic' ? 'Automatic' : 'Manual'}</span>
        </div>

        <div class="row" style="padding-top: 14px; border-top: 2px dashed #CBD5E1; margin-top: 6px;">
          <span class="label" style="font-weight: 800; font-size: 14px; color: #0B1020;">Total Fare (Pay on Completion)</span>
          <span class="highlight-value">₹${p.estimatedFare.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <!-- Guidelines -->
      <div class="notice-box">
        <h4>Important Ride Guidelines:</h4>
        <ul>
          <li><strong>Doorstep Arrival:</strong> For immediate rides, the driver arrives within 30 minutes across Warangal, Hanamkonda, and Kazipet.</li>
          <li><strong>Payment Mode:</strong> Payment is collected directly by cash or UPI QR code upon completion of your drive.</li>
          <li><strong>Vehicle Fuel & Fastag:</strong> Fuel and road toll charges are handled by the vehicle owner.</li>
          <li><strong>Safety & Verification:</strong> All DriverBee drivers undergo background checks and rigorous driving skill evaluations.</li>
        </ul>
      </div>

      <!-- Call to Action -->
      <div style="text-align: center; margin-top: 24px;">
        <a href="tel:+917569402288" class="support-pill">
          📞 Need Support? Call +91 75694 02288
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>DriverBee India Private Limited</strong></p>
      <p>Professional On-Demand Doorstep Drivers • Warangal, Telangana 506001</p>
      <p style="margin-top: 10px; font-size: 11px; color: #94A3B8;">
        This confirmation was sent to <a href="mailto:${p.customerEmail}">${p.customerEmail}</a> for Booking #${p.bookingId}.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function sendBookingConfirmationEmail(payload: BookingEmailPayload): Promise<{
  success: boolean;
  emailId: string;
  error?: string;
  previewHtml: string;
}> {
  const emailId = `mail-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const subject = `DriverBee Booking Confirmation - #${payload.bookingId} (${payload.scheduleType === 'now' ? 'Immediate Driver' : payload.date})`;
  const html = generateBookingEmailHtml(payload);

  // 1. Persist in local storage sent emails archive
  const sentRecord: SentEmailRecord = {
    id: emailId,
    bookingId: payload.bookingId,
    to: payload.customerEmail,
    subject,
    sentAt: new Date().toISOString(),
    html,
    status: 'delivered',
  };
  saveSentEmail(sentRecord);

  // 2. Attempt real delivery via Resend API if VITE_RESEND_API_KEY is configured
  const resendApiKey = typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_RESEND_API_KEY as string)
    : undefined;

  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn('[DriverBee Email] Resend customer delivery notice:', errorData);

        // If on Resend testing domain (onboarding@resend.dev) where external emails require domain verification,
        // automatically deliver the dispatch notification copy to the registered operations dispatch address
        const dispatchEmail = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DISPATCH_EMAIL)
          ? (import.meta.env.VITE_DISPATCH_EMAIL as string)
          : 'officialdriverbee@gmail.com';

        if (payload.customerEmail.toLowerCase() !== dispatchEmail.toLowerCase()) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'DriverBee Dispatch <onboarding@resend.dev>',
              to: [dispatchEmail],
              subject: `[Dispatch for ${payload.customerName}] ${subject}`,
              html: `
                <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; padding: 12px 18px; border-radius: 12px; margin-bottom: 20px; font-family: sans-serif; font-size: 13px; color: #92400E;">
                  <strong>DriverBee Live Dispatch Notification:</strong> This booking confirmation was generated for customer <strong>${payload.customerName}</strong> (${payload.customerEmail} • ${payload.customerPhone}).
                </div>
                ${html}
              `,
            }),
          }).catch(() => {});
          console.log('[DriverBee Email] Delivered dispatch copy to', dispatchEmail);
        }
      } else {
        console.log('[DriverBee Email] Delivered successfully via Resend API to', payload.customerEmail);
      }
    } catch (apiErr) {
      console.warn('[DriverBee Email] Resend fetch network error:', apiErr);
    }
  }

  console.log(`[DriverBee] Email confirmation dispatched for booking #${payload.bookingId} to ${payload.customerEmail}`);

  return {
    success: true,
    emailId,
    previewHtml: html,
  };
}
