import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Lease,
  Unit,
  Property,
  User,
  Payment,
  MaintenanceRequest,
  Complaint,
} from '../types';
import {
  Home,
  Wrench,
  AlertTriangle,
  Flame,
  PhoneCall,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  AlertOctagon,
  FileText,
  Printer,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  Zap,
  Lock,
  Tv,
  Bug,
} from 'lucide-react';
import { EmergencyBanner } from '../components/EmergencyBanner';

interface TenantPortalProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAiLab: () => void;
}

export const TenantPortal: React.FC<TenantPortalProps> = ({ currentTab, setCurrentTab, onOpenAiLab }) => {
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [portalData, setPortalData] = useState<{
    hasActiveLease: boolean;
    lease?: Lease;
    unit?: Unit;
    property?: Property;
    landlord?: User;
    balanceSummary?: Lease['balanceSummary'];
    paymentHistory?: Payment[];
    message?: string;
  } | null>(null);

  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Maintenance Form
  const [problemDescription, setProblemDescription] = useState('');
  const [isSubmittingProblem, setIsSubmittingProblem] = useState(false);
  const [activeEmergencyAlert, setActiveEmergencyAlert] = useState<{ warning: string; emergencyNumber: string } | null>(null);

  // Answering Follow Up
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({});
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState<Record<string, boolean>>({});

  // Complaint Form
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintUrgency, setComplaintUrgency] = useState<'normal' | 'urgent'>('normal');
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);

  // Print Receipt Modal
  const [receiptToPrint, setReceiptToPrint] = useState<Payment | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [portalRes, reqsRes, complaintsRes] = await Promise.all([
        api.getTenantPortalData(),
        api.getTenantRequests(),
        api.getTenantComplaints(),
      ]);

      setPortalData(portalRes);
      setRequests(reqsRes.requests || []);
      setComplaints(complaintsRes.complaints || []);
    } catch (err: any) {
      console.warn('Error loading tenant data:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReportProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) return;

    setIsSubmittingProblem(true);
    try {
      const data = await api.createMaintenanceRequest({
        description: problemDescription.trim(),
      });

      if (data.emergencyAlert) {
        setActiveEmergencyAlert(data.emergencyAlert);
      } else {
        success('Maintenance Request Sent', 'Our AI triage categorized your request and notified your landlord.');
      }

      setProblemDescription('');
      loadData();
    } catch (err: any) {
      error('Submission Failed', err.message);
    } finally {
      setIsSubmittingProblem(false);
    }
  };

  const handleAnswerFollowUp = async (requestId: string) => {
    const answer = followUpAnswers[requestId];
    if (!answer || !answer.trim()) return;

    setIsSubmittingFollowUp((prev) => ({ ...prev, [requestId]: true }));
    try {
      await api.answerFollowUpQuestion(requestId, answer.trim());
      success('Clarification Saved', 'Your answer has been added to the request for your landlord.');
      setFollowUpAnswers((prev) => ({ ...prev, [requestId]: '' }));
      loadData();
    } catch (err: any) {
      error('Failed to submit answer', err.message);
    } finally {
      setIsSubmittingFollowUp((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleFileComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintDesc.trim()) return;

    setIsSubmittingComplaint(true);
    try {
      await api.submitComplaint({
        subject: complaintSubject.trim(),
        description: complaintDesc.trim(),
        urgency: complaintUrgency,
      });

      success('Complaint Submitted', 'Your formal complaint has been forwarded to platform administrators.');
      setComplaintSubject('');
      setComplaintDesc('');
      loadData();
    } catch (err: any) {
      error('Complaint Failed', err.message);
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  const quickFillSample = (sampleText: string) => {
    setProblemDescription(sampleText);
  };

  if (!portalData?.hasActiveLease) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-200">
            <Home className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">No Active Lease Linked</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Tenants join by clicking an invitation link from their landlord. Once linked, you will see your unit, rent balance, and maintenance request center here.
          </p>
          <div className="mt-6 flex flex-col gap-2 max-w-sm mx-auto">
            <button
              onClick={() => setCurrentTab('invite')}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition"
            >
              Enter Invitation Token
            </button>
            <p className="text-[11px] text-slate-400">
              (Or switch to Demo Tenant Keza / Mugisha via the Demo Bar at the top)
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { unit, property, landlord, balanceSummary, paymentHistory = [] } = portalData;
  const balance = balanceSummary?.balance ?? 0;
  const isOverdue = balance > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Emergency Alert Modal (Triggers immediately if AI detects hazard) */}
      <EmergencyBanner
        isOpen={Boolean(activeEmergencyAlert)}
        onClose={() => setActiveEmergencyAlert(null)}
        message={activeEmergencyAlert?.warning}
        emergencyNumber={activeEmergencyAlert?.emergencyNumber || '112'}
      />

      {/* 1. MY HOME & LEASE TAB */}
      {currentTab === 'my-home' && (
        <div className="space-y-8">
          {/* Unit & Rent Overview Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Active Lease Agreement
                </span>
                <h1 className="text-3xl font-black mt-2 text-white">
                  Unit {unit?.unitNumber} &bull; {property?.name}
                </h1>
                <p className="text-xs text-slate-300 mt-1">
                  {property?.address}, {property?.city} &bull; Landlord: <strong>{landlord?.name}</strong> ({landlord?.phone})
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-300">
                  <span>{unit?.bedrooms} Bedrooms</span>
                  <span>&bull;</span>
                  <span>{unit?.bathrooms} Bathrooms</span>
                  <span>&bull;</span>
                  <span>{unit?.squareFeet} sq ft</span>
                </div>
              </div>

              {/* Balance Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 min-w-[260px]">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Current Rent Status:
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className={`text-3xl font-black ${isOverdue ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {balance.toLocaleString()} RWF
                  </span>
                </div>
                <div className="mt-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      balanceSummary?.paymentStatus === 'PAID'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : balanceSummary?.paymentStatus === 'PARTIAL'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {isOverdue ? `BALANCE DUE (${balanceSummary?.paymentStatus})` : 'ALL PAID UP'}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-300 flex justify-between">
                  <span>Monthly Rate:</span>
                  <span className="font-bold text-white">{Number(unit?.monthlyRent).toLocaleString()} RWF</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setCurrentTab('report-problem')}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-sm flex items-center justify-between text-left group transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Report a Maintenance Problem</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Write in your own words &bull; AI triage detects urgency &amp; emergency alerts (112)
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
            </button>

            <button
              onClick={() => setCurrentTab('complaints')}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 shadow-sm flex items-center justify-between text-left group transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Send Complaint to Admin</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Report unhandled urgent requests or unresolved landlord disputes
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition" />
            </button>
          </div>

          {/* Payment History & Receipts */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Your Payment History &amp; Receipts</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official records of payments entered by your landlord
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Total Paid: {balanceSummary?.totalPaid.toLocaleString()} RWF
              </span>
            </div>

            {paymentHistory.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No rent payment receipts recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Receipt #</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Period</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paymentHistory.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-800">{p.receiptNumber}</td>
                        <td className="px-4 py-3.5 text-slate-500">{new Date(p.paymentDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3.5 font-medium text-slate-700">{p.forMonth}</td>
                        <td className="px-4 py-3.5 uppercase font-bold text-[10px] text-slate-500">{p.paymentMethod.replace('_', ' ')}</td>
                        <td className="px-4 py-3.5 font-extrabold text-emerald-700 text-sm">{p.amount.toLocaleString()} RWF</td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setReceiptToPrint(p)}
                            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] inline-flex items-center gap-1 transition"
                          >
                            <Printer className="w-3 h-3" /> View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. REPORT MAINTENANCE WITH AI TRIAGE TAB */}
      {currentTab === 'report-problem' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </div>
                <h2 className="text-xl font-black text-slate-900">Report a Maintenance Problem</h2>
              </div>
              <button
                onClick={onOpenAiLab}
                className="text-xs text-indigo-700 hover:underline font-bold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                See 14 AI Test Samples
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Write naturally in your own words (English or Kinyarwanda). The AI assistant will automatically sort urgency, write a summary for the landlord, and warn you immediately if it sounds like an emergency.
            </p>

            {/* Quick Fill Sample Prompts */}
            <div className="mb-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Click a sample scenario to test the AI triage:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => quickFillSample("There is a very strong gas smell in the kitchen and near the stove, it's making us dizzy!")}
                  className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-medium"
                >
                  🚨 Test Gas Emergency
                </button>
                <button
                  type="button"
                  onClick={() => quickFillSample("Major water pipe burst in the bathroom ceiling, water is pouring like a waterfall and flooding the entire hallway!")}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-medium"
                >
                  🌊 Test Pipe Burst Flood
                </button>
                <button
                  type="button"
                  onClick={() => quickFillSample("The bedroom door hinge makes a tiny squeaking sound when closed late at night.")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium"
                >
                  🚪 Test Minor Door Issue
                </button>
                <button
                  type="button"
                  onClick={() => quickFillSample("Hari impumuro ikomeye ya gazi mu gikoni kandi dufite ubwoba ko hashobora kwaka umuriro!")}
                  className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 font-medium"
                >
                  🇷🇼 Test Kinyarwanda Gas Smell
                </button>
                <button
                  type="button"
                  onClick={() => quickFillSample("Amazi ari kuva munsi ya shinga mu gikoni kandi hasi hose haratose.")}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium"
                >
                  🇷🇼 Test Kinyarwanda Sink Leak
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleReportProblem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Describe what is wrong in your own words:
                </label>
                <textarea
                  rows={4}
                  required
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="e.g. Water is leaking under the kitchen sink and dripping onto the cabinet floor..."
                  className="w-full p-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  AI Rule: Emergency safety guidance (112) is provided immediately. AI never advises dangerous DIY repair.
                </span>
                <button
                  type="submit"
                  disabled={isSubmittingProblem || !problemDescription.trim()}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition disabled:opacity-50"
                >
                  {isSubmittingProblem ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-yellow-300" />
                      Triaging with AI...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit &amp; Triage with AI
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Past Maintenance Requests List */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900">Your Reported Problems &amp; Status</h3>

            {requests.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                You have not submitted any maintenance requests yet.
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div
                    key={req._id}
                    className={`p-5 rounded-2xl border transition-all ${
                      req.is_emergency
                        ? 'bg-red-50/70 border-red-300 shadow-sm'
                        : 'bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs capitalize">
                          Category: {req.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            req.urgency === 'urgent'
                              ? 'bg-rose-100 text-rose-800'
                              : req.urgency === 'normal'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {req.urgency}
                        </span>
                        {req.is_emergency && (
                          <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full animate-pulse">
                            EMERGENCY (CALL 112)
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-xl border ${
                          req.status === 'fixed'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : req.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        Status: {req.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Original Words */}
                    <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Your Original Words:
                      </span>
                      <p className="text-slate-800 italic font-mono">"{req.originalDescription}"</p>
                    </div>

                    {/* AI Summary */}
                    <div className="mt-2 text-xs text-slate-600">
                      <strong className="text-slate-700">AI Summary for Landlord:</strong> {req.aiSummary}
                    </div>

                    {/* AI Follow-Up Question Interaction */}
                    {req.aiFollowUpQuestion && (
                      <div className="mt-4 p-4 rounded-xl bg-violet-50/80 border border-violet-200">
                        <span className="text-xs font-bold text-violet-900 flex items-center gap-1.5 mb-1">
                          <HelpCircle className="w-4 h-4 text-violet-600" />
                          AI Follow-Up Question:
                        </span>
                        <p className="text-xs text-violet-800 font-medium mb-3">
                          {req.aiFollowUpQuestion}
                        </p>

                        {req.tenantFollowUpAnswer ? (
                          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
                            <span className="font-bold block text-[10px] uppercase text-emerald-700">Your Answer:</span>
                            {req.tenantFollowUpAnswer}
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={followUpAnswers[req._id] || ''}
                              onChange={(e) =>
                                setFollowUpAnswers({ ...followUpAnswers, [req._id]: e.target.value })
                              }
                              placeholder="Type your answer to help your landlord..."
                              className="flex-1 px-3 py-1.5 rounded-lg border border-violet-300 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => handleAnswerFollowUp(req._id)}
                              disabled={isSubmittingFollowUp[req._id] || !followUpAnswers[req._id]?.trim()}
                              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-lg transition disabled:opacity-50"
                            >
                              Submit Answer
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. COMPLAINTS TAB */}
      {currentTab === 'complaints' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertOctagon className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900">File Formal Complaint to Administrator</h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              When a landlord ignores urgent repairs, breaches lease terms, or acts unfairly, submit an official dispute to the platform admin team for investigation.
            </p>

            <form onSubmit={handleFileComplaint} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Complaint Subject</label>
                <input
                  type="text"
                  required
                  value={complaintSubject}
                  onChange={(e) => setComplaintSubject(e.target.value)}
                  placeholder="e.g. Landlord ignored severe water leak for 4 days"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Urgency</label>
                <select
                  value={complaintUrgency}
                  onChange={(e) => setComplaintUrgency(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                >
                  <option value="normal">Normal Review</option>
                  <option value="urgent">Urgent Intervention Required</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Detailed Explanation</label>
                <textarea
                  rows={4}
                  required
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  placeholder="Describe the timeline and what steps you took with the landlord..."
                  className="w-full p-3.5 rounded-2xl border border-slate-300 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingComplaint}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
              >
                {isSubmittingComplaint ? 'Submitting to Admins...' : 'Submit Complaint to Admin'}
              </button>
            </form>
          </div>

          {/* Past Complaints List */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900">Your Submitted Complaints</h3>

            {complaints.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                You have not filed any complaints.
              </div>
            ) : (
              <div className="space-y-3">
                {complaints.map((c) => (
                  <div key={c._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{c.subject}</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          c.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'investigating'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">{c.description}</p>
                    {c.adminNotes && (
                      <div className="mt-2 p-2 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-900">
                        <span className="font-bold block text-[10px] uppercase text-purple-700">Admin Resolution Note:</span>
                        {c.adminNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: PRINT RENT RECEIPT (Stretch Goal) */}
      {receiptToPrint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="text-center pb-4 border-b border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">Official Rent Receipt</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">RentPulse Payments</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{receiptToPrint.receiptNumber}</p>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Tenant Name:</span>
                <span className="font-bold text-slate-900">{user?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Property &amp; Unit:</span>
                <span className="font-bold text-slate-900">{property?.name} (Unit {unit?.unitNumber})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Period:</span>
                <span className="font-bold text-slate-900">{receiptToPrint.forMonth}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-bold uppercase text-slate-900">{receiptToPrint.paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Date:</span>
                <span className="font-bold text-slate-900">{new Date(receiptToPrint.paymentDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-2 text-sm bg-emerald-50 px-3 rounded-lg border border-emerald-200">
                <span className="font-bold text-emerald-950">Amount Paid:</span>
                <span className="font-black text-emerald-700 text-base">{receiptToPrint.amount.toLocaleString()} RWF</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setReceiptToPrint(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 text-xs"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

