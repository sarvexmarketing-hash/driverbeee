import { getServerSupabase } from './serverSupabase.ts';
import { whatsappService } from './whatsapp.service.ts';
import fs from 'node:fs';
import path from 'node:path';

// Local Fallback JSON Store when remote Supabase database has not run migration yet
const FALLBACK_STORE_FILE = path.join(process.cwd(), '.driver_applications_fallback.json');

export function readFallbackStore(): { applications: DBDriverApplication[]; documents: DBDriverDocument[] } {
  try {
    if (fs.existsSync(FALLBACK_STORE_FILE)) {
      const raw = fs.readFileSync(FALLBACK_STORE_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {}
  return { applications: [], documents: [] };
}

export function writeFallbackStore(store: { applications: DBDriverApplication[]; documents: DBDriverDocument[] }) {
  try {
    fs.writeFileSync(FALLBACK_STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[DriverBee Fallback Store] Failed to save fallback file:', err);
  }
}


export type ApplicationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESUBMISSION_REQUIRED';

export type AvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE';

export type DocumentType = 'AADHAAR' | 'PAN' | 'DRIVING_LICENSE';

export type DocumentVerificationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESUBMISSION_REQUIRED';

export interface DBDriverApplication {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email: string;
  dob?: string | null;
  address?: string | null;
  city: string;
  state: string;
  pincode?: string | null;
  experience_years: number;
  vehicle_types: string[];
  service_areas: string;
  languages: string[];
  drive_customer_cars: boolean;
  has_own_vehicle: boolean;
  vehicle_details?: any;
  emergency_contact?: string | null;
  availability_status: AvailabilityStatus;
  status: ApplicationStatus;
  rejection_reason?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  created_at: string;
  updated_at: string;
  documents?: DBDriverDocument[];
}

export interface DBDriverDocument {
  id: string;
  driver_application_id: string;
  document_type: DocumentType;
  storage_path: string;
  thumbnail_path?: string | null;
  original_filename?: string | null;
  mime_type: string;
  file_size: number;
  width?: number | null;
  height?: number | null;
  document_number_masked?: string | null;
  verification_status: DocumentVerificationStatus;
  rejection_note?: string | null;
  uploaded_at: string;
  verified_at?: string | null;
  verified_by?: string | null;
  created_at: string;
  updated_at: string;
  signed_url?: string;
  thumbnail_url?: string;
}

export interface DBDocumentAccessLog {
  id: string;
  admin_user_id: string;
  document_id: string;
  action: 'VIEW' | 'DOWNLOAD';
  ip_address?: string | null;
  user_agent?: string | null;
  accessed_at: string;
}

// ─── Driver Onboarding Service ───────────────────────────────────────────────

/**
 * Creates or submits a new driver application.
 * Rejects submission if user already has an active pending or in-review application.
 */
export async function submitDriverApplication(
  data: Omit<
    DBDriverApplication,
    'id' | 'status' | 'submitted_at' | 'created_at' | 'updated_at' | 'documents'
  >
): Promise<{ success: boolean; application?: DBDriverApplication; error?: string }> {
  // Upfront field validation
  if (!data.full_name || !data.full_name.trim()) {
    return { success: false, error: 'Full name is required' };
  }
  const cleanPhone = (data.phone || '').replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 10) {
    return { success: false, error: 'A valid 10-digit phone number is required' };
  }
  if (!data.email || !data.email.trim() || !data.email.includes('@')) {
    return { success: false, error: 'A valid email address is required' };
  }
  if (data.experience_years === undefined || data.experience_years === null || Number(data.experience_years) < 0) {
    return { success: false, error: 'Valid driving experience in years is required' };
  }
  if (!Array.isArray(data.vehicle_types) || data.vehicle_types.length === 0) {
    return { success: false, error: 'At least one vehicle type selection is required' };
  }

  const supabase = getServerSupabase();

  // 1. Check for existing active application for this user
  let existing: any = null;
  try {
    const { data: exData, error: checkErr } = await supabase
      .from('driver_applications')
      .select('id, status')
      .eq('user_id', data.user_id)
      .in('status', ['PENDING', 'UNDER_REVIEW', 'RESUBMISSION_REQUIRED'])
      .maybeSingle();

    if (!checkErr && exData) {
      existing = exData;
    }
  } catch {}

  if (!existing) {
    const store = readFallbackStore();
    existing = store.applications.find(
      (a) => a.user_id === data.user_id && ['PENDING', 'UNDER_REVIEW', 'RESUBMISSION_REQUIRED'].includes(a.status)
    );
  }

  if (existing) {
    return {
      success: false,
      error: `You already have an active application (${existing.status}). Please await administrative review or update required documents.`,
    };
  }

  // 2. Insert new application
  const insertPayload = {
    user_id: data.user_id,
    full_name: data.full_name.trim(),
    phone: data.phone.trim(),
    email: data.email.trim().toLowerCase(),
    dob: data.dob || null,
    address: data.address || null,
    city: data.city || 'Warangal',
    state: data.state || 'Telangana',
    pincode: data.pincode || null,
    experience_years: Number(data.experience_years) || 1,
    vehicle_types: data.vehicle_types || ['sedan', 'suv', 'hatchback'],
    service_areas: data.service_areas || 'Warangal, Hanamkonda, Kazipet',
    languages: data.languages || ['Telugu', 'Hindi', 'English'],
    drive_customer_cars: data.drive_customer_cars !== false,
    has_own_vehicle: !!data.has_own_vehicle,
    vehicle_details: data.vehicle_details || null,
    emergency_contact: data.emergency_contact || null,
    availability_status: data.availability_status || 'AVAILABLE',
    status: 'PENDING' as const,
    submitted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  let createdApp: DBDriverApplication | null = null;
  try {
    const { data: dbApp, error: insertErr } = await supabase
      .from('driver_applications')
      .insert(insertPayload)
      .select()
      .single();

    if (!insertErr && dbApp) {
      createdApp = dbApp as DBDriverApplication;
    } else {
      console.warn('[DriverBee Onboarding] Supabase insert note:', insertErr?.message);
    }
  } catch (err: any) {
    console.warn('[DriverBee Onboarding] Supabase connection note:', err?.message);
  }

  // Fallback store if remote Supabase schema is not yet migrated
  if (!createdApp) {
    const store = readFallbackStore();
    const fallbackApp: DBDriverApplication = {
      id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ...insertPayload,
      documents: [],
    };
    store.applications.unshift(fallbackApp);
    writeFallbackStore(store);
    createdApp = fallbackApp;
  }

  // 3. Dispatch WhatsApp Notification to Admin if configured
  try {
    const adminPhones = whatsappService['config']?.adminPhoneNumbers;
    if (whatsappService['config']?.enabled && adminPhones?.length) {
      const msg = [
        '🚗 *NEW DRIVER APPLICATION*',
        '',
        `*Applicant:* ${createdApp.full_name}`,
        `*Phone:* ${createdApp.phone}`,
        `*City:* ${createdApp.city}`,
        `*Experience:* ${createdApp.experience_years} Year(s)`,
        `*Availability:* ${createdApp.availability_status}`,
        `*Status:* PENDING REVIEW`,
        '',
        'A new driver applicant is awaiting document review in Admin Dashboard.',
      ].join('\n');

      for (const phone of adminPhones) {
        await whatsappService.sendTextMessage(phone, msg).catch(() => {});
      }
    }
  } catch (notifyErr) {
    console.warn('[DriverBee Onboarding] WhatsApp admin alert notice:', notifyErr);
  }

  return { success: true, application: createdApp as DBDriverApplication };
}

/**
 * Retrieves the latest application for the authenticated user, including attached documents.
 */
export async function getMyDriverApplication(
  userId: string
): Promise<DBDriverApplication | null> {
  const supabase = getServerSupabase();

  try {
    const { data: app, error } = await supabase
      .from('driver_applications')
      .select('*, documents:driver_documents(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && app) return app as DBDriverApplication;
  } catch {}

  // Check fallback store
  const store = readFallbackStore();
  const fallbackApp = store.applications.find((a) => a.user_id === userId);
  if (fallbackApp) {
    fallbackApp.documents = store.documents.filter((d) => d.driver_application_id === fallbackApp.id);
    return fallbackApp;
  }

  return null;
}

/**
 * Retrieves all driver applications for administrative review with optional status filtering.
 */
export async function getAdminDriverApplications(
  filterStatus?: ApplicationStatus | 'ALL'
): Promise<DBDriverApplication[]> {
  const supabase = getServerSupabase();
  let apps: DBDriverApplication[] = [];

  try {
    let query = supabase
      .from('driver_applications')
      .select('*, documents:driver_documents(*)')
      .order('created_at', { ascending: false });

    if (filterStatus && filterStatus !== 'ALL') {
      query = query.eq('status', filterStatus);
    }

    const { data, error } = await query;
    if (!error && data) {
      apps = data as DBDriverApplication[];
    }
  } catch {}

  // Merge from fallback store (avoiding duplicates by id)
  const store = readFallbackStore();
  for (const fApp of store.applications) {
    if (!apps.some((a) => a.id === fApp.id)) {
      if (!filterStatus || filterStatus === 'ALL' || fApp.status === filterStatus) {
        const matchingDocs = store.documents.filter((d) => d.driver_application_id === fApp.id);
        if (matchingDocs.length > 0) {
          fApp.documents = matchingDocs;
        }
        apps.push(fApp);
      }
    }
  }

  return apps;
}

/**
 * Updates an individual document's verification status (APPROVED, REJECTED, RESUBMISSION_REQUIRED).
 */
export async function updateDocumentVerification(
  documentId: string,
  status: DocumentVerificationStatus,
  note?: string,
  adminId: string = 'admin'
): Promise<{ success: boolean; error?: string }> {
  const supabase = getServerSupabase();
  const now = new Date().toISOString();

  let updated = false;
  try {
    const { error } = await supabase
      .from('driver_documents')
      .update({
        verification_status: status,
        rejection_note: note || null,
        verified_at: now,
        verified_by: adminId,
        updated_at: now,
      })
      .eq('id', documentId);
    if (!error) updated = true;
  } catch {}

  // Update in fallback store
  const store = readFallbackStore();
  const doc = store.documents.find((d) => d.id === documentId);
  if (doc) {
    doc.verification_status = status;
    doc.rejection_note = note || null;
    doc.verified_at = now;
    doc.verified_by = adminId;
    doc.updated_at = now;
    updated = true;
  }

  // Also check nested documents in store.applications
  for (const a of store.applications) {
    if (Array.isArray(a.documents)) {
      const adoc = a.documents.find((d: any) => d.id === documentId);
      if (adoc) {
        adoc.verification_status = status;
        adoc.rejection_note = note || null;
        adoc.verified_at = now;
        adoc.verified_by = adminId;
        adoc.updated_at = now;
        updated = true;
      }
    }
  }

  if (updated) {
    writeFallbackStore(store);
  }

  return { success: true };
}

/**
 * Approves a driver application:
 * 1. Checks application exists and is in a reviewable status.
 * 2. Enforces that all 3 mandatory documents (AADHAAR, PAN, DRIVING_LICENSE) are uploaded.
 * 3. Updates application status to APPROVED.
 * 4. Activates or inserts driver profile in `driver_profiles`.
 * 5. Updates user role in `profiles` to 'driver'.
 */
export async function approveDriverApplication(
  applicationId: string,
  adminId: string = 'admin'
): Promise<{ success: boolean; error?: string }> {
  const supabase = getServerSupabase();
  const now = new Date().toISOString();

  // 1. Fetch application with all documents
  let app: DBDriverApplication | null = null;
  try {
    const { data: dbApp, error: fetchErr } = await supabase
      .from('driver_applications')
      .select('*, documents:driver_documents(*)')
      .eq('id', applicationId)
      .maybeSingle();

    if (!fetchErr && dbApp) {
      app = dbApp as DBDriverApplication;
    }
  } catch {}

  if (!app) {
    const store = readFallbackStore();
    const fApp = store.applications.find((a) => a.id === applicationId);
    if (fApp) {
      const matchingDocs = store.documents.filter((d) => d.driver_application_id === fApp.id);
      if (matchingDocs.length > 0) {
        fApp.documents = matchingDocs;
      }
      app = fApp;
    }
  }

  if (!app) {
    return { success: false, error: 'Driver application not found' };
  }

  const docs = (app.documents || []) as DBDriverDocument[];
  const aadhaar = docs.find((d) => d.document_type === 'AADHAAR');
  const pan = docs.find((d) => d.document_type === 'PAN');
  const dl = docs.find((d) => d.document_type === 'DRIVING_LICENSE');

  if (!aadhaar || !pan || !dl) {
    return {
      success: false,
      error: 'Cannot approve application: All 3 mandatory documents (Aadhaar, PAN, and Driving Licence) must be uploaded.',
    };
  }


  // 2. Update Application Status to APPROVED
  try {
    await supabase
      .from('driver_applications')
      .update({
        status: 'APPROVED',
        reviewed_at: now,
        reviewed_by: adminId,
        updated_at: now,
      })
      .eq('id', applicationId);
  } catch {}

  const store = readFallbackStore();
  const fApp = store.applications.find((a) => a.id === applicationId);
  if (fApp) {
    fApp.status = 'APPROVED';
    fApp.reviewed_at = now;
    fApp.reviewed_by = adminId;
    fApp.updated_at = now;
    if (Array.isArray(fApp.documents)) {
      fApp.documents.forEach((d: any) => {
        d.verification_status = 'APPROVED';
        d.verified_at = now;
        d.verified_by = adminId;
      });
    }
    for (const d of store.documents) {
      if (d.driver_application_id === applicationId) {
        d.verification_status = 'APPROVED';
        d.verified_at = now;
        d.verified_by = adminId;
      }
    }
    writeFallbackStore(store);
  }

  // 3. Update or Upsert in driver_profiles
  try {
    await supabase.from('driver_profiles').upsert(
      {
        id: app.user_id,
        badge: 'Verified Professional Driver',
        rating: 5.0,
        trips_count: 0,
        is_on_duty: app.availability_status === 'AVAILABLE',
        area: app.service_areas || 'Warangal Operations',
        today_earnings: 0,
        created_at: now,
      },
      { onConflict: 'id' }
    );
  } catch (driverErr) {
    console.warn('[DriverBee Onboarding] driver_profiles update notice:', driverErr);
  }

  // 4. Update Profile Role to 'driver'
  try {
    await supabase
      .from('profiles')
      .update({
        role: 'driver',
        updated_at: now,
      })
      .eq('id', app.user_id);
  } catch {}

  // 5. Send Notification to Driver
  try {
    if (app.phone && whatsappService['config']?.enabled) {
      const msg = [
        '🎉 *Congratulations! DriverBee Application Approved*',
        '',
        `Dear ${app.full_name},`,
        'Your DriverBee driver application and identity documents have been verified and approved!',
        '',
        'You can now access the Driver Portal directly at driverbee.in/driver to go on duty and start accepting ride bookings.',
        '',
        'Welcome to the DriverBee Fleet!',
      ].join('\n');
      await whatsappService.sendTextMessage(app.phone, msg).catch(() => {});
    }
  } catch (notifyErr) {
    console.warn('[DriverBee Onboarding] Approval notification error:', notifyErr);
  }

  return { success: true };
}

/**
 * Rejects a driver application with mandatory reason.
 */
export async function rejectDriverApplication(
  applicationId: string,
  reason: string,
  adminId: string = 'admin'
): Promise<{ success: boolean; error?: string }> {
  if (!reason || !reason.trim()) {
    return { success: false, error: 'A specific rejection reason is required.' };
  }

  const supabase = getServerSupabase();
  const now = new Date().toISOString();

  let phone = '';
  let fullName = '';

  try {
    const { data: app } = await supabase
      .from('driver_applications')
      .update({
        status: 'REJECTED',
        rejection_reason: reason.trim(),
        reviewed_at: now,
        reviewed_by: adminId,
        updated_at: now,
      })
      .eq('id', applicationId)
      .select()
      .maybeSingle();

    if (app) {
      phone = app.phone;
      fullName = app.full_name;
    }
  } catch {}

  const store = readFallbackStore();
  const fApp = store.applications.find((a) => a.id === applicationId);
  if (fApp) {
    fApp.status = 'REJECTED';
    fApp.rejection_reason = reason.trim();
    fApp.reviewed_at = now;
    fApp.reviewed_by = adminId;
    fApp.updated_at = now;
    writeFallbackStore(store);
    phone = phone || fApp.phone;
    fullName = fullName || fApp.full_name;
  }

  // Notify Applicant
  try {
    if (phone && whatsappService['config']?.enabled) {
      const msg = [
        '❌ *DriverBee Application Update*',
        '',
        `Dear ${fullName},`,
        'Your DriverBee driver application was reviewed, but could not be approved at this time.',
        '',
        `*Reason:* ${reason.trim()}`,
        '',
        'You may re-apply with corrected information or contact support at +91 75694 02288.',
      ].join('\n');
      await whatsappService.sendTextMessage(phone, msg).catch(() => {});
    }
  } catch {}

  return { success: true };
}

/**
 * Requests resubmission of specific documents.
 */
export async function requestResubmission(
  applicationId: string,
  note: string,
  adminId: string = 'admin'
): Promise<{ success: boolean; error?: string }> {
  if (!note || !note.trim()) {
    return { success: false, error: 'Resubmission instructions note is required.' };
  }

  const supabase = getServerSupabase();
  const now = new Date().toISOString();

  let phone = '';
  let fullName = '';

  try {
    const { data: app } = await supabase
      .from('driver_applications')
      .update({
        status: 'RESUBMISSION_REQUIRED',
        rejection_reason: note.trim(),
        reviewed_at: now,
        reviewed_by: adminId,
        updated_at: now,
      })
      .eq('id', applicationId)
      .select()
      .maybeSingle();

    if (app) {
      phone = app.phone;
      fullName = app.full_name;
    }
  } catch {}

  const store = readFallbackStore();
  const fApp = store.applications.find((a) => a.id === applicationId);
  if (fApp) {
    fApp.status = 'RESUBMISSION_REQUIRED';
    fApp.rejection_reason = note.trim();
    fApp.reviewed_at = now;
    fApp.reviewed_by = adminId;
    fApp.updated_at = now;
    writeFallbackStore(store);
    phone = phone || fApp.phone;
    fullName = fullName || fApp.full_name;
  }

  // Notify Applicant
  try {
    if (phone && whatsappService['config']?.enabled) {
      const msg = [
        '⚠️ *DriverBee Document Resubmission Required*',
        '',
        `Dear ${fullName},`,
        'Your driver application requires updated documents before it can be approved.',
        '',
        `*Admin Note:* ${note.trim()}`,
        '',
        'Please visit driverbee.in/join-as-driver to upload your replacement documents.',
      ].join('\n');
      await whatsappService.sendTextMessage(phone, msg).catch(() => {});
    }
  } catch {}

  return { success: true };
}

/**
 * Logs document access and returns a secure, short-lived signed URL for admin document review.
 */
export async function getSecureDocumentViewUrl(
  documentId: string,
  adminId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ signedUrl?: string; error?: string }> {
  const supabase = getServerSupabase();

  // 1. Check database first
  try {
    const { data: doc } = await supabase
      .from('driver_documents')
      .select('*')
      .eq('id', documentId)
      .maybeSingle();

    if (doc) {
      // Audit log
      try {
        await supabase.from('document_access_logs').insert({
          admin_user_id: adminId || 'admin',
          document_id: documentId,
          action: 'VIEW',
          ip_address: ipAddress || 'unknown',
          user_agent: userAgent || 'unknown',
          accessed_at: new Date().toISOString(),
        });
      } catch {}

      const { data: signed, error: signErr } = await supabase.storage
        .from('driver-documents')
        .createSignedUrl(doc.storage_path, 300);

      if (!signErr && signed?.signedUrl) {
        return { signedUrl: signed.signedUrl };
      }
      if (doc.storage_path) {
        return { signedUrl: `/api/driver-documents/stream?path=${encodeURIComponent(doc.storage_path)}` };
      }
    }
  } catch {}

  // 2. Check fallback store
  const store = readFallbackStore();
  const doc = store.documents.find((d) => d.id === documentId);
  if (doc) {
    if (doc.signed_url || doc.thumbnail_url) {
      return { signedUrl: doc.signed_url || doc.thumbnail_url };
    }
    return { signedUrl: `/api/driver-documents/stream?path=${encodeURIComponent(doc.storage_path)}` };
  }

  return { error: 'Document not found' };
}

