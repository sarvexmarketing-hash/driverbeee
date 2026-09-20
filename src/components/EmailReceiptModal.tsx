import React from 'react';
import { X, Mail, CheckCircle2, Printer, ExternalLink, ShieldCheck } from 'lucide-react';
import { SentEmailRecord } from '../services/emailService';

interface EmailReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailRecord: SentEmailRecord | null;
}

export const EmailReceiptModal: React.FC<EmailReceiptModalProps> = ({
  isOpen,
  onClose,
  emailRecord,
}) => {
  if (!isOpen || !emailRecord) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(emailRecord.html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-navy-100 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-bee-500/20 text-bee-400 border border-bee-500/30 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-bee-400">
                Email Notification Sent
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Booking Confirmation Receipt
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Email Metadata Envelope Bar */}
        <div className="p-4 bg-navy-50/70 border-b border-navy-100 text-xs text-navy-800 space-y-1.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-navy-500 font-medium">To:</span>
              <span className="font-bold text-navy-950 bg-white px-2 py-0.5 rounded-md border border-navy-200">
                {emailRecord.to}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full font-extrabold text-[10.5px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Delivered via DriverBee Mailer</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-navy-600 truncate">
            <span className="text-navy-500 font-medium">Subject:</span>
            <span className="font-semibold text-navy-900 truncate">{emailRecord.subject}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-navy-500 pt-1">
            <span>Sent: {new Date(emailRecord.sentAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            <span>Booking Ref: <strong>#{emailRecord.bookingId}</strong></span>
          </div>
        </div>

        {/* Email HTML Render Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div 
              dangerouslySetInnerHTML={{ __html: emailRecord.html }}
              className="email-content-wrapper"
            />
          </div>
        </div>

        {/* Modal Bottom Close Action */}
        <div className="p-4 border-t border-navy-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-navy-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official booking confirmation receipt from DriverBee Warangal</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-800 text-white font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
