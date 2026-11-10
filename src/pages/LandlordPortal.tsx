import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Property,
  Unit,
  Lease,
  MaintenanceRequest,
  Payment,
  MaintenanceCategory,
  MaintenanceUrgency,
  MaintenanceStatus,
} from '../types';
import {
  Building2,
  Home,
  Plus,
  Users,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Sparkles,
  Mail,
  Copy,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  Edit2,
  Trash2,
  Flame,
  Wrench,
  Zap,
  Lock,
  Tv,
  Bug,
  HelpCircle,
} from 'lucide-react';

interface LandlordPortalProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenOutbox: () => void;
}

export const LandlordPortal: React.FC<LandlordPortalProps> = ({ currentTab, setCurrentTab, onOpenOutbox }) => {
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [selectedPropertyIdForUnit, setSelectedPropertyIdForUnit] = useState<string>('');
  const [isInviteTenantOpen, setIsInviteTenantOpen] = useState(false);
  const [selectedUnitForInvite, setSelectedUnitForInvite] = useState<Unit | null>(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedLeaseForPayment, setSelectedLeaseForPayment] = useState<Lease | null>(null);

  // Forms state
  const [newPropName, setNewPropName] = useState('');
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropCity, setNewPropCity] = useState('Kigali');
  const [newPropType, setNewPropType] = useState('apartment');
  const [newPropImage, setNewPropImage] = useState('');

  const [newUnitNumber, setNewUnitNumber] = useState('');
  const [newUnitBeds, setNewUnitBeds] = useState(1);
  const [newUnitBaths, setNewUnitBaths] = useState(1);
  const [newUnitSqFt, setNewUnitSqFt] = useState(650);
  const [newUnitRent, setNewUnitRent] = useState(350000);
  const [newUnitAmenities, setNewUnitAmenities] = useState('Balcony, Water Heater');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteCustomRent, setInviteCustomRent] = useState<number | undefined>(undefined);
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);

  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentForMonth, setPaymentForMonth] = useState('November 2026');
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Maintenance Filters
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [isGeneratingAi, setIsGeneratingAi] = useState<Record<string, boolean>>({});

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [propsRes, leasesRes, reqsRes, paymentsRes] = await Promise.all([
        api.getProperties(),
        api.getLandlordLeases(),
        api.getLandlordRequests({
          category: filterCategory !== 'all' ? filterCategory : undefined,
          urgency: filterUrgency !== 'all' ? filterUrgency : undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
        }),
        api.getPaymentHistory(),
      ]);

      setProperties(propsRes.properties || []);
      setLeases(leasesRes.leases || []);
      setRequests(reqsRes.requests || []);
      setPayments(paymentsRes.payments || []);
    } catch (err: any) {
      console.warn('Load landlord data warning:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [filterCategory, filterUrgency, filterStatus]);

  // Landlord is pending approval state
  if (user?.role === 'landlord' && user.status === 'pending') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <span className="bg-amber-200 text-amber-900 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
            Account Status: Pending Approval
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-3">
            Your Landlord Account is Under Administrator Review
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Welcome to RentPulse! As part of platform compliance, new landlord accounts require administrator verification before publishing units and recording rent.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-white border border-amber-200 max-w-md mx-auto text-left text-xs text-slate-700 space-y-2">
            <p className="font-bold text-slate-900">Evaluation / Demo Helper:</p>
            <p>1. Use the <strong>Demo Roles Switcher</strong> at the top bar and click <strong>👑 Admin</strong>.</p>
            <p>2. In the Admin Dashboard, under <strong>Landlord Approvals</strong>, click <strong>Approve</strong> for your account.</p>
            <p>3. Switch back to Landlord to access the full portal instantly!</p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Aggregates
  const totalUnits = properties.reduce((acc, p) => acc + (p.totalUnits || 0), 0);
  const occupiedUnits = properties.reduce((acc, p) => acc + (p.occupiedUnits || 0), 0);
  const vacantUnits = totalUnits - occupiedUnits;
  const occupancyPercentage = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const totalRentCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalRentPotential = properties.reduce((acc, p) => acc + (p.totalRentPotential || 0), 0);

  const openRequests = requests.filter((r) => r.status === 'open');
  const openEmergencies = requests.filter((r) => r.is_emergency && r.status === 'open');

  const overdueLeases = leases.filter((l) => l.balanceSummary && l.balanceSummary.balance > 0);

  // Handlers
  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProperty({
        name: newPropName.trim(),
        address: newPropAddress.trim(),
        city: newPropCity.trim(),
        propertyType: newPropType as any,
        imageUrl: newPropImage.trim() || undefined,
      });
      success('Property Added', `${newPropName} has been created.`);
      setIsAddPropertyOpen(false);
      setNewPropName('');
      setNewPropAddress('');
      loadAllData();
    } catch (err: any) {
      error('Failed to create property', err.message);
    }
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyIdForUnit) return;
    try {
      await api.createUnit({
        propertyId: selectedPropertyIdForUnit,
        unitNumber: newUnitNumber.trim(),
        bedrooms: Number(newUnitBeds),
        bathrooms: Number(newUnitBaths),
        squareFeet: Number(newUnitSqFt),
        monthlyRent: Number(newUnitRent),
        amenities: newUnitAmenities.split(',').map((s) => s.trim()),
      });
      success('Unit Added', `Unit ${newUnitNumber} added.`);
      setIsAddUnitOpen(false);
      setNewUnitNumber('');
      loadAllData();
    } catch (err: any) {
      error('Failed to create unit', err.message);
    }
  };

  const handleGenerateAiDescription = async (unitId: string) => {
    setIsGeneratingAi((prev) => ({ ...prev, [unitId]: true }));
    try {
      const data = await api.generateAiUnitDescription(unitId);
      success('AI Listing Description Generated', data.description);
      loadAllData();
    } catch (err: any) {
      error('AI Generation Failed', err.message);
    } finally {
      setIsGeneratingAi((prev) => ({ ...prev, [unitId]: false }));
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitForInvite) return;
    try {
      const data = await api.createTenantInvite({
        unitId: selectedUnitForInvite._id,
        tenantEmail: inviteEmail.trim() || undefined,
        customRent: inviteCustomRent,
      });

      setGeneratedInviteLink(data.inviteLink);
      if (inviteEmail.trim() && !data.emailSent) {
        error(
          'Invite created, but email not sent',
          `${data.emailError || 'Resend rejected the email.'} Copy the invite link and send it to your tenant.`
        );
      } else {
        success(
          'Invite Link Generated',
          data.emailSent
            ? `Resend accepted the invitation for ${inviteEmail}.`
            : 'Copy the invite link and send it to your tenant.'
        );
      }
      loadAllData();
    } catch (err: any) {
      error('Failed to create invite', err.message);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeaseForPayment) return;
    try {
      await api.recordPayment({
        leaseId: selectedLeaseForPayment._id,
        amount: Number(paymentAmount),
        forMonth: paymentForMonth,
        paymentMethod,
        reference: paymentReference.trim(),
        notes: paymentNotes.trim(),
      });
      success('Payment Recorded', `Recorded ${Number(paymentAmount).toLocaleString()} RWF for ${paymentForMonth}`);
      setIsRecordPaymentOpen(false);
      loadAllData();
    } catch (err: any) {
      error('Payment Recording Failed', err.message);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: MaintenanceStatus) => {
    try {
      await api.updateRequestStatus(requestId, newStatus);
      success('Status Updated', `Request marked as ${newStatus.replace('_', ' ').toUpperCase()}`);
      loadAllData();
    } catch (err: any) {
      error('Status Update Failed', err.message);
    }
  };

  const handleOverrideTriage = async (requestId: string, category?: string, urgency?: string) => {
    try {
      await api.overrideTriage(requestId, { category, urgency });
      success('AI Classification Updated', 'Modified triage parameters saved.');
      loadAllData();
    } catch (err: any) {
      error('Update Failed', err.message);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'plumbing':
        return <Wrench className="w-4 h-4 text-blue-500" />;
      case 'electrical':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'doors and locks':
        return <Lock className="w-4 h-4 text-slate-700" />;
      case 'appliances':
        return <Tv className="w-4 h-4 text-purple-500" />;
      case 'structure (roof, walls, windows)':
        return <Building2 className="w-4 h-4 text-emerald-600" />;
      case 'pests':
        return <Bug className="w-4 h-4 text-rose-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. DASHBOARD VIEW */}
      {currentTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Metric 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Properties &amp; Units</span>
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{properties.length}</span>
                <span className="text-xs text-slate-500">Properties ({totalUnits} Units)</span>
              </div>
              <div className="mt-3 text-xs text-slate-600 flex items-center justify-between">
                <span>{occupiedUnits} Occupied</span>
                <span>{vacantUnits} Vacant</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${occupancyPercentage}%` }}></div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Occupancy Rate</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-blue-600">{occupancyPercentage}%</span>
                <span className="text-xs text-slate-500">of total portfolio</span>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {vacantUnits > 0 ? `${vacantUnits} unit(s) available for lease` : '100% full capacity!'}
              </p>
            </div>

            {/* Metric 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <span>Rent Tracked</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-emerald-700">
                  {totalRentCollected.toLocaleString()} RWF
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Potential: {totalRentPotential.toLocaleString()} RWF / month
              </p>
            </div>

            {/* Metric 4 */}
            <div className={`rounded-2xl p-6 shadow-sm border transition-all ${
              openEmergencies.length > 0
                ? 'bg-red-50/80 border-red-300 animate-emergency-glow'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
                <span className={openEmergencies.length > 0 ? 'text-red-800' : 'text-slate-500'}>
                  Maintenance Requests
                </span>
                <Flame className={`w-5 h-5 ${openEmergencies.length > 0 ? 'text-red-600 animate-bounce' : 'text-amber-500'}`} />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className={`text-3xl font-black ${openEmergencies.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {openRequests.length}
                </span>
                <span className="text-xs text-slate-500">Open Requests</span>
              </div>
              <div className="mt-2">
                {openEmergencies.length > 0 ? (
                  <span className="inline-block bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    {openEmergencies.length} EMERGENCY REQUIRING 112
                  </span>
                ) : (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> No active emergencies
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Quick Actions:</span>
              <button
                onClick={() => setIsAddPropertyOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Property
              </button>
              <button
                onClick={() => {
                  if (properties.length > 0) {
                    setSelectedPropertyIdForUnit(properties[0]._id);
                    setIsAddUnitOpen(true);
                  } else {
                    error('Add Property First', 'Please create a property before adding units.');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Unit
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTab('leases')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition"
              >
                View Leases ({leases.length})
              </button>
              <button
                onClick={() => setCurrentTab('maintenance')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition"
              >
                Triage Board ({requests.length})
              </button>
            </div>
          </div>

          {/* Overdue Rent Section */}
          {overdueLeases.length > 0 && (
            <div className="bg-amber-50/60 border border-amber-300 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-slate-900 text-base">Overdue Rent Balances</h3>
                  <span className="bg-amber-200 text-amber-900 text-xs px-2 py-0.5 rounded-full font-bold">
                    {overdueLeases.length} Tenant(s)
                  </span>
                </div>
                <button
                  onClick={() => setCurrentTab('leases')}
                  className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
                >
                  Manage All Leases <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {overdueLeases.map((lease) => (
                  <div key={lease._id} className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{lease.tenant?.name}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                          OVERDUE
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {lease.property?.name} &bull; Unit {lease.unit?.unitNumber}
                      </p>
                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-xs text-slate-500">Unpaid Balance:</span>
                        <span className="text-base font-extrabold text-rose-600">
                          {lease.balanceSummary?.balance.toLocaleString()} RWF
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedLeaseForPayment(lease);
                        setPaymentAmount(lease.balanceSummary?.balance || lease.monthlyRent);
                        setIsRecordPaymentOpen(true);
                      }}
                      className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition"
                    >
                      Record Rent Payment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority Maintenance Triage Board Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Open Maintenance Requests (AI Triaged)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sorted by urgency: Emergencies and urgent requests automatically pinned to top
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('maintenance')}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                Open Full Triage Board <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {requests.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                No maintenance requests reported yet.
              </div>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 5).map((req) => (
                  <div
                    key={req._id}
                    className={`p-4 rounded-xl border transition-all ${
                      req.is_emergency
                        ? 'bg-red-50/70 border-red-300 shadow-sm'
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(req.category)}
                        <span className="font-bold text-slate-900 text-xs capitalize">
                          {req.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            req.urgency === 'urgent'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : req.urgency === 'normal'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {req.urgency}
                        </span>
                        {req.is_emergency && (
                          <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full animate-pulse">
                            EMERGENCY 112
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                          {req.property?.name} &bull; Unit {req.unit?.unitNumber}
                        </span>
                        <select
                          value={req.status}
                          onChange={(e) => handleUpdateStatus(req._id, e.target.value as any)}
                          className="text-xs font-bold rounded-lg px-2.5 py-1 border border-slate-300 bg-white"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="fixed">Fixed</option>
                        </select>
                      </div>
                    </div>

                    {/* AI Summary */}
                    <div className="mt-2 text-xs">
                      <span className="font-bold text-slate-700">AI Summary: </span>
                      <span className="text-slate-800 font-medium">{req.aiSummary}</span>
                    </div>

                    {/* Tenant Original Words (Permanent) */}
                    <div className="mt-1 text-xs text-slate-500 italic bg-white/80 p-2 rounded border border-slate-200/60">
                      Tenant's Words: "{req.originalDescription}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. PROPERTIES & UNITS VIEW */}
      {currentTab === 'properties' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Properties &amp; Units</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your real estate portfolio, units, photos, and tenant invite links
              </p>
            </div>
            <button
              onClick={() => setIsAddPropertyOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
            >
              <Plus className="w-4 h-4" /> Add New Property
            </button>
          </div>

          <div className="space-y-6">
            {properties.map((prop) => (
              <div key={prop._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <img
                      src={prop.imageUrl}
                      alt={prop.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg">{prop.name}</h3>
                      <p className="text-xs text-slate-500">
                        {prop.address}, {prop.city}, {prop.country} &bull;{' '}
                        <span className="capitalize font-semibold text-emerald-700">{prop.propertyType}</span>
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-600">
                        <span><strong>{prop.totalUnits || 0}</strong> Units</span>
                        <span><strong>{prop.occupiedUnits || 0}</strong> Occupied</span>
                        <span><strong>{prop.vacantUnits || 0}</strong> Vacant</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPropertyIdForUnit(prop._id);
                        setIsAddUnitOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Unit
                    </button>
                  </div>
                </div>

                {/* Units List */}
                <div className="p-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Units in this Property
                  </h4>

                  {/* Fetch or find units */}
                  <UnitsSubList
                    propertyId={prop._id}
                    onInviteTenant={(unit) => {
                      setSelectedUnitForInvite(unit);
                      setInviteCustomRent(unit.monthlyRent);
                      setGeneratedInviteLink(null);
                      setInviteEmail('');
                      setIsInviteTenantOpen(true);
                    }}
                    onGenerateAiDesc={handleGenerateAiDescription}
                    isGeneratingAi={isGeneratingAi}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. LEASES & RENT VIEW */}
      {currentTab === 'leases' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Leases &amp; Rent Balances</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official rent balances calculated from lease start date, payments ledger &amp; overdue flags
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Tenant &amp; Contact</th>
                    <th className="px-5 py-3.5">Property &amp; Unit</th>
                    <th className="px-5 py-3.5">Lease Start</th>
                    <th className="px-5 py-3.5">Monthly Rent</th>
                    <th className="px-5 py-3.5">Total Paid</th>
                    <th className="px-5 py-3.5">Current Balance</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leases.map((lease) => {
                    const balance = lease.balanceSummary?.balance ?? 0;
                    const isOverdue = balance > 0;

                    return (
                      <tr key={lease._id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900">{lease.tenant?.name}</div>
                          <div className="text-[11px] text-slate-500">{lease.tenant?.email}</div>
                          <div className="text-[11px] text-slate-400">{lease.tenant?.phone}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-800">{lease.property?.name}</div>
                          <div className="text-slate-500">Unit {lease.unit?.unitNumber}</div>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {new Date(lease.startDate).toLocaleDateString()}
                          <div className="text-[10px] text-slate-400">
                            {lease.balanceSummary?.monthsElapsed} month(s) elapsed
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800">
                          {Number(lease.monthlyRent).toLocaleString()} RWF
                        </td>
                        <td className="px-5 py-4 text-emerald-700 font-bold">
                          {lease.balanceSummary?.totalPaid.toLocaleString()} RWF
                        </td>
                        <td className="px-5 py-4">
                          <span className={`font-black text-sm ${isOverdue ? 'text-rose-600' : 'text-emerald-700'}`}>
                            {balance.toLocaleString()} RWF
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              lease.balanceSummary?.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : lease.balanceSummary?.paymentStatus === 'PARTIAL'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {lease.balanceSummary?.paymentStatus || 'PAID'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedLeaseForPayment(lease);
                              setPaymentAmount(balance > 0 ? balance : lease.monthlyRent);
                              setIsRecordPaymentOpen(true);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition"
                          >
                            Record Payment
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-4">Recorded Payment History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Receipt #</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Tenant</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td className="px-4 py-3 font-mono font-bold text-slate-700">{p.receiptNumber}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {typeof p.tenant === 'object' ? p.tenant.name : 'Tenant'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{p.forMonth}</td>
                      <td className="px-4 py-3 uppercase text-[10px] font-bold text-slate-500">{p.paymentMethod.replace('_', ' ')}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">{p.amount.toLocaleString()} RWF</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. MAINTENANCE TRIAGE BOARD VIEW */}
      {currentTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Maintenance Triage Board</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every request triaged by LLM &bull; Emergencies pinned to top in red &bull; Tenant's words preserved
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-bold text-slate-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </span>

            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
              >
                <option value="all">All Categories</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="doors and locks">Doors and locks</option>
                <option value="appliances">Appliances</option>
                <option value="structure (roof, walls, windows)">Structure</option>
                <option value="pests">Pests</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
              >
                <option value="all">All Urgency</option>
                <option value="urgent">Urgent</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>

            <span className="ml-auto text-slate-400 font-semibold">
              Showing {requests.length} Requests
            </span>
          </div>

          {/* Requests Grid */}
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className={`p-6 rounded-2xl border transition-all ${
                  req.is_emergency
                    ? 'bg-red-50/70 border-red-400 shadow-lg shadow-red-500/10'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                        {getCategoryIcon(req.category)}
                      </div>
                      <span className="font-extrabold text-slate-900 text-sm capitalize">
                        {req.category}
                      </span>

                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          req.urgency === 'urgent'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : req.urgency === 'normal'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        Urgency: {req.urgency}
                      </span>

                      {req.is_emergency && (
                        <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                          <Flame className="w-3 h-3" /> EMERGENCY ALERT (112)
                        </span>
                      )}

                      {req.categoryOverriddenByLandlord && (
                        <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          Category Modified by Landlord
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Property: <strong>{req.property?.name}</strong> &bull; Unit <strong>{req.unit?.unitNumber}</strong> &bull; Tenant: <strong>{req.tenant?.name}</strong> ({req.tenant?.phone})
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold">Status:</span>
                    <select
                      value={req.status}
                      onChange={(e) => handleUpdateStatus(req._id, e.target.value as any)}
                      className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border transition ${
                        req.status === 'fixed'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : req.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      <option value="open">OPEN</option>
                      <option value="in_progress">IN PROGRESS</option>
                      <option value="fixed">FIXED</option>
                    </select>
                  </div>
                </div>

                {/* AI Summary Block */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                    AI Diagnostic Summary:
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{req.aiSummary}</p>
                </div>

                {/* Tenant's Original Words (Permanent) */}
                <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200 text-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Tenant's Original Words:
                  </div>
                  <p className="text-slate-700 italic font-mono leading-relaxed">
                    "{req.originalDescription}"
                  </p>
                </div>

                {/* Follow Up Clarifications */}
                <div className="mt-3 flex flex-col md:flex-row gap-3 text-xs">
                  <div className="flex-1 bg-violet-50/70 p-2.5 rounded-lg border border-violet-100">
                    <span className="font-bold text-violet-900 block">AI Follow-Up Question:</span>
                    <span className="text-violet-800">{req.aiFollowUpQuestion}</span>
                  </div>
                  {req.tenantFollowUpAnswer && (
                    <div className="flex-1 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100">
                      <span className="font-bold text-emerald-900 block">Tenant's Clarification:</span>
                      <span className="text-emerald-800">{req.tenantFollowUpAnswer}</span>
                    </div>
                  )}
                </div>

                {/* Landlord Quick Override Controls */}
                <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Override Classification:</span>
                    <select
                      value={req.category}
                      onChange={(e) => handleOverrideTriage(req._id, e.target.value, undefined)}
                      className="px-2 py-1 rounded border border-slate-300 text-slate-700 bg-white"
                    >
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="doors and locks">Doors &amp; locks</option>
                      <option value="appliances">Appliances</option>
                      <option value="structure (roof, walls, windows)">Structure</option>
                      <option value="pests">Pests</option>
                      <option value="other">Other</option>
                    </select>

                    <select
                      value={req.urgency}
                      onChange={(e) => handleOverrideTriage(req._id, undefined, e.target.value)}
                      className="px-2 py-1 rounded border border-slate-300 text-slate-700 bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Reported on {new Date(req.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD PROPERTY */}
      {isAddPropertyOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-black text-xl text-slate-900 mb-1">Add New Property</h3>
            <p className="text-xs text-slate-500 mb-4">Enter building specifications and location details</p>

            <form onSubmit={handleCreateProperty} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Property Name</label>
                <input
                  type="text"
                  required
                  value={newPropName}
                  onChange={(e) => setNewPropName(e.target.value)}
                  placeholder="e.g. Kigali View Terraces"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={newPropAddress}
                  onChange={(e) => setNewPropAddress(e.target.value)}
                  placeholder="e.g. KG 14 Ave, Nyarutarama"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={newPropCity}
                    onChange={(e) => setNewPropCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Type</label>
                  <select
                    value={newPropType}
                    onChange={(e) => setNewPropType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="single_family">Single Family</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Photo Image URL (optional)</label>
                <input
                  type="url"
                  value={newPropImage}
                  onChange={(e) => setNewPropImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPropertyOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD UNIT */}
      {isAddUnitOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-black text-xl text-slate-900 mb-1">Add Unit to Property</h3>
            <p className="text-xs text-slate-500 mb-4">Specify unit number, rent amount, and room count</p>

            <form onSubmit={handleCreateUnit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Unit Number / Identifier</label>
                <input
                  type="text"
                  required
                  value={newUnitNumber}
                  onChange={(e) => setNewUnitNumber(e.target.value)}
                  placeholder="e.g. 201 or B-12"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min="1"
                    value={newUnitBeds}
                    onChange={(e) => setNewUnitBeds(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bathrooms</label>
                  <input
                    type="number"
                    min="1"
                    value={newUnitBaths}
                    onChange={(e) => setNewUnitBaths(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Area (sq ft)</label>
                  <input
                    type="number"
                    value={newUnitSqFt}
                    onChange={(e) => setNewUnitSqFt(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Monthly Rent (RWF)</label>
                <input
                  type="number"
                  required
                  step="5000"
                  value={newUnitRent}
                  onChange={(e) => setNewUnitRent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Amenities (comma separated)</label>
                <input
                  type="text"
                  value={newUnitAmenities}
                  onChange={(e) => setNewUnitAmenities(e.target.value)}
                  placeholder="Balcony, Water Heater, Parking"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUnitOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INVITE TENANT */}
      {isInviteTenantOpen && selectedUnitForInvite && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <h3 className="font-black text-xl text-slate-900 mb-1">Invite Tenant to Unit {selectedUnitForInvite.unitNumber}</h3>
            <p className="text-xs text-slate-500 mb-4">
              Tenants must be invited by the landlord to link directly to the unit
            </p>

            <form onSubmit={handleCreateInvite} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tenant Email Address (Optional for Direct Resend Email)</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="tenant@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  If provided, an invitation email with the secure registration link will be dispatched via Resend.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Agreed Monthly Rent (RWF)</label>
                <input
                  type="number"
                  value={inviteCustomRent || selectedUnitForInvite.monthlyRent}
                  onChange={(e) => setInviteCustomRent(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-emerald-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
              >
                Generate Tenant Invite Link
              </button>
            </form>

            {generatedInviteLink && (
              <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs">
                <span className="font-bold text-emerald-900 block mb-1">Shareable Tenant Invite Link:</span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    readOnly
                    value={generatedInviteLink}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-emerald-300 bg-white font-mono text-xs text-emerald-950"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedInviteLink);
                      success('Copied', 'Invite link copied to clipboard!');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-emerald-800">
                  <span>Valid for 14 days</span>
                  <button
                    onClick={onOpenOutbox}
                    className="underline font-bold text-emerald-900"
                  >
                    View in Resend Outbox
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsInviteTenantOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RECORD PAYMENT */}
      {isRecordPaymentOpen && selectedLeaseForPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <h3 className="font-black text-xl text-slate-900 mb-1">Record Rent Payment</h3>
            <p className="text-xs text-slate-500 mb-4">
              Tenant: <strong>{selectedLeaseForPayment.tenant?.name}</strong> &bull; Unit {selectedLeaseForPayment.unit?.unitNumber}
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Amount Paid (RWF)</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base font-black text-emerald-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">For Month / Period</label>
                <input
                  type="text"
                  required
                  value={paymentForMonth}
                  onChange={(e) => setPaymentForMonth(e.target.value)}
                  placeholder="e.g. November 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                >
                  <option value="mobile_money">MTN / Airtel Mobile Money</option>
                  <option value="bank_transfer">Bank Transfer (BK / I&M / Equity)</option>
                  <option value="cash">Cash In Hand</option>
                  <option value="card">Card / Other</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Transaction Reference #</label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g. MOMO-991204"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Paid on time, full balance cleared"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Confirm &amp; Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component to render units of a property with actions
function UnitsSubList({
  propertyId,
  onInviteTenant,
  onGenerateAiDesc,
  isGeneratingAi,
}: {
  propertyId: string;
  onInviteTenant: (unit: Unit) => void;
  onGenerateAiDesc: (unitId: string) => void;
  isGeneratingAi: Record<string, boolean>;
}) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUnitsByProperty(propertyId).then((res) => {
      setUnits(res.units || []);
      setLoading(false);
    });
  }, [propertyId]);

  if (loading) {
    return <div className="text-xs text-slate-400 py-2">Loading units...</div>;
  }

  if (units.length === 0) {
    return (
      <div className="text-xs text-slate-400 italic py-2">
        No units added yet. Click "+ Add Unit" above to add apartments to this property.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {units.map((unit) => {
        const isOccupied = unit.status === 'occupied';

        return (
          <div
            key={unit._id}
            className={`p-4 rounded-xl border flex flex-col justify-between transition ${
              isOccupied ? 'bg-slate-50 border-slate-200' : 'bg-emerald-50/40 border-emerald-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-base">Unit {unit.unitNumber}</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isOccupied ? 'bg-slate-200 text-slate-700' : 'bg-emerald-200 text-emerald-800'
                  }`}
                >
                  {isOccupied ? 'Occupied' : 'Vacant'}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-1">
                {unit.bedrooms} Bed &bull; {unit.bathrooms} Bath &bull; {unit.squareFeet} sq ft
              </p>

              <div className="mt-2 text-sm font-black text-emerald-700">
                {Number(unit.monthlyRent).toLocaleString()} RWF / mo
              </div>

              {isOccupied && unit.currentTenant && (
                <div className="mt-2 p-2 rounded bg-white border border-slate-200 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Tenant:</span>
                  <span className="font-bold text-slate-800">{unit.currentTenant.name}</span>
                </div>
              )}

              {unit.aiGeneratedDescription && (
                <div className="mt-2 p-2 rounded-lg bg-violet-50 border border-violet-100 text-[11px] text-violet-900">
                  <span className="font-bold flex items-center gap-1 text-violet-700">
                    <Sparkles className="w-3 h-3 text-yellow-500" /> AI Listing Description:
                  </span>
                  <p className="mt-0.5 italic">{unit.aiGeneratedDescription}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap gap-2">
              {!isOccupied && (
                <>
                  <button
                    onClick={() => onInviteTenant(unit)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition"
                  >
                    <Mail className="w-3.5 h-3.5" /> Invite Tenant
                  </button>

                  <button
                    onClick={() => onGenerateAiDesc(unit._id)}
                    disabled={isGeneratingAi[unit._id]}
                    className="py-1.5 px-2.5 rounded-lg bg-violet-100 hover:bg-violet-200 text-violet-800 font-semibold text-xs flex items-center gap-1 transition"
                    title="Generate AI listing description (Stretch Goal)"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi[unit._id] ? 'animate-spin' : ''}`} />
                    {isGeneratingAi[unit._id] ? 'Writing...' : 'AI Desc'}
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
