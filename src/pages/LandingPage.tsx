import React from 'react';
import {
  Building2,
  Sparkles,
  ShieldAlert,
  CreditCard,
  Users,
  CheckCircle2,
  ArrowRight,
  Shield,
  PhoneCall,
  Mail,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(#16a34a_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            AI-Powered Rental Property Management &amp; Triage Engine
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Effortless Property Management.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent">
              Instant AI Maintenance Triage.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Landlords organize properties, record rent, and automate tenant invites. When tenants report a problem in their own words, AI instantly classifies urgency, generates landlord summaries, and flags emergencies for immediate 112 action.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate('register-landlord')}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition transform hover:-translate-y-0.5"
            >
              <Building2 className="w-4 h-4" />
              Get started
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-sm flex items-center gap-2 transition"
            >
              Sign in
            </button>
          </div>
        </div>
      </section>

      {/* 3 Core Roles Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Landlord */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 flex flex-col justify-between hover:shadow-2xl transition group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Landlords</h3>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mt-0.5 mb-3">
                Full Property Suite
              </p>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Manage properties, units &amp; photos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Invite tenants via Resend email links
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Record rent payments &amp; track overdue balances
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  AI Maintenance triage board (urgent/emergencies first)
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('register-landlord')}
              className="mt-6 w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1 transition"
            >
              Create a landlord account <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Tenant */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 flex flex-col justify-between hover:shadow-2xl transition group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Tenants</h3>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mt-0.5 mb-3">
                Invited &amp; Linked to Unit
              </p>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  Join seamlessly via Landlord invite link
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  Check current balance &amp; rent receipts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  Report issues in own words (English or Kinyarwanda)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  Instant emergency safety alert (112)
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('login')}
              className="mt-6 w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1 transition"
            >
              Sign in to your account <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Admin */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 flex flex-col justify-between hover:shadow-2xl transition group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Platform Admin</h3>
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 mt-0.5 mb-3">
                Oversight &amp; Compliance
              </p>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  Approve or reject landlord accounts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  24-Hour Emergency Monitor (unhandled alerts)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  Investigate and resolve tenant complaints
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  Block suspicious accounts with mandatory reason
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('login')}
              className="mt-6 w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center gap-1 transition"
            >
              Authorized administrators sign in <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* AI Triage Architecture Showcase */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Core AI Innovation
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-3">
              How the AI Maintenance Triage Works
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Every request is parsed by an LLM with safety guardrails to ensure emergency handling, clear communication, and tenant safety.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Tenant Describes Problem In Own Words</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tenant writes naturally in English, French, or Kinyarwanda. Original wording is permanently saved and never altered.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Strict JSON Categorization &amp; Urgency</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    AI categorizes into 7 standard categories (plumbing, electrical, doors/locks, appliances, structure, pests, other) and assigns urgency (low, normal, urgent).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-red-200 bg-red-50/70 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0 font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-red-900 text-sm flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    Immediate Emergency Detection &amp; 112 Evacuation Notice
                  </h4>
                  <p className="text-xs text-red-800 mt-0.5">
                    Gas leaks, fire, sparking wires, or severe flooding immediately flash a prominent red warning for tenant safety and pin to the top of the landlord's dashboard.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-sm">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">AI Follow-Up Question &amp; Zero DIY Instructions</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    AI prompts tenant for helpful clarifications and is strictly forbidden from providing hazardous DIY repair instructions.
                  </p>
                </div>
              </div>
            </div>

            {/* Code / JSON Preview Box */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-2xl border border-slate-800 font-mono text-xs overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="ml-2 font-bold text-slate-200">AI Triage JSON Response</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold">Strict JSON Schema</span>
              </div>
              <pre className="text-emerald-300 leading-relaxed overflow-x-auto">
{`{
  "category": "plumbing",
  "urgency": "urgent",
  "is_emergency": false,
  "summary": "Water pipe leak under kitchen sink; floor is wet.",
  "follow_up_question": "Does the water stop when the main tap is turned off?"
}`}
              </pre>
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Fallback: Safe defaults ("other", "normal")</span>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  Sign in to access AI tools
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-900 text-slate-400 text-xs text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-white">RentPulse</span>
            <span>&bull; Full-Stack Rental Property &amp; AI Triage Platform</span>
          </div>
          <div>
            Built with Node.js, Express, MongoDB, Resend &amp; React.ts, Tailwind CSS
          </div>
        </div>
      </footer>
    </div>
  );
};
