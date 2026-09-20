import React from 'react';
import { DriverBeeLogo } from '../components/DriverBeeLogo';
import { ShieldCheck, ArrowLeft, Lock, Mail, Phone, MapPin, Eye, FileText, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFD] text-navy-900 flex flex-col justify-between selection:bg-bee-500/20 selection:text-navy-950 font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-navy-100 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/" className="hover:opacity-90 transition-opacity">
            <DriverBeeLogo height={36} />
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-700 hover:text-bee-600 bg-navy-50 hover:bg-bee-50 px-3.5 py-2 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full flex-grow">
        <div className="bg-white border border-navy-100/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          
          {/* Header */}
          <div className="border-b border-navy-100 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-bee-50 border border-bee-200 text-bee-800 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-bee-600" />
              <span>Official Privacy Policy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-navy-500 mt-2">
              Last updated: September 20, 2026 • DriverBee Technologies
            </p>
          </div>

          {/* Introductory Notice */}
          <section className="text-sm text-navy-700 leading-relaxed space-y-3">
            <p>
              Welcome to <strong>DriverBee</strong> (&quot;DriverBee&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). 
              DriverBee operates an on-demand driver booking platform connecting vehicle owners in Warangal, Telangana, 
              and surrounding areas with verified professional personal drivers.
            </p>
            <p>
              We are committed to respecting your privacy and protecting the personal information you share with us. 
              This Privacy Policy explains what information we collect, why we collect it, how it is stored and shared, 
              and your rights regarding your data in accordance with the Information Technology Act, 2000, and the Digital Personal Data Protection Act (DPDPA 2023).
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-navy-950 flex items-center gap-2">
              <FileText className="w-5 h-5 text-bee-600" />
              1. Information We Collect
            </h2>
            <div className="text-xs sm:text-sm text-navy-700 leading-relaxed space-y-3">
              <p>When you use DriverBee to request a driver or register an account, we collect the following types of information:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Personal Identification &amp; Contact:</strong> Your full name, mobile phone number, and email address.
                </li>
                <li>
                  <strong>Trip &amp; Location Details:</strong> Doorstep pickup address, destination address, ride schedule date and time, duration, and selected trip package (within city or outstation).
                </li>
                <li>
                  <strong>Vehicle Specifications:</strong> Make/model of your vehicle, transmission type (automatic or manual), and vehicle registration number (plate). This ensures we assign a driver licensed and skilled for your specific car.
                </li>
                <li>
                  <strong>Family Safety &amp; Emergency Contacts:</strong> Names and phone numbers of family members or passengers when using the Family Safety feature.
                </li>
                <li>
                  <strong>Technical &amp; Session Data:</strong> Browser session identifiers, encrypted authentication tokens, and local cache entries stored in your browser&apos;s LocalStorage to maintain your login and booking status.
                </li>
              </ul>
            </div>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-navy-950 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              2. How We Use Your Information
            </h2>
            <div className="text-xs sm:text-sm text-navy-700 leading-relaxed space-y-2">
              <p>We use your data solely for legitimate operational purposes:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>To dispatch, assign, and coordinate verified professional drivers to your doorstep.</li>
                <li>To enable telephone communication between you and your assigned driver before and during your journey.</li>
                <li>To generate and email booking confirmations, trip summaries, and digital receipts via our transactional email service.</li>
                <li>To compute transparent, fixed fare estimates based on duration, distance slabs, and night stay allowances.</li>
                <li>To provide customer support and emergency response through our Warangal operations command team.</li>
                <li>To detect, prevent, and mitigate fraud, security incidents, or abuse of the service.</li>
              </ul>
            </div>
          </section>

          {/* 3. Data Storage & Security */}
          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-navy-950 flex items-center gap-2">
              <Lock className="w-5 h-5 text-bee-600" />
              3. Data Storage &amp; Protection
            </h2>
            <div className="text-xs sm:text-sm text-navy-700 leading-relaxed space-y-2">
              <p>
                Your booking records, profile details, and driver assignments are stored in our secure cloud database 
                hosted with <strong>Supabase</strong> (PostgreSQL architecture). Data in transit is protected using industry-standard TLS 1.3 encryption. 
                Database access is governed by strict Row-Level Security (RLS) policies and least-privilege administrative controls.
              </p>
              <p>
                We do not store your banking passwords, UPI PINs, or credit/debit card numbers. All payments are completed directly via cash or UPI QR code with the driver upon trip completion.
              </p>
            </div>
          </section>

          {/* 4. Third-Party Services */}
          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-navy-950 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-600" />
              4. Third-Party Service Providers
            </h2>
            <div className="text-xs sm:text-sm text-navy-700 leading-relaxed space-y-2">
              <p>We share data only with third parties that are strictly necessary to deliver our services:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Supabase Inc.:</strong> Cloud infrastructure, authentication services, and database management.</li>
                <li><strong>Resend Inc.:</strong> Transactional email service for booking receipts and dispatch notifications.</li>
                <li><strong>Google Fonts:</strong> Web typography delivery.</li>
              </ul>
              <p>
                We never sell, rent, monetize, or trade your personal information or phone numbers to advertising networks, brokers, or marketing third parties.
              </p>
            </div>
          </section>

          {/* 5. Cookies & Local Storage */}
          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-navy-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-navy-700" />
              5. Cookies &amp; Local Storage
            </h2>
            <div className="text-xs sm:text-sm text-navy-700 leading-relaxed space-y-2">
              <p>
                DriverBee uses browser LocalStorage strictly for functional purposes: retaining your active booking reference, 
                remembering your logged-in session, and persisting your cookie preferences. We do not use third-party marketing pixels or cross-site tracking cookies.
              </p>
            </div>
          </section>

          {/* 6. User Rights & Data Deletion */}
          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-navy-950 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              6. Your Rights &amp; Data Deletion Mechanism
            </h2>
            <div className="text-xs sm:text-sm text-navy-700 leading-relaxed space-y-2">
              <p>Under applicable Indian data protection laws, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Request access to the personal data we hold about you.</li>
                <li>Request corrections or updates to inaccurate profile or contact details.</li>
                <li>Request the complete deletion of your account and associated ride history.</li>
              </ul>
              <p>
                To exercise any of these rights, email us at <a href="mailto:officialdriverbee@gmail.com" className="text-bee-600 font-bold underline">officialdriverbee@gmail.com</a> with 
                the subject line <em>&quot;Data Deletion Request&quot;</em> along with your registered phone number. Requests are processed within 15 business days.
              </p>
            </div>
          </section>

          {/* 7. Legal Identity & Contact Information */}
          <section className="space-y-4 pt-4 border-t border-navy-100">
            <h2 className="text-lg font-extrabold text-navy-950 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-bee-600" />
              7. Grievance Officer &amp; Contact Details
            </h2>
            <div className="text-xs sm:text-sm text-navy-700 leading-relaxed space-y-3">
              <div className="bg-navy-50/70 p-4 rounded-2xl border border-navy-100 space-y-2">
                <p><strong>Entity:</strong> DriverBee Technologies Pvt. Ltd. <span className="text-xs text-navy-400 font-normal">[PLACEHOLDER: Insert Registered Corporate CIN / Registration Number]</span></p>
                <p><strong>Grievance Officer:</strong> Viswa Teja <span className="text-xs text-navy-400 font-normal">[PLACEHOLDER: Formal Legal Designation]</span></p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-bee-600 flex-shrink-0" />
                  <span>Main Road, Hanamkonda, Warangal, Telangana 506001, India</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <a href="tel:+917569402288" className="font-bold text-navy-950 hover:underline">+91 75694 02288</a>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-bee-600 flex-shrink-0" />
                  <a href="mailto:officialdriverbee@gmail.com" className="font-bold text-bee-700 hover:underline">officialdriverbee@gmail.com</a>
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-navy-100 py-6 text-center text-xs text-navy-500">
        <p>© {new Date().getFullYear()} DriverBee Technologies Pvt. Ltd. All rights reserved.</p>
        <p className="mt-1">
          <a href="/terms" className="text-bee-700 font-semibold hover:underline">Terms of Service</a> • <a href="/" className="text-navy-600 hover:underline">Home</a>
        </p>
      </footer>
    </div>
  );
};
export default PrivacyPolicy;
