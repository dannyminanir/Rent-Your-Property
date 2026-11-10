import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Home,
  Wrench,
  DollarSign,
  AlertOctagon,
  Shield,
  Clock,
  Flame,
  Users,
  Mail,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  PhoneCall,
  CheckCircle2,
  Key,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAiLab: () => void;
  onOpenOutbox: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAiLab,
  onOpenOutbox,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return null;

  const firstName = user.name.split(' ')[0] || user.name;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleNavClick = (tab: string) => {
    setCurrentTab(tab);
    setIsMobileOpen(false);
  };

  const renderNavItems = () => {
    if (user.role === 'landlord') {
      return (
        <div className="space-y-1.5">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Property Suite
          </div>

          <button
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition group ${
              currentTab === 'dashboard'
                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
            title="Overview & Dashboard"
          >
            <div className={`p-1.5 rounded-lg transition ${currentTab === 'dashboard' ? 'bg-white text-emerald-700 shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
              <Home className="w-4 h-4" />
            </div>
            {!isCollapsed && <span>Dashboard</span>}
          </button>

          <button
            onClick={() => handleNavClick('properties')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition group ${
              currentTab === 'properties'
                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
            title="Properties & Units"
          >
            <div className={`p-1.5 rounded-lg transition ${currentTab === 'properties' ? 'bg-white text-emerald-700 shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
              <Building2 className="w-4 h-4" />
            </div>
            {!isCollapsed && <span>Properties &amp; Units</span>}
          </button>

          <button
            onClick={() => handleNavClick('leases')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition group ${
              currentTab === 'leases'
                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
            title="Leases & Rent Balances"
          >
            <div className={`p-1.5 rounded-lg transition ${currentTab === 'leases' ? 'bg-white text-emerald-700 shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
              <DollarSign className="w-4 h-4" />
            </div>
            {!isCollapsed && <span>Leases &amp; rent</span>}
          </button>

          <button
            onClick={() => handleNavClick('maintenance')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition group ${
              currentTab === 'maintenance'
                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
            title="AI Maintenance Triage"
          >
            <div className={`p-1.5 rounded-lg transition ${currentTab === 'maintenance' ? 'bg-white text-emerald-700 shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
              <Sparkles className="w-4 h-4" />
            </div>
            {!isCollapsed && <span>Maintenance</span>}
          </button>
        </div>
      );
    }

    if (user.role === 'tenant') {
      return (
        <div className="space-y-1.5">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Tenant Space
          </div>

          <button
            onClick={() => handleNavClick('my-home')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition group ${
              currentTab === 'my-home'
                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition ${currentTab === 'my-home' ? 'bg-white text-emerald-700 shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
              <Home className="w-4 h-4" />
            </div>
            {!isCollapsed && <span>My home</span>}
          </button>

          <button
            onClick={() => handleNavClick('report-problem')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition group ${
              currentTab === 'report-problem'
                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition ${currentTab === 'report-problem' ? 'bg-white text-emerald-700 shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
              <Wrench className="w-4 h-4" />
            </div>
            {!isCollapsed && <span>Report a problem</span>}
          </button>

          <button
            onClick={() => handleNavClick('complaints')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition group ${
              currentTab === 'complaints'
                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition ${currentTab === 'complaints' ? 'bg-white text-emerald-700 shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
              <AlertOctagon className="w-4 h-4" />
            </div>
            {!isCollapsed && <span>Complaints</span>}
          </button>
        </div>
      );
    }

    if (user.role === 'admin') {
      return (
        <div className="space-y-1.5">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Platform Management
          </div>

          <button
            onClick={() => handleNavClick('admin-stats')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition group ${
              currentTab === 'admin-stats'
                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition ${currentTab === 'admin-stats' ? 'bg-white text-emerald-700 shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
              <Shield className="w-4 h-4" />
            </div>
            {!isCollapsed && <span>Overview</span>}
          </button>

          <button
            onClick={() => handleNavClick('admin-approvals')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition group ${
              currentTab === 'admin-approvals'
                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition ${currentTab === 'admin-approvals' ? 'bg-white text-emerald-700 shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
              <Clock className="w-4 h-4" />
            </div>
            {!isCollapsed && <span>Approvals</span>}
          </button>

          <button
            onClick={() => handleNavClick('admin-emergencies')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition group ${
              currentTab === 'admin-emergencies'
                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition ${currentTab === 'admin-emergencies' ? 'bg-white text-emerald-700 shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
              <Flame className="w-4 h-4" />
            </div>
            {!isCollapsed && <span>24h Emergency Monitor</span>}
          </button>

          <button
            onClick={() => handleNavClick('admin-complaints')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition group ${
              currentTab === 'admin-complaints'
                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition ${currentTab === 'admin-complaints' ? 'bg-white text-emerald-700 shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
              <AlertOctagon className="w-4 h-4" />
            </div>
            {!isCollapsed && <span>Complaints</span>}
          </button>

          <button
            onClick={() => handleNavClick('admin-users')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition group ${
              currentTab === 'admin-users'
                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition ${currentTab === 'admin-users' ? 'bg-white text-emerald-700 shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
              <Users className="w-4 h-4" />
            </div>
            {!isCollapsed && <span>Users</span>}
          </button>
        </div>
      );
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col justify-between ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="p-5 flex items-center justify-between border-b border-slate-100">
            <div
              onClick={() => handleNavClick(user.role === 'admin' ? 'admin-stats' : user.role === 'tenant' ? 'my-home' : 'dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white group-hover:bg-emerald-800 transition-colors shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div>
                  <div className="font-heading font-bold text-lg tracking-tight text-slate-900">
                    RentPulse
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium -mt-0.5">
                    Your Property Companion
                  </div>
                </div>
              )}
            </div>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card (Human-First Friendly) */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 text-white font-heading font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                {firstName.charAt(0)}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-slate-400 font-medium">
                    {getGreeting()},
                  </div>
                  <div className="text-sm font-heading font-bold text-slate-900 truncate">
                    {firstName}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        user.status === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    <span className="text-[10px] font-semibold uppercase text-slate-500">
                      {user.role} {user.status === 'pending' && '(Pending)'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-3.5 space-y-6 overflow-y-auto max-h-[calc(100vh-320px)]">
            {renderNavItems()}

            {/* Tools & Utilities Group */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              {!isCollapsed && (
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Assistant Tools
                </div>
              )}

              <button
                onClick={onOpenAiLab}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition group"
                title="Launch AI Triage Testing Lab (14 Tests)"
              >
                <div className="p-1 rounded-lg bg-slate-100 text-slate-600">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                {!isCollapsed && <span>AI Triage Lab (14 Tests)</span>}
              </button>

              <button
                onClick={onOpenOutbox}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition group"
                title="Inspect Resend Outbox Activity"
              >
                <div className="p-1 rounded-lg bg-slate-100 text-slate-600">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                {!isCollapsed && <span>Resend Email Outbox</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Hotline & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
          {!isCollapsed && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-red-600 shrink-0 animate-pulse" />
              <div>
                <div className="font-heading font-bold text-[11px] text-red-800">Rwanda Emergency Hotline</div>
                <div className="text-[11px] font-extrabold text-red-950">Dial 112 for Police &amp; Fire</div>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Sign out of your account"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
