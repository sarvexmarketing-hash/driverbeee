import React from 'react';
import { DriverBeeLogo } from '../components/DriverBeeLogo';
import { ArrowLeft, Scale, Car, CheckCircle2, AlertTriangle, IndianRupee, ShieldAlert, Phone, Mail, MapPin } from 'lucide-react';

export const TermsAndConditions: React.FC = () => {
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
              <Scale className="w-3.5 h-3.5 text-bee-600" />
              <span>Terms of Service</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
              Terms &amp; Conditions
            </h1>
            <p className="text-xs sm:text-sm text-navy-500 mt-2">
              Last updated: September 20, 2026 • DriverBee Technologies
            </p>
          </div>

          {/* Scope of Agreement */}
          <section className="text-sm text-navy-700 leading-relaxed space-y-3">
            <p>
              Please read these Terms and Conditions (&quot;Terms&quot;) carefully before using the <strong>DriverBee</strong> platform, 
              website, or on-demand driver services. By booking a driver through DriverBee, you agree to be bound by these Terms.
            </p>
          </section>

          {/* 1. Nature of Service */}
          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-navy-950 flex items-center gap-2">
              <Car className="w-5 h-5 text-bee-600" />
              1. Nature of Services
            </h2>
            <div className="text-xs sm:text-sm text-navy-700 leading-relaxed space-y-3">
              <p>
                DriverBee operates as a technology platform connecting car owners with verified, background-checked professional drivers. 
                <strong>DriverBee provides professional drivers to drive your personal or designated vehicle. DriverBee is not a taxi or car-rental company and does not provide passenger cars.</strong>
              </p>
              <p>
                Services are available within Warangal, Hanamkonda, Kazipet, and outstation/intercity destinations originating from our service radius.
              </p>
            </div>
          </section>

          {/* 2. Customer Responsibilities */}
          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-navy-950 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              2. Customer Responsibilities &amp; Vehicle Eligibility
            </h2>
            <div className="text-xs sm:text-sm text-navy-700 leading-relaxed space-y-2">
              <p>As the vehicle owner or authorized requester, you warrant and agree that:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Your vehicle is legally registered, roadworthy, and equipped with a valid Pollution Under Control (PUC) certificate.</li>
                <li>Your vehicle is covered under a valid and current motor vehicle insurance policy covering third-party and accidental liabilities.</li>
                <li>All fuel costs, parking fees, highway toll charges (FASTag), inter-state taxes, and entry permits are the responsibility of the vehicle owner.</li>
                <li>You will not require or encourage the assigned driver to breach traffic regulations, speed limits, or transport prohibited substances.</li>
              </ul>
            </div>
          </section>

          {/* 3. Pricing, Payments, and Overtime */}
          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-navy-950 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-bee-600" />
              3. Pricing, Payments &amp; Overtime Charges
            </h2>
            <div className="text-xs sm:text-sm text-navy-700 leading-relaxed space-y-3">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Transparent Fixed Fares:</strong> Fares are calculated based on chosen package hours (for local city drives) or days and distance slabs (for outstation trips).
                </li>
                <li>
                  <strong>Pay-on-Completion:</strong> Payment is collected directly at the end of the trip via cash or UPI to the driver or via DriverBee verified QR code. No advance payment is demanded online.
                </li>
                <li>
                  <strong>Overtime Policy:</strong> If a trip exceeds the booked package duration, an overtime charge of ₹100 per additional hour applies.
                </li>
                <li>
                  <strong>Outstation Driver Allowance:</strong> For multi-day outstation bookings involving overnight stays, the customer is responsible for providing hygienic food and basic night accommodation for the driver.
                </li>
              </ul>
            </div>
          </section>

          {/* 4. Cancellation & Refund Policy */}
          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-navy-950 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              4. Cancellation Policy
            </h2>
            <div className="text-xs sm:text-sm text-navy-700 leading-relaxed space-y-2">
              <p>
                Because DriverBee operates on a pay-on-completion model with zero upfront deposit, no cancellation fee is charged for rides cancelled before the driver is dispatched to your doorstep.
              </p>
              <p>
                If you need to cancel or reschedule, please notify our dispatch team immediately via telephone at <a href="tel:+917569402288" className="text-navy-950 font-bold underline">+91 75694 02288</a> to avoid driver inconvenience.
              </p>
            </div>
          </section>

          {/* 5. Safety, Verification & Limitation of Liability */}
          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-navy-950 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              5. Safety Standards &amp; Limitation of Liability
            </h2>
            <div className="text-xs sm:text-sm text-navy-700 leading-relaxed space-y-2">
              <p>
                All DriverBee drivers undergo a rigorous 7-point verification process including Aadhaar validation, driving license verification, address authentication, criminal court record clearance, and driving skill evaluations.
              </p>
              <p>
                While DriverBee enforces strict safety standards, the primary insurance for any personal vehicle on public roads remains the comprehensive motor insurance policy held by the vehicle owner. DriverBee shall not be liable for mechanical wear-and-tear, pre-existing vehicle defects, or unforeseen road conditions beyond reasonable control.
              </p>
            </div>
          </section>

          {/* 6. Jurisdiction & Legal Details */}
          <section className="space-y-4 pt-4 border-t border-navy-100">
            <h2 className="text-lg font-extrabold text-navy-950 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-bee-600" />
              6. Governing Law &amp; Jurisdiction
            </h2>
            <div className="text-xs sm:text-sm text-navy-700 leading-relaxed space-y-3">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in <strong>Warangal, Telangana</strong>.
              </p>
              <div className="bg-navy-50/70 p-4 rounded-2xl border border-navy-100 space-y-2 text-xs">
                <p><strong>Operating Entity:</strong> DriverBee Technologies Pvt. Ltd. <span className="text-navy-400 font-normal">[PLACEHOLDER: CIN / Corporate Identification Number]</span></p>
                <p><strong>Registered Address:</strong> DriverBee Mobility, Main Road, Hanamkonda, Warangal, TS 506001 <span className="text-navy-400 font-normal">[PLACEHOLDER: Complete Registered Office Address if different]</span></p>
                <p><strong>Contact Desk:</strong> <a href="tel:+917569402288" className="font-bold text-navy-950 hover:underline">+91 75694 02288</a> • <a href="mailto:officialdriverbee@gmail.com" className="text-bee-700 font-bold hover:underline">officialdriverbee@gmail.com</a></p>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-navy-100 py-6 text-center text-xs text-navy-500">
        <p>© {new Date().getFullYear()} DriverBee Technologies Pvt. Ltd. All rights reserved.</p>
        <p className="mt-1">
          <a href="/privacy" className="text-bee-700 font-semibold hover:underline">Privacy Policy</a> • <a href="/" className="text-navy-600 hover:underline">Home</a>
        </p>
      </footer>
    </div>
  );
};
export default TermsAndConditions;
