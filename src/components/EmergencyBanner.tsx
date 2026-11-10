import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, X } from 'lucide-react';

interface EmergencyBannerProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  emergencyNumber?: string;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  isOpen,
  onClose,
  message,
  emergencyNumber = '112',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-red-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border-4 border-red-500 overflow-hidden text-center p-6 sm:p-8 animate-scale-up relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Pulsing Alert Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-red-100 border-4 border-red-300 flex items-center justify-center text-red-600 mb-5 animate-emergency-glow">
          <AlertTriangle className="w-10 h-10 animate-bounce" />
        </div>

        <span className="inline-block bg-red-100 text-red-800 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 border border-red-200">
          Immediate Safety Warning
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-red-600 tracking-tight leading-snug">
          CRITICAL EMERGENCY DETECTED
        </h2>

        <p className="mt-3 text-slate-700 text-sm font-medium leading-relaxed">
          {message ||
            'The AI assistant detected a serious hazard (such as gas, fire/smoke, electrical sparks, or severe flooding).'}
        </p>

        {/* Action Box */}
        <div className="mt-6 bg-red-50 rounded-2xl p-5 border border-red-200 text-left">
          <h4 className="font-bold text-red-900 text-sm flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            Mandatory Safety Steps:
          </h4>
          <ul className="text-xs text-red-800 space-y-1.5 list-disc list-inside">
            <li><strong>Get yourself and family to safety outside immediately.</strong></li>
            <li>Do not operate light switches, matches, or appliances if gas is suspected.</li>
            <li>Call emergency services now at <strong className="text-red-950 underline font-bold">{emergencyNumber}</strong>.</li>
            <li>Your landlord has been flagged and alerted with the highest priority in red.</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href={`tel:${emergencyNumber}`}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 px-6 rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 text-sm transition transform hover:-translate-y-0.5"
          >
            <PhoneCall className="w-5 h-5" />
            Call Emergency ({emergencyNumber})
          </a>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
          >
            I am Safe / Close Warning
          </button>
        </div>
      </div>
    </div>
  );
};

