import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  LogOut,
  User as UserIcon,
  Shield,
  Menu,
  Sparkles,
  Mail,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAiLab: () => void;
  onOpenOutbox: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAiLab,
  onOpenOutbox,
  onToggleMobileSidebar,
}) => {
  const { user, logout } = useAuth();

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'landlord':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              user.status === 'approved'
                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            <Building2 className="w-3 h-3" /> Landlord{user.status === 'pending' && ' · Pending'}
          </span>
        );
      case 'tenant':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <UserIcon className="w-3 h-3" /> Tenant
          </span>
        );
    }
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'properties':
        return 'Properties & units';
      case 'leases':
        return 'Leases & rent';
      case 'maintenance':
        return 'Maintenance';
      case 'my-home':
        return 'My home';
      case 'report-problem':
        return 'Report a problem';
      case 'complaints':
        return 'Complaints';
      case 'admin-stats':
        return 'Overview';
      case 'admin-approvals':
        return 'Approvals';
      case 'admin-emergencies':
        return 'Emergency monitor';
      case 'admin-complaints':
        return 'Complaints';
      case 'admin-users':
        return 'Users';
      default:
        return 'RentPulse Platform';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section: Mobile hamburger + breadcrumb */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={onToggleMobileSidebar}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                title="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {!user ? (
              <div
                onClick={() => setCurrentTab('landing')}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white group-hover:bg-emerald-800 transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-heading text-xl font-bold tracking-tight text-slate-900">
                    RentPulse
                  </span>
                  <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-semibold tracking-widest text-slate-500 border-l border-slate-200 pl-2">
                    Property management
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="font-heading text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {getPageTitle()}
                </h1>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  RentPulse
                </p>
              </div>
            )}
          </div>

          {/* Right section: Quick Actions & Profile */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenAiLab}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                  AI Triage Lab
                </button>

                <button
                  onClick={onOpenOutbox}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  Outbox
                </button>

                <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm font-heading font-bold text-slate-800">{user.name}</span>
                    {getRoleBadge()}
                  </div>
                  <span className="text-xs text-slate-400">{user.email}</span>
                </div>

                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab('login')}
                  className="text-sm font-semibold text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-lg transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentTab('register-landlord')}
                  className="text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 px-4 py-1.5 rounded-lg transition"
                >
                  Landlord Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
