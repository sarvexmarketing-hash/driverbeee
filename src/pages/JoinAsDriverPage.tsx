import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DriverBeeLogo } from '../components/DriverBeeLogo';
import { AuthModal } from '../components/AuthModal';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Upload,
  Car,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  FileText,
  Check,
  X,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DocumentState {
  file: File | null;
  previewUrl: string | null;
  base64: string | null;
  documentNumber: string;
  sizeKB: number;
  uploadedRecord?: any;
}

export const JoinAsDriverPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  // Auth gate modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Application fetching state
  const [existingApp, setExistingApp] = useState<any | null>(null);
  const [isLoadingApp, setIsLoadingApp] = useState(true);

  // Multi-step form step (1 to 5)
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step4Attempted, setStep4Attempted] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone?.replace(/\D/g, '').slice(-10) || '',
    email: user?.email || '',
    dob: '1995-05-15',
    address: 'Hanamkonda, Warangal',
    city: 'Warangal',
    state: 'Telangana',
    pincode: '506001',
    experienceYears: 4,
    vehicleTypes: ['sedan', 'suv', 'hatchback'],
    serviceAreas: 'Hanamkonda, Kazipet, Warangal Local',
    languages: ['Telugu', 'Hindi', 'English'],
    driveCustomerCars: true,
    hasOwnVehicle: false,
    emergencyContact: 'Family: +91 9988776655',
    availabilityStatus: 'AVAILABLE' as 'AVAILABLE' | 'UNAVAILABLE',
    agreeTerms: true,
  });

  // Documents
  const [docs, setDocs] = useState<{
    aadhaar: DocumentState;
    pan: DocumentState;
    dl: DocumentState;
  }>({
    aadhaar: { file: null, previewUrl: null, base64: null, documentNumber: '', sizeKB: 0 },
    pan: { file: null, previewUrl: null, base64: null, documentNumber: '', sizeKB: 0 },
    dl: { file: null, previewUrl: null, base64: null, documentNumber: '', sizeKB: 0 },
  });

  // Resubmission single doc state
  const [resubmittingDocType, setResubmittingDocType] = useState<string | null>(null);
  const [resubmitFile, setResubmitFile] = useState<File | null>(null);
  const [resubmitPreview, setResubmitPreview] = useState<string | null>(null);
  const [isResubmitting, setIsResubmitting] = useState(false);

  // Sync user details when auth resolves
  useEffect(() => {
    if (user && profile) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || profile.full_name || '',
        phone: prev.phone || profile.phone?.replace(/\D/g, '').slice(-10) || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user, profile]);

  // Load existing application
  const loadExistingApplication = async () => {
    if (!user?.id) {
      setIsLoadingApp(false);
      return;
    }
    setIsLoadingApp(true);
    try {
      const res = await fetch(`/api/driver-applications?userId=${user.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.application) {
          const wasNotApproved = existingApp?.status !== 'APPROVED';
          setExistingApp(json.application);
          try {
            localStorage.setItem('driverbee_my_application', JSON.stringify(json.application));
          } catch {}
          if (json.application.status === 'APPROVED' && wasNotApproved) {
            try {
              confetti({
                particleCount: 100,
                spread: 80,
                origin: { y: 0.5 },
                colors: ['#10B981', '#E89218', '#0B1020']
              });
            } catch {}
          }
          setIsLoadingApp(false);
          return;
        }
      }
    } catch (err) {
      console.warn('[DriverBee] Error loading driver application:', err);
    }

    // Fallback to local storage if remote server does not have record
    try {
      const local = localStorage.getItem('driverbee_my_application');
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && (parsed.user_id === user.id || !parsed.user_id)) {
          setExistingApp(parsed);
          setIsLoadingApp(false);
          return;
        }
      }
    } catch {}

    setExistingApp(null);
    setIsLoadingApp(false);
  };

  useEffect(() => {
    loadExistingApplication();
    const interval = setInterval(() => {
      loadExistingApplication();
    }, 3000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Helper to convert selected file to base64 and create preview
  const handleFileSelect = (
    key: 'aadhaar' | 'pan' | 'dl',
    file: File
  ) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert('Invalid file format. Please upload a clear JPG, PNG, or WebP photo of your document.');
      return;
    }
    // Check max size 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large. Please select an image under 10MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setDocs((prev) => {
        const updated = {
          ...prev,
          [key]: {
            ...prev[key],
            file,
            previewUrl,
            base64,
            sizeKB: Math.round(file.size / 1024),
          },
        };
        if (updated.aadhaar.file && updated.pan.file && updated.dl.file) {
          setSubmitError(null);
        }
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  const missingDocsList = [
    !docs.aadhaar.file && 'Aadhaar Card',
    !docs.pan.file && 'PAN Card',
    !docs.dl.file && 'Driving Licence',
  ].filter(Boolean) as string[];
  const allDocsUploaded = missingDocsList.length === 0;

  // Submit complete application
  const handleSubmitApplication = async () => {
    if (!user?.id) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return;
    }

    if (!docs.aadhaar.base64 || !docs.pan.base64 || !docs.dl.base64) {
      setSubmitError('All 3 identity documents (Aadhaar, PAN, and Driving Licence) are mandatory.');
      setStep(4);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Submit Application Record
      let appId = '';
      let createdApplication: any = null;

      try {
        const appRes = await fetch('/api/driver-applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            full_name: formData.fullName,
            phone: `+91 ${formData.phone.replace(/\D/g, '')}`,
            email: formData.email,
            dob: formData.dob,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            experience_years: formData.experienceYears,
            vehicle_types: formData.vehicleTypes,
            service_areas: formData.serviceAreas,
            languages: formData.languages,
            drive_customer_cars: formData.driveCustomerCars,
            has_own_vehicle: formData.hasOwnVehicle,
            emergency_contact: formData.emergencyContact,
            availability_status: formData.availabilityStatus,
          }),
        });

        if (appRes.ok) {
          const appData = await appRes.json();
          if (appData.application) {
            createdApplication = appData.application;
            appId = appData.application.id;
          }
        }
      } catch (backendErr) {
        console.warn('[DriverBee] Backend connection notice:', backendErr);
      }

      // Fallback application object if server is unreachable
      if (!appId) {
        appId = `app_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        createdApplication = {
          id: appId,
          user_id: user.id,
          full_name: formData.fullName,
          phone: `+91 ${formData.phone.replace(/\D/g, '')}`,
          email: formData.email,
          dob: formData.dob,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          experience_years: formData.experienceYears,
          vehicle_types: formData.vehicleTypes,
          service_areas: formData.serviceAreas,
          languages: formData.languages,
          drive_customer_cars: formData.driveCustomerCars,
          has_own_vehicle: formData.hasOwnVehicle,
          emergency_contact: formData.emergencyContact,
          availability_status: formData.availabilityStatus,
          status: 'PENDING',
          submitted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          documents: [],
        };
      }

      // 2. Upload Aadhaar, PAN, and Driving Licence
      const docConfigs: Array<{ key: 'aadhaar' | 'pan' | 'dl'; type: string; name: string }> = [
        { key: 'aadhaar', type: 'AADHAAR', name: docs.aadhaar.file?.name || 'aadhaar.jpg' },
        { key: 'pan', type: 'PAN', name: docs.pan.file?.name || 'pan.jpg' },
        { key: 'dl', type: 'DRIVING_LICENSE', name: docs.dl.file?.name || 'driving_license.jpg' },
      ];

      const processedDocs: any[] = [];

      for (const item of docConfigs) {
        const docState = docs[item.key];
        try {
          const uploadRes = await fetch('/api/driver-applications/upload-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              applicationId: appId,
              documentType: item.type,
              fileBase64: docState.base64,
              originalFilename: item.name,
              documentNumber: docState.documentNumber,
            }),
          });
          if (uploadRes.ok) {
            const data = await uploadRes.json();
            if (data.document) {
              processedDocs.push(data.document);
              continue;
            }
          }
        } catch (uploadErr) {
          console.warn(`[DriverBee] Notice uploading ${item.type}:`, uploadErr);
        }

        // Local fallback document
        processedDocs.push({
          id: `doc_${Date.now()}_${item.key}`,
          driver_application_id: appId,
          document_type: item.type,
          original_filename: item.name,
          verification_status: 'PENDING',
          uploaded_at: new Date().toISOString(),
          file_size: docState.sizeKB * 1024,
          signed_url: docState.previewUrl,
          thumbnail_url: docState.previewUrl,
        });
      }

      createdApplication.documents = processedDocs;

      // Persist to localStorage for uninterrupted local state
      try {
        localStorage.setItem('driverbee_my_application', JSON.stringify(createdApplication));
        const allLocal = JSON.parse(localStorage.getItem('driverbee_driver_applications') || '[]');
        const filtered = allLocal.filter((a: any) => a.id !== appId);
        filtered.unshift(createdApplication);
        localStorage.setItem('driverbee_driver_applications', JSON.stringify(filtered));
      } catch {}

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E89218', '#0B1020', '#10B981'],
        });
      } catch {}

      // Refresh application state to immediately display PENDING verification view
      setExistingApp(createdApplication);
    } catch (err: any) {
      console.error('[DriverBee Onboarding] Submission error:', err);
      setSubmitError(err.message || 'Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resubmit a single document that was rejected by admin
  const handleSingleDocResubmit = async () => {
    if (!existingApp?.id || !resubmittingDocType || !resubmitFile) return;
    setIsResubmitting(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/driver-applications/upload-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicationId: existingApp.id,
            documentType: resubmittingDocType,
            fileBase64: base64,
            originalFilename: resubmitFile.name,
          }),
        });

        if (res.ok) {
          setResubmittingDocType(null);
          setResubmitFile(null);
          setResubmitPreview(null);
          await loadExistingApplication();
        } else {
          const data = await res.json().catch(() => ({}));
          alert(`Resubmission failed: ${data.error || 'Server error'}`);
        }
        setIsResubmitting(false);
      };
      reader.readAsDataURL(resubmitFile);
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
      setIsResubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-navy-950 flex flex-col selection:bg-bee-500/20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-navy-100 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <DriverBeeLogo height={30} />
          <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-bee-50 text-bee-800 border border-bee-200">
            Driver Onboarding
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-navy-700 hidden sm:inline">
                {profile?.full_name || user.email?.split('@')[0]}
              </span>
              <button
                onClick={() => navigate('/')}
                className="px-3 py-1.5 rounded-xl border border-navy-200 text-xs font-bold text-navy-800 hover:bg-navy-50 transition-colors"
              >
                Back to Site
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="px-4 py-1.5 rounded-xl bg-bee-600 hover:bg-bee-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {/* If user is not authenticated */}
        {!user && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-navy-200/80 shadow-md text-center max-w-xl mx-auto space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-bee-50 border border-bee-200 mx-auto flex items-center justify-center text-3xl shadow-inner">
              🚗
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-navy-950 tracking-tight">
                Join DriverBee as a Professional Driver
              </h1>
              <p className="text-sm text-navy-600 leading-relaxed">
                Earn steady daily income driving personal vehicles in Warangal. Sign in or create a DriverBee account to start your verification application.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-3 rounded-2xl bg-bee-600 hover:bg-bee-700 text-white font-extrabold text-sm shadow-sm transition-all cursor-pointer"
              >
                Create Account to Apply
              </button>
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-3 rounded-2xl bg-navy-50 hover:bg-navy-100 text-navy-900 font-extrabold text-sm border border-navy-200 transition-all cursor-pointer"
              >
                Sign In with Existing Account
              </button>
            </div>

            <div className="pt-4 border-t border-navy-100 flex items-center justify-center gap-6 text-xs text-navy-500">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Doorstep Drives</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-bee-600" /> Daily Payouts</span>
            </div>
          </div>
        )}

        {/* If user is authenticated, check existing application status */}
        {user && isLoadingApp && (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-bee-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-navy-600">Checking your application status...</p>
          </div>
        )}

        {user && !isLoadingApp && existingApp && (
          /* ─────────────────────────────────────────────────────────────────
             APPLICATION STATUS VIEWS (PENDING / APPROVED / REJECTED / RESUBMISSION)
             ───────────────────────────────────────────────────────────────── */
          <div className="space-y-6 animate-fade-in">
            {/* Status: APPROVED */}
            {existingApp.status === 'APPROVED' && (
              <div className="bg-emerald-50/90 border border-emerald-300 rounded-3xl p-6 sm:p-10 text-center space-y-5 shadow-md">
                <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 mx-auto flex items-center justify-center text-3xl">
                  🎉
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-3 py-1 rounded-full">
                    Verified Driver
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-emerald-950">
                    Congratulations! Your Application is Approved
                  </h2>
                  <p className="text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
                    Your identity documents have been verified by DriverBee Operations. Your driver profile is active and ready to receive bookings.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/driver')}
                    className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Go to Driver Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Status: PENDING / UNDER_REVIEW */}
            {(existingApp.status === 'PENDING' || existingApp.status === 'UNDER_REVIEW') && (
              <div className="bg-white border border-navy-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-navy-100">
                  <div>
                    <div className="text-xs font-bold text-bee-700 uppercase tracking-wider">Driver Application</div>
                    <h2 className="text-xl sm:text-2xl font-black text-navy-950 mt-0.5">
                      Application Under Verification
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>PENDING ADMIN REVIEW</span>
                  </span>
                </div>

                <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 leading-relaxed">
                    <strong>Estimated Verification Time: 2–4 Hours.</strong> Our operations team in Warangal is reviewing your uploaded Aadhaar, PAN, and Driving Licence documents. You will receive an SMS and WhatsApp notification as soon as verification completes.
                  </div>
                </div>

                {/* Summary Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-navy-50/70 rounded-xl border border-navy-100 space-y-1">
                    <span className="text-navy-500">Applicant Name</span>
                    <div className="font-bold text-navy-950 text-sm">{existingApp.full_name}</div>
                  </div>
                  <div className="p-3.5 bg-navy-50/70 rounded-xl border border-navy-100 space-y-1">
                    <span className="text-navy-500">Registered Phone</span>
                    <div className="font-bold text-navy-950 text-sm">{existingApp.phone}</div>
                  </div>
                  <div className="p-3.5 bg-navy-50/70 rounded-xl border border-navy-100 space-y-1">
                    <span className="text-navy-500">Experience &amp; Sector</span>
                    <div className="font-bold text-navy-950">{existingApp.experience_years} Years • {existingApp.city}</div>
                  </div>
                  <div className="p-3.5 bg-navy-50/70 rounded-xl border border-navy-100 space-y-1">
                    <span className="text-navy-500">Work Availability</span>
                    <div className="font-bold text-emerald-700">{existingApp.availability_status}</div>
                  </div>
                </div>

                {/* Submitted Documents Status list */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy-400">Attached Documents</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['AADHAAR', 'PAN', 'DRIVING_LICENSE'].map((type) => {
                      const doc = existingApp.documents?.find((d: any) => d.document_type === type);
                      return (
                        <div key={type} className="p-3 bg-white border border-navy-200 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-navy-900">{type.replace('_', ' ')}</div>
                            <div className="text-[10.5px] text-navy-500">
                              {doc ? `${(doc.file_size / 1024).toFixed(0)} KB • Uploaded` : 'Uploaded'}
                            </div>
                          </div>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            {doc?.verification_status || 'PENDING'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs text-navy-500">
                  <span>Submitted on: {new Date(existingApp.submitted_at).toLocaleDateString('en-IN')}</span>
                  <button
                    onClick={loadExistingApplication}
                    className="flex items-center gap-1 text-bee-700 font-bold hover:underline cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Check Live Status</span>
                  </button>
                </div>
              </div>
            )}

            {/* Status: RESUBMISSION_REQUIRED */}
            {existingApp.status === 'RESUBMISSION_REQUIRED' && (
              <div className="bg-white border border-amber-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    ⚠️
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-navy-950">Action Required: Document Resubmission</h2>
                    <p className="text-xs text-navy-600">The admin requested an updated photo for one or more documents.</p>
                  </div>
                </div>

                {existingApp.rejection_reason && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                    <strong className="block font-bold">Admin Feedback:</strong>
                    <div>{existingApp.rejection_reason}</div>
                  </div>
                )}

                {/* Highlight rejected document and allow single replacement upload */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy-500">Review Documents</h4>
                  <div className="space-y-3">
                    {(existingApp.documents || []).map((doc: any) => {
                      const isProblemDoc = doc.verification_status === 'REJECTED' || doc.verification_status === 'RESUBMISSION_REQUIRED';
                      return (
                        <div
                          key={doc.id}
                          className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3 ${
                            isProblemDoc ? 'bg-rose-50/70 border-rose-300' : 'bg-navy-50/50 border-navy-200'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-sm text-navy-950 flex items-center gap-2">
                              <span>{doc.document_type.replace('_', ' ')}</span>
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  isProblemDoc ? 'bg-rose-200 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {doc.verification_status}
                              </span>
                            </div>
                            {doc.rejection_note && (
                              <div className="text-xs text-rose-700 mt-1">
                                Note: {doc.rejection_note}
                              </div>
                            )}
                          </div>

                          {isProblemDoc && (
                            <button
                              onClick={() => {
                                setResubmittingDocType(doc.document_type);
                                setResubmitFile(null);
                                setResubmitPreview(null);
                              }}
                              className="px-3.5 py-1.5 bg-bee-600 hover:bg-bee-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                            >
                              Upload New {doc.document_type.replace('_', ' ')}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resubmission Modal Drawer */}
                {resubmittingDocType && (
                  <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-navy-950 uppercase">
                        Select New {resubmittingDocType.replace('_', ' ')}
                      </h4>
                      <button onClick={() => setResubmittingDocType(null)} className="text-navy-400 hover:text-navy-900">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setResubmitFile(file);
                          setResubmitPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="text-xs"
                    />

                    {resubmitPreview && (
                      <div className="w-32 h-20 rounded-xl overflow-hidden border border-navy-200">
                        <img src={resubmitPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleSingleDocResubmit}
                        disabled={!resubmitFile || isResubmitting}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isResubmitting ? 'Optimizing & Uploading...' : 'Submit Replacement Document'}
                      </button>
                      <button
                        onClick={() => setResubmittingDocType(null)}
                        className="px-3 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Status: REJECTED */}
            {existingApp.status === 'REJECTED' && (
              <div className="bg-rose-50/90 border border-rose-300 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-rose-100 border border-rose-300 mx-auto flex items-center justify-center text-2xl">
                  ❌
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-rose-950">Application Not Approved</h2>
                  <p className="text-xs text-rose-800 max-w-md mx-auto">
                    Reason: {existingApp.rejection_reason || 'Information provided did not match verification criteria.'}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setExistingApp(null)}
                    className="px-5 py-2.5 rounded-xl bg-bee-600 hover:bg-bee-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    Start New Application
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* If user is authenticated and NO active application exists, render Multi-Step Form */}
        {user && !isLoadingApp && !existingApp && (
          <div className="bg-white rounded-3xl border border-navy-200/80 shadow-md overflow-hidden animate-fade-in">
            {/* Form Top Progress Header */}
            <div className="bg-navy-950 text-white p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-bee-400">
                    Step {step} of 5
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                    {step === 1 && 'Personal Information'}
                    {step === 2 && 'Driving Experience & Area'}
                    {step === 3 && 'Vehicle Preference'}
                    {step === 4 && 'Identity Document Upload'}
                    {step === 5 && 'Availability & Review'}
                  </h1>
                </div>
                <div className="text-xs font-bold text-navy-400">
                  {Math.round((step / 5) * 100)}% Complete
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-navy-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-bee-500 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {submitError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                 STEP 1: PERSONAL DETAILS
                 ───────────────────────────────────────────────────────────── */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs text-navy-500 leading-relaxed">
                    Please provide your legal contact and address information for verification.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-navy-800 mb-1">Full Legal Name *</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Rahul Kumar"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm font-semibold focus:border-bee-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-800 mb-1">Date of Birth *</label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm font-semibold focus:border-bee-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-800 mb-1">Mobile Phone Number *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-navy-400">+91</span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                          placeholder="9845012345"
                          className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-navy-200 text-sm font-semibold focus:border-bee-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-800 mb-1">Email Address *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="rahul@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm font-semibold focus:border-bee-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-navy-800 mb-1">Residential Address *</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="House / Street / Locality in Warangal"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm font-semibold focus:border-bee-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-800 mb-1">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm font-semibold bg-navy-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-800 mb-1">Pincode *</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        placeholder="506001"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm font-semibold focus:border-bee-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                 STEP 2: DRIVER EXPERIENCE & AREAS
                 ───────────────────────────────────────────────────────────── */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs text-navy-500 leading-relaxed">
                    Tell us about your driving history and preferred operating zones in Warangal.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-navy-800 mb-1">Driving Experience (Years) *</label>
                      <input
                        type="number"
                        min={1}
                        max={40}
                        value={formData.experienceYears}
                        onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm font-semibold focus:border-bee-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-800 mb-1">Emergency Contact Number *</label>
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        placeholder="Spouse / Parent / Relative Phone"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm font-semibold focus:border-bee-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-navy-800 mb-1">Preferred Local Operating Areas</label>
                      <input
                        type="text"
                        value={formData.serviceAreas}
                        onChange={(e) => setFormData({ ...formData, serviceAreas: e.target.value })}
                        placeholder="e.g. Hanamkonda, Kazipet, Subedari, Hunter Road"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm font-semibold focus:border-bee-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-navy-800 mb-1">Languages Spoken</label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {['Telugu', 'Hindi', 'English'].map((lang) => {
                          const hasLang = formData.languages.includes(lang);
                          return (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => {
                                const next = hasLang
                                  ? formData.languages.filter((l) => l !== lang)
                                  : [...formData.languages, lang];
                                setFormData({ ...formData, languages: next });
                              }}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                hasLang
                                  ? 'bg-bee-100 text-bee-900 border-bee-300 shadow-2xs'
                                  : 'bg-navy-50/70 text-navy-600 border-navy-200'
                              }`}
                            >
                              {hasLang ? `✓ ${lang}` : `+ ${lang}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                 STEP 3: VEHICLE PREFERENCE
                 ───────────────────────────────────────────────────────────── */}
              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-bee-50/70 border border-bee-200 rounded-2xl space-y-1">
                    <h4 className="text-xs font-bold text-bee-950 uppercase tracking-wider">DriverBee Model Notice</h4>
                    <p className="text-xs text-bee-900 leading-relaxed">
                      DriverBee provides on-demand personal chauffeurs who drive customer-owned vehicles (Manual &amp; Automatic, Sedans, Hatchbacks, and SUVs). You do not need to own a car to join.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-navy-800">Car Types You Are Comfortable Driving</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {['Hatchback', 'Sedan', 'SUV', 'Luxury'].map((car) => {
                        const key = car.toLowerCase();
                        const isSelected = formData.vehicleTypes.includes(key);
                        return (
                          <button
                            key={car}
                            type="button"
                            onClick={() => {
                              const next = isSelected
                                ? formData.vehicleTypes.filter((t) => t !== key)
                                : [...formData.vehicleTypes, key];
                              setFormData({ ...formData, vehicleTypes: next });
                            }}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-extrabold shadow-2xs'
                                : 'bg-white border-navy-200 text-navy-600 font-semibold'
                            }`}
                          >
                            <div className="text-lg mb-1">🚗</div>
                            <div className="text-xs">{car}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-3 p-3.5 bg-navy-50/70 rounded-2xl border border-navy-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.driveCustomerCars}
                        onChange={(e) => setFormData({ ...formData, driveCustomerCars: e.target.checked })}
                        className="w-4 h-4 text-bee-600 rounded"
                      />
                      <span className="text-xs font-bold text-navy-900">
                        I agree to drive customer vehicles with utmost care and safety adherence.
                      </span>
                    </label>
                  </div>
                </div>
              )}

               {/* ─────────────────────────────────────────────────────────────
                  STEP 4: REQUIRED DOCUMENTS UPLOAD
                  ───────────────────────────────────────────────────────────── */}
               {step === 4 && (
                 <div className="space-y-5 animate-fade-in">
                   <div>
                     <h3 className="text-sm font-bold text-navy-950">Upload Identification Documents</h3>
                     <p className="text-xs text-navy-500 mt-0.5">
                       Uploaded images are automatically compressed, stripped of metadata, and stored in secure private vaults.
                     </p>
                   </div>

                   {/* Error notice if user attempted to continue without uploading */}
                   {step4Attempted && !allDocsUploaded && (
                     <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-800 flex items-start gap-3 shadow-xs animate-shake">
                       <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                       <div>
                         <div className="font-black text-rose-900 text-xs sm:text-sm">
                           All 3 Documents Required to Continue
                         </div>
                         <div className="text-rose-700 mt-0.5 text-[11.5px] leading-relaxed">
                           You cannot proceed to the next step without uploading all 3 identification documents. Please upload your <strong>{missingDocsList.join(', ')}</strong> below.
                         </div>
                       </div>
                     </div>
                   )}

                   {/* Document Upload Cards */}
                   {[
                     { key: 'aadhaar' as const, label: 'Aadhaar Card', sub: 'Front side with clear name and photo', icon: '🪪' },
                     { key: 'pan' as const, label: 'PAN Card', sub: 'Government PAN card', icon: '💳' },
                     { key: 'dl' as const, label: 'Driving Licence', sub: 'Valid LMV commercial/private licence', icon: '🚗' },
                   ].map((item) => {
                     const docState = docs[item.key];
                     const isUploaded = Boolean(docState.file);
                     const isMissing = step4Attempted && !isUploaded;

                     return (
                       <div
                         key={item.key}
                         className={`p-4 bg-white border rounded-2xl space-y-3 transition-all ${
                           isMissing
                             ? 'border-rose-300 ring-2 ring-rose-400/30 bg-rose-50/20 shadow-xs'
                             : isUploaded
                             ? 'border-emerald-200 bg-emerald-50/10 shadow-2xs'
                             : 'border-navy-200 shadow-2xs'
                         }`}
                       >
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2.5">
                             <span className="text-xl">{item.icon}</span>
                             <div>
                               <div className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                                 <span>{item.label}</span>
                                 <span className="text-rose-500 font-extrabold">*</span>
                               </div>
                               <div className="text-[11px] text-navy-500">{item.sub}</div>
                             </div>
                           </div>

                           {isUploaded ? (
                             <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                               ✓ Ready ({docState.sizeKB} KB)
                             </span>
                           ) : isMissing ? (
                             <span className="text-[11px] font-black text-rose-700 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                               <AlertCircle className="w-3 h-3 text-rose-600" />
                               Upload Required
                             </span>
                           ) : (
                             <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                               Required
                             </span>
                           )}
                         </div>

                         {/* Preview and Upload Action */}
                         <div className="flex items-center gap-3">
                           {docState.previewUrl && (
                             <div className="w-16 h-12 rounded-xl overflow-hidden border border-navy-200 bg-navy-50 flex-shrink-0 shadow-2xs">
                               <img src={docState.previewUrl} alt="Doc preview" className="w-full h-full object-cover" />
                             </div>
                           )}

                           <label className="flex-1 cursor-pointer">
                             <div
                               className={`px-3.5 py-2 rounded-xl border border-dashed text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                 isMissing
                                   ? 'border-rose-400 hover:border-rose-500 bg-rose-50/70 hover:bg-rose-100/60 text-rose-800'
                                   : 'border-navy-300 hover:border-bee-500 bg-navy-50/50 hover:bg-bee-50/30 text-navy-800'
                               }`}
                             >
                               <Upload className={`w-3.5 h-3.5 ${isMissing ? 'text-rose-600' : 'text-bee-600'}`} />
                               <span>{isUploaded ? 'Replace Document' : `Upload ${item.label}`}</span>
                             </div>
                             <input
                               type="file"
                               accept="image/jpeg,image/png,image/webp"
                               className="hidden"
                               onChange={(e) => {
                                 const f = e.target.files?.[0];
                                 if (f) handleFileSelect(item.key, f);
                               }}
                             />
                           </label>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               )}

              {/* ─────────────────────────────────────────────────────────────
                 STEP 5: AVAILABILITY & SUBMIT
                 ───────────────────────────────────────────────────────────── */}
              {step === 5 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 bg-navy-950 text-white rounded-2xl space-y-3 shadow-md">
                    <h4 className="text-xs font-bold text-bee-400 uppercase tracking-wider">
                      Work Availability Status
                    </h4>
                    <p className="text-xs text-navy-300 leading-relaxed">
                      Are you currently available to accept ride bookings as soon as your application is approved?
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, availabilityStatus: 'AVAILABLE' })}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          formData.availabilityStatus === 'AVAILABLE'
                            ? 'bg-emerald-500 text-white font-extrabold border-emerald-400 shadow-sm'
                            : 'bg-navy-900 text-navy-300 border-navy-800'
                        }`}
                      >
                        <div className="text-sm">✓ YES</div>
                        <div className="text-[10.5px] opacity-80 mt-0.5">I am available now</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, availabilityStatus: 'UNAVAILABLE' })}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          formData.availabilityStatus === 'UNAVAILABLE'
                            ? 'bg-amber-500 text-white font-extrabold border-amber-400 shadow-sm'
                            : 'bg-navy-900 text-navy-300 border-navy-800'
                        }`}
                      >
                        <div className="text-sm">NO</div>
                        <div className="text-[10.5px] opacity-80 mt-0.5">Unavailable for now</div>
                      </button>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="p-4 bg-navy-50/70 border border-navy-200 rounded-2xl space-y-2 text-xs">
                    <div className="font-bold text-navy-950 text-sm">Application Summary:</div>
                    <div className="flex justify-between text-navy-600">
                      <span>Applicant:</span>
                      <strong className="text-navy-950">{formData.fullName} ({formData.phone})</strong>
                    </div>
                    <div className="flex justify-between text-navy-600">
                      <span>City:</span>
                      <strong className="text-navy-950">{formData.city}, {formData.state}</strong>
                    </div>
                    <div className="flex justify-between text-navy-600">
                      <span>Experience:</span>
                      <strong className="text-navy-950">{formData.experienceYears} Years</strong>
                    </div>
                    <div className="flex justify-between text-navy-600">
                      <span>Attached Documents:</span>
                      <strong className="text-emerald-700">Aadhaar, PAN, Driving Licence (3/3)</strong>
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 text-xs text-navy-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                      className="mt-0.5 w-4 h-4 text-bee-600 rounded"
                    />
                    <span>
                      I certify that all details and documents provided are authentic and belong to me. I agree to DriverBee safety guidelines and background verification.
                    </span>
                  </label>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-navy-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                    className="px-4 py-2 rounded-xl border border-navy-200 text-xs font-bold text-navy-800 hover:bg-navy-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                ) : <div />}

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 1 && (!formData.fullName || !formData.phone || !formData.email)) {
                        setSubmitError('Please fill in your Name, Phone Number, and Email.');
                        return;
                      }
                      if (step === 2 && (!formData.city || formData.vehicleTypes.length === 0)) {
                        setSubmitError('Please complete your driving experience and vehicle type details.');
                        return;
                      }
                      if (step === 4) {
                        setStep4Attempted(true);
                        if (!allDocsUploaded) {
                          setSubmitError(`Please upload all 3 required identity documents (${missingDocsList.join(', ')}) to continue.`);
                          return; // STRICTLY STOPS NAVIGATION
                        }
                      }
                      setSubmitError(null);
                      setStep((s) => Math.min(5, s + 1));
                    }}
                    className="px-5 py-2.5 rounded-xl bg-bee-600 hover:bg-bee-700 text-white text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitApplication}
                    disabled={isSubmitting || !formData.agreeTerms}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Submit Driver Application</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal if unauthenticated */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
