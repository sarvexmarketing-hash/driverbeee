import crypto from 'node:crypto';

// ─── WhatsApp Business Cloud API Types & Service ─────────────────────────────

export interface WhatsAppConfig {
  enabled: boolean;
  apiVersion: string;
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  adminPhoneNumbers: string[]; // Allowlist of normalized admin phone numbers
  webhookVerifyToken: string;
  appSecret: string;
  templateName: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
  raw?: any;
}

export interface DBBookingLike {
  id: string;
  customer_name: string;
  customer_phone?: string | null;
  customer_email?: string | null;
  trip_type: string;
  duration: number;
  schedule_type: string;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  transmission?: string | null;
  car_model?: string | null;
  car_plate?: string | null;
  area?: string | null;
  estimated_fare?: number | null;
  status: string;
  notes?: string | null;
  accepted_at?: string | null;
  accepted_by?: string | null;
  rejected_at?: string | null;
  rejected_by?: string | null;
  rejection_reason?: string | null;
}

/**
 * Normalizes phone numbers to standard E.164 digits without '+' or punctuation.
 * E.g., "+91 98450 12345" -> "919845012345", "09845012345" -> "919845012345" (for 10-digit Indian numbers)
 */
export function normalizePhoneNumber(rawPhone: string | null | undefined): string {
  if (!rawPhone) return '';
  let digits = rawPhone.replace(/\D/g, '');
  // If Indian 10-digit mobile, prepend country code 91
  if (digits.length === 10) {
    digits = `91${digits}`;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = `91${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Retrieves WhatsApp configuration safely from environment variables.
 * Sensitive tokens are never leaked to client logs.
 */
export function getWhatsAppConfig(customEnv?: Record<string, string | undefined>): WhatsAppConfig {
  const env = customEnv || (typeof process !== 'undefined' ? process.env : {});
  
  const enabled = (env.WHATSAPP_ENABLED === 'true' || env.WHATSAPP_ENABLED === '1');
  const apiVersion = env.WHATSAPP_API_VERSION || 'v21.0';
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID || '';
  const businessAccountId = env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';
  const accessToken = env.WHATSAPP_ACCESS_TOKEN || '';
  const webhookVerifyToken = env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '';
  const appSecret = env.WHATSAPP_APP_SECRET || '';
  const templateName = env.WHATSAPP_TEMPLATE_NAME || 'new_driver_booking';

  const rawAdminPhones = env.WHATSAPP_ADMIN_PHONE_NUMBER || '';
  const adminPhoneNumbers = rawAdminPhones
    .split(',')
    .map(p => normalizePhoneNumber(p.trim()))
    .filter(p => p.length > 0);

  return {
    enabled,
    apiVersion,
    phoneNumberId,
    businessAccountId,
    accessToken,
    adminPhoneNumbers,
    webhookVerifyToken,
    appSecret,
    templateName,
  };
}

/**
 * Checks whether a sender phone number is authorized in the admin allowlist.
 */
export function isAuthorizedAdmin(phone: string, allowedAdmins: string[]): boolean {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return false;
  return allowedAdmins.some(adminPhone => adminPhone === normalized);
}

/**
 * Verifies HMAC-SHA256 signature from Meta webhook requests.
 * Uses x-hub-signature-256 header.
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader: string | undefined | null,
  appSecret: string
): boolean {
  if (!appSecret) {
    // If no app secret is set in environment, skip signature check in dev mode
    return true;
  }
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }

  const expectedSignature = signatureHeader.slice(7); // remove 'sha256='
  const hmac = crypto.createHmac('sha256', appSecret);
  hmac.update(typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : rawBody);
  const calculatedSignature = hmac.digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf8'),
      Buffer.from(calculatedSignature, 'utf8')
    );
  } catch {
    return false;
  }
}

/**
 * Core WhatsApp Business Cloud API Service
 */
export class WhatsAppService {
  private config: WhatsAppConfig;

  constructor(config?: Partial<WhatsAppConfig>) {
    const baseConfig = getWhatsAppConfig();
    this.config = { ...baseConfig, ...(config || {}) };
  }

  /**
   * Helper to format pickup/drop labels and dates for WhatsApp messages
   */
  public formatBookingSummary(booking: DBBookingLike) {
    const parts = (booking.area || '').split(/[➔\-]>|\➔/).map(s => s.trim());
    const pickup = parts[0] || 'Warangal';
    const drop = parts[1] || parts[0] || 'Warangal Local';
    const date = booking.scheduled_date || (booking.schedule_type === 'now' ? 'Immediate' : 'Today');
    const time = booking.scheduled_time || (booking.schedule_type === 'now' ? 'Immediate (~30 mins)' : 'As scheduled');
    const vehicle = booking.car_model || 'Personal Vehicle';
    const fare = booking.estimated_fare ? `₹${Math.round(booking.estimated_fare)}` : 'Calculated on trip';
    const service = booking.trip_type === 'outside'
      ? `${booking.duration} Day(s) Outstation`
      : booking.trip_type === 'oneway'
      ? `${booking.duration} Hours One Way Drop`
      : `${booking.duration} Hours Local Driver`;

    return { pickup, drop, date, time, vehicle, fare, service };
  }

  /**
   * Generic Meta Cloud API call handler
   */
  private async postToWhatsApp(payload: any): Promise<WhatsAppSendResult> {
    if (!this.config.enabled) {
      console.log('[DriverBee WhatsApp] WhatsApp integration disabled (WHATSAPP_ENABLED=false). Payload simulated.');
      return {
        success: true,
        simulated: true,
        messageId: `sim-msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };
    }

    if (!this.config.accessToken || !this.config.phoneNumberId) {
      const errMsg = 'Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID in environment';
      console.warn(`[DriverBee WhatsApp] Delivery skipped: ${errMsg}`);
      return { success: false, error: errMsg };
    }

    const url = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = responseData?.error?.message || `HTTP ${res.status} ${res.statusText}`;
        console.error('[DriverBee WhatsApp] Meta API error:', {
          status: res.status,
          type: responseData?.error?.type,
          code: responseData?.error?.code,
          message: errorMsg,
        });
        return { success: false, error: errorMsg, raw: responseData };
      }

      const messageId = responseData?.messages?.[0]?.id || `wamid-${Date.now()}`;
      return { success: true, messageId, raw: responseData };
    } catch (err: any) {
      console.error('[DriverBee WhatsApp] Network error connecting to Meta Cloud API:', err.message || err);
      return { success: false, error: err.message || 'Network error' };
    }
  }

  /**
   * Sends an approved Meta Business Template message
   */
  public async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string = 'en_US',
    components: any[] = []
  ): Promise<WhatsAppSendResult> {
    const recipient = normalizePhoneNumber(to);
    if (!recipient) {
      return { success: false, error: 'Invalid recipient phone number' };
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    };

    return this.postToWhatsApp(payload);
  }

  /**
   * Sends a standard text message
   */
  public async sendTextMessage(to: string, text: string): Promise<WhatsAppSendResult> {
    const recipient = normalizePhoneNumber(to);
    if (!recipient) {
      return { success: false, error: 'Invalid recipient phone number' };
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'text',
      text: {
        preview_url: false,
        body: text,
      },
    };

    return this.postToWhatsApp(payload);
  }

  /**
   * Sends an Interactive Button message with up to 3 quick-action buttons
   */
  public async sendInteractiveButtons(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>
  ): Promise<WhatsAppSendResult> {
    const recipient = normalizePhoneNumber(to);
    if (!recipient) {
      return { success: false, error: 'Invalid recipient phone number' };
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: {
          buttons: buttons.slice(0, 3).map(b => ({
            type: 'reply',
            reply: {
              id: b.id,
              title: b.title.slice(0, 20), // Meta limits button title to 20 chars
            },
          })),
        },
      },
    };

    return this.postToWhatsApp(payload);
  }

  /**
   * Sends the New Booking Notification to the authorized admin number.
   * Dispatches interactive buttons [ ACCEPT ] and [ REJECT ].
   * Can use Meta template or interactive buttons payload.
   */
  public async sendBookingNotification(booking: DBBookingLike): Promise<WhatsAppSendResult> {
    if (!this.config.enabled) {
      console.log('[DriverBee WhatsApp] WhatsApp integration disabled (WHATSAPP_ENABLED=false). Admin notification simulated.');
      return {
        success: true,
        simulated: true,
        messageId: `sim-msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };
    }

    const adminPhones = this.config.adminPhoneNumbers;
    if (!adminPhones || adminPhones.length === 0) {
      console.warn('[DriverBee WhatsApp] No WHATSAPP_ADMIN_PHONE_NUMBER configured. Skipping admin WhatsApp dispatch.');
      return { success: false, error: 'No admin phone number configured' };
    }

    const { pickup, drop, date, time, vehicle, fare, service } = this.formatBookingSummary(booking);
    const bookingId = booking.id;
    const customer = booking.customer_name || 'Customer';
    const phone = booking.customer_phone || 'Not provided';

    // 1. If approved template is desired and configured, build template components
    // Template: new_driver_booking with 9 variables and 2 quick-reply buttons
    const templateComponents = [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: bookingId },          // {{1}} Booking ID
          { type: 'text', text: customer },           // {{2}} Customer Name
          { type: 'text', text: phone },              // {{3}} Phone
          { type: 'text', text: pickup },             // {{4}} Pickup
          { type: 'text', text: drop },               // {{5}} Drop
          { type: 'text', text: date },               // {{6}} Date
          { type: 'text', text: time },               // {{7}} Time
          { type: 'text', text: vehicle },            // {{8}} Vehicle
          { type: 'text', text: fare.replace('₹', '') }// {{9}} Amount
        ],
      },
      {
        type: 'button',
        sub_type: 'quick_reply',
        index: '0',
        parameters: [{ type: 'payload', payload: `ACCEPT_${bookingId}` }],
      },
      {
        type: 'button',
        sub_type: 'quick_reply',
        index: '1',
        parameters: [{ type: 'payload', payload: `REJECT_${bookingId}` }],
      },
    ];

    // Formatted fallback text with interactive buttons
    const interactiveBody = [
      '🚗 *NEW DRIVERBEE BOOKING*',
      '',
      `*Booking ID:* ${bookingId}`,
      `*Customer:* ${customer}`,
      `*Phone:* ${phone}`,
      `*Pickup:* ${pickup}`,
      `*Drop:* ${drop}`,
      `*Date:* ${date}`,
      `*Time:* ${time}`,
      `*Vehicle:* ${vehicle}`,
      `*Service:* ${service}`,
      `*Amount:* ${fare}`,
      `*Status:* PENDING`,
      '',
      'Please select an action below:',
    ].join('\n');

    const buttons = [
      { id: `ACCEPT_${bookingId}`, title: 'ACCEPT' },
      { id: `REJECT_${bookingId}`, title: 'REJECT' },
    ];

    // Send to each configured admin
    let lastResult: WhatsAppSendResult = { success: false, error: 'No admin dispatched' };
    for (const adminPhone of adminPhones) {
      // First attempt template message if templateName configured
      if (this.config.templateName && this.config.templateName !== 'none') {
        const tplResult = await this.sendTemplateMessage(adminPhone, this.config.templateName, 'en_US', templateComponents);
        if (tplResult.success) {
          lastResult = tplResult;
          continue;
        }
        console.warn(`[DriverBee WhatsApp] Template dispatch failed, falling back to Interactive Buttons: ${tplResult.error}`);
      }

      // Fallback: Send Interactive Buttons directly
      const btnResult = await this.sendInteractiveButtons(adminPhone, interactiveBody, buttons);
      lastResult = btnResult;
    }

    return lastResult;
  }

  /**
   * Confirms to admin that booking was accepted
   */
  public async sendBookingAcceptedNotification(booking: DBBookingLike, adminPhone: string): Promise<WhatsAppSendResult> {
    const { pickup, drop, time } = this.formatBookingSummary(booking);
    const msg = [
      '✅ *BOOKING ACCEPTED*',
      '',
      `*Booking:* ${booking.id}`,
      `*Customer:* ${booking.customer_name}`,
      `*Pickup:* ${pickup}`,
      `*Drop:* ${drop}`,
      `*Time:* ${time}`,
      '',
      'The booking has been accepted successfully. Status updated to ACCEPTED in Admin Dashboard.',
    ].join('\n');

    return this.sendTextMessage(adminPhone, msg);
  }

  /**
   * Confirms to admin that booking was rejected
   */
  public async sendBookingRejectedNotification(booking: DBBookingLike, adminPhone: string): Promise<WhatsAppSendResult> {
    const msg = [
      '❌ *BOOKING REJECTED*',
      '',
      `*Booking:* ${booking.id}`,
      '',
      'The booking has been rejected. Customer notification dispatched.',
    ].join('\n');

    return this.sendTextMessage(adminPhone, msg);
  }

  /**
   * Sends status update alert to the customer
   */
  public async sendCustomerStatusNotification(
    booking: DBBookingLike,
    status: 'accepted' | 'rejected'
  ): Promise<WhatsAppSendResult> {
    if (!booking.customer_phone) {
      return { success: false, error: 'No customer phone available' };
    }

    const { pickup, drop, date, time } = this.formatBookingSummary(booking);

    if (status === 'accepted') {
      const text = [
        '✅ *DriverBee Booking Confirmed*',
        '',
        `*Booking ID:* ${booking.id}`,
        '',
        'Your booking has been accepted! Our operations team has assigned a verified professional driver for your trip.',
        '',
        `*Pickup:* ${pickup}`,
        `*Drop:* ${drop}`,
        `*Date:* ${date}`,
        `*Time:* ${time}`,
        '',
        'Need help? Call +91 75694 02288.',
      ].join('\n');
      return this.sendTextMessage(booking.customer_phone, text);
    } else {
      const text = [
        '❌ *DriverBee Booking Update*',
        '',
        `*Booking ID:* ${booking.id}`,
        '',
        'Unfortunately, your booking could not be accepted at this time due to driver availability in your sector.',
        '',
        'Please try another time or create a new booking on driverbee.in.',
        'Support hotline: +91 75694 02288.',
      ].join('\n');
      return this.sendTextMessage(booking.customer_phone, text);
    }
  }
}

// Export singleton instance initialized with current environment
export const whatsappService = new WhatsAppService();
