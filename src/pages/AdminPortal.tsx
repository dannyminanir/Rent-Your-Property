import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  AdminStats,
  User,
  Property,
  MaintenanceRequest,
  Complaint,
} from '../types';
import {
  Shield,
  Building2,
  Users,
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Search,
  Filter,
  AlertOctagon,
  PhoneCall,
  Mail,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface AdminPortalProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenOutbox: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ currentTab, setCurrentTab, onOpenOutbox }) => {
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingLandlords, setPendingLandlords] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [unhandledEmergencies, setUnhandledEmergencies] = useState<{
    criticalOverdue24h: MaintenanceRequest[];
    activeRecentEmergencies: MaintenanceRequest[];
    totalUnhandledOverdue: number;
  }>({ criticalOverdue24h: [], activeRecentEmergencies: [], totalUnhandledOverdue: 0 });

  const [isLoading, setIsLoading] = useState(true);

  // Block modal state
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<User | null>(null);
  const [blockReason, setBlockReason] = useState('');

  // Complaint modal state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [complaintAdminNotes, setComplaintAdminNotes] = useState('');
  const [complaintStatus, setComplaintStatus] = useState<string>('investigating');

  // Filters for users
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, pendingRes, usersRes, propsRes, complaintsRes, emergRes] = await Promise.all([
        api.getAdminStats(),
        api.getPendingLandlords(),
        api.getAllUsers({
          role: userRoleFilter !== 'all' ? userRoleFilter : undefined,
          status: userStatusFilter !== 'all' ? userStatusFilter : undefined,
          search: userSearch.trim() || undefined,
        }),
        api.getAllPropertiesAdmin(),
        api.getAllComplaints(),
        api.getUnhandledEmergencies(),
      ]);

      setStats(statsRes.stats);
      setPendingLandlords(pendingRes.pendingLandlords || []);
      setAllUsers(usersRes.users || []);
      setAllProperties(propsRes.properties || []);
      setComplaints(complaintsRes.complaints || []);
      setUnhandledEmergencies(emergRes);
    } catch (err: any) {
      console.warn('Error loading admin data:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [userRoleFilter, userStatusFilter, userSearch]);

  const handleApproveLandlord = async (id: string, name: string) => {
    try {
      await api.approveLandlord(id);
      success('Landlord Approved', `${name} can now publish properties. Confirmation email sent.`);
      loadAdminData();
    } catch (err: any) {
      error('Approval Failed', err.message);
    }
  };

  const handleRejectLandlord = async (id: string, name: string) => {
    const reason = window.prompt(`Enter rejection reason for ${name}:`);
    if (!reason) return;
    try {
      await api.rejectLandlord(id, reason);
      warning('Landlord Application Rejected', `${name} has been rejected.`);
      loadAdminData();
    } catch (err: any) {
      error('Rejection Failed', err.message);
    }
  };

  const handleBlockUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToBlock || !blockReason.trim()) return;

    try {
      await api.blockUser(userToBlock._id || userToBlock.id, blockReason.trim());
      warning('Account Suspended', `${userToBlock.name} has been blocked.`);
      setIsBlockModalOpen(false);
      setUserToBlock(null);
      setBlockReason('');
      loadAdminData();
    } catch (err: any) {
      error('Block Action Failed', err.message);
    }
  };

  const handleUnblockUser = async (userObj: User) => {
    try {
      await api.unblockUser(userObj._id || userObj.id);
      success('Account Restored', `${userObj.name} has been restored to approved status.`);
      loadAdminData();
    } catch (err: any) {
      error('Unblock Action Failed', err.message);
    }
  };

  const handleUpdateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await api.updateComplaintStatus(selectedComplaint._id, complaintStatus, complaintAdminNotes.trim());
      success('Complaint Updated', 'Status and resolution notes updated.');
      setSelectedComplaint(null);
      loadAdminData();
    } catch (err: any) {
      error('Update Failed', err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 24h EMERGENCY BANNER (Crucial Admin Requirement) */}
      {unhandledEmergencies.totalUnhandledOverdue > 0 && (
        <div className="bg-red-500/10 border-2 border-red-500 rounded-3xl p-6 text-red-950 shadow-xl shadow-red-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-emergency-glow">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-red-600 rounded-2xl text-white shrink-0 animate-bounce">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  CRITICAL ADMIN ALERT
                </span>
                <span className="font-extrabold text-red-900 text-base">
                  {unhandledEmergencies.totalUnhandledOverdue} Emergency Request(s) Unhandled for &gt;24 Hours!
                </span>
              </div>
              <p className="text-xs text-red-800 mt-1">
                These tenant emergency reports have not been marked in-progress or fixed within 24 hours. Intervene immediately to protect tenant safety.
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('admin-emergencies')}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition shrink-0"
          >
            Review &amp; Contact Landlord
          </button>
        </div>
      )}

      {/* 1. OVERVIEW & STATS TAB */}
      {currentTab === 'admin-stats' && (
        <div className="space-y-8">
          <div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-wider border border-purple-200">
              Platform Administration
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">Platform Overview &amp; Health</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live metrics across landlords, tenants, occupancy rates, open triage requests, and rent
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Landlords</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-purple-700">{stats?.totalLandlords ?? 0}</span>
                <span className="text-xs text-slate-500">Registered</span>
              </div>
              <div className="mt-2 text-xs font-bold text-amber-600">
                {stats?.pendingLandlords ?? 0} waiting for approval
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Tenants</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-blue-600">{stats?.totalTenants ?? 0}</span>
                <span className="text-xs text-slate-500">Active</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">All linked to verified units</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Occupancy Rate</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-600">{stats?.occupancyRate ?? 0}%</span>
                <span className="text-xs text-slate-500">Portfolio</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {stats?.occupiedUnits ?? 0} occupied / {stats?.totalUnits ?? 0} total units
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Rent Tracked</span>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900">
                  {stats ? (stats.totalRentCollected).toLocaleString() : 0} RWF
                </span>
              </div>
              <p className="mt-2 text-xs text-emerald-600 font-semibold">100% recorded through ledger</p>
            </div>
          </div>

          {/* Pending Landlord Approvals Quick Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Landlord Approval Queue</h3>
                <p className="text-xs text-slate-500">Landlords cannot invite tenants until verified by admin</p>
              </div>
              <button
                onClick={() => setCurrentTab('admin-approvals')}
                className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
              >
                View Full Queue <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingLandlords.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                All landlord applications have been reviewed!
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLandlords.map((landlord) => (
                  <div key={landlord._id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{landlord.name}</div>
                      <div className="text-xs text-slate-600">{landlord.email} &bull; {landlord.phone || 'No phone'}</div>
                      <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                        Applied on {new Date(landlord.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveLandlord(landlord._id || landlord.id, landlord.name)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectLandlord(landlord._id || landlord.id, landlord.name)}
                        className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. LANDLORD APPROVALS TAB */}
      {currentTab === 'admin-approvals' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Landlord Account Approvals</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and verify landlord credentials before approving them for unit publishing
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {pendingLandlords.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">No Pending Approvals</p>
                <p className="text-xs mt-1">All landlord accounts are reviewed.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingLandlords.map((landlord) => (
                  <div key={landlord._id} className="p-6 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{landlord.name}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                          PENDING APPROVAL
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500 flex items-center gap-3">
                        <span>Email: <strong>{landlord.email}</strong></span>
                        <span>Phone: <strong>{landlord.phone || 'N/A'}</strong></span>
                        <span>Registered: {new Date(landlord.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveLandlord(landlord._id || landlord.id, landlord.name)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve Account
                      </button>
                      <button
                        onClick={() => handleRejectLandlord(landlord._id || landlord.id, landlord.name)}
                        className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. 24h EMERGENCY MONITOR TAB */}
      {currentTab === 'admin-emergencies' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Flame className="w-7 h-7 text-red-600 animate-pulse" />
              Emergency Requests Monitor (&gt;24 Hours Overdue)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict platform safety policy: Any emergency not marked in-progress or fixed within 24 hours triggers follow-up
            </p>
          </div>

          {/* Overdue Section */}
          <div className="bg-white rounded-2xl border-2 border-red-300 p-6 shadow-md">
            <h3 className="font-extrabold text-red-950 text-base mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              Critical Overdue Emergencies (&gt;24 Hours Without In-Progress)
            </h3>

            {unhandledEmergencies.criticalOverdue24h.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                No emergency requests overdue past 24 hours.
              </div>
            ) : (
              <div className="space-y-4">
                {unhandledEmergencies.criticalOverdue24h.map((req) => (
                  <div key={req._id} className="p-4 rounded-xl border border-red-300 bg-red-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                          CRITICAL OVERDUE 24H+
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{req.property?.name} &bull; Unit {req.unit?.unitNumber}</span>
                      </div>
                      <span className="text-xs text-red-800 font-bold">
                        Created {new Date(req.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-xs bg-white p-3 rounded-lg border border-red-200">
                      <span className="font-bold text-slate-700 block mb-0.5">Original Tenant Report:</span>
                      <p className="text-slate-800 italic font-mono">"{req.originalDescription}"</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2">
                      <div className="text-slate-700">
                        Landlord: <strong>{req.landlord?.name}</strong> ({req.landlord?.phone}) &bull;{' '}
                        Tenant: <strong>{req.tenant?.name}</strong> ({req.tenant?.phone})
                      </div>
                      <a
                        href={`tel:${req.landlord?.phone || ''}`}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> Call Landlord Immediately
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Recent Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-3">Recent Emergencies (&lt;24 Hours Old)</h3>
            {unhandledEmergencies.activeRecentEmergencies.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">No recent active emergencies.</div>
            ) : (
              <div className="space-y-3">
                {unhandledEmergencies.activeRecentEmergencies.map((req) => (
                  <div key={req._id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{req.property?.name} Unit {req.unit?.unitNumber}</span>
                      <p className="text-slate-600 italic">"{req.originalDescription}"</p>
                    </div>
                    <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Open ({new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. TENANT COMPLAINTS TAB */}
      {currentTab === 'admin-complaints' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tenant Complaints Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and mediate formal disputes submitted by tenants against landlords
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {complaints.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No complaints filed.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <div key={c._id} className="p-6 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-base">{c.subject}</span>
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
                          {c.urgency === 'urgent' && (
                            <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                              URGENT
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 mt-1">
                          Tenant: <strong>{c.tenant?.name}</strong> ({c.tenant?.phone}) &bull; Against Landlord: <strong>{c.landlord?.name}</strong> ({c.landlord?.phone})
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedComplaint(c);
                          setComplaintStatus(c.status);
                          setComplaintAdminNotes(c.adminNotes || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs"
                      >
                        Update Resolution
                      </button>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                      "{c.description}"
                    </p>

                    {c.adminNotes && (
                      <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900">
                        <span className="font-bold block text-[10px] uppercase text-purple-700">Official Admin Note:</span>
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

      {/* 5. USERS & BLOCKING TAB */}
      {currentTab === 'admin-users' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Users Management &amp; Account Blocking</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Full user directory with authority to suspend/block accounts with mandatory reason
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by name or email..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-medium"
              >
                <option value="all">All Roles</option>
                <option value="landlord">Landlords</option>
                <option value="tenant">Tenants</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            <div>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Blocked Reason</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allUsers.map((u) => (
                    <tr key={u._id || u.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-500">{u.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="capitalize font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full text-[10px]">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            u.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 italic">
                        {u.blockedReason || '-'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {u.role !== 'admin' && (
                          u.status === 'blocked' ? (
                            <button
                              onClick={() => handleUnblockUser(u)}
                              className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200"
                            >
                              Unblock Account
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setUserToBlock(u);
                                setBlockReason('');
                                setIsBlockModalOpen(true);
                              }}
                              className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200"
                            >
                              Block Account
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BLOCK ACCOUNT WITH MANDATORY REASON */}
      {isBlockModalOpen && userToBlock && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-black text-xl text-slate-900 mb-1">Suspend &amp; Block Account</h3>
            <p className="text-xs text-slate-500 mb-4">
              User: <strong>{userToBlock.name}</strong> ({userToBlock.email})
            </p>

            <form onSubmit={handleBlockUser} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mandatory Reason for Suspension:</label>
                <textarea
                  rows={3}
                  required
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Failure to respond to emergency gas leaks, multiple tenant complaints..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!blockReason.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition disabled:opacity-50"
                >
                  Confirm Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE COMPLAINT RESOLUTION */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-purple-200">
            <h3 className="font-black text-xl text-slate-900 mb-1">Update Complaint Resolution</h3>
            <p className="text-xs text-slate-500 mb-4">
              Dispute: <strong>{selectedComplaint.subject}</strong>
            </p>

            <form onSubmit={handleUpdateComplaint} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Investigation Status</label>
                <select
                  value={complaintStatus}
                  onChange={(e) => setComplaintStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                >
                  <option value="open">Open</option>
                  <option value="investigating">Investigating / Contacting Landlord</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Administrator Note:</label>
                <textarea
                  rows={3}
                  value={complaintAdminNotes}
                  onChange={(e) => setComplaintAdminNotes(e.target.value)}
                  placeholder="e.g. Contacted landlord Jean-Paul. Emergency plumber dispatched today at 2pm."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Save Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

