import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterLandlordPage } from './pages/RegisterLandlordPage';
import { TenantInvitePage } from './pages/TenantInvitePage';
import { LandlordPortal } from './pages/LandlordPortal';
import { TenantPortal } from './pages/TenantPortal';
import { AdminPortal } from './pages/AdminPortal';
import { AiTestLabModal } from './components/AiTestLabModal';
import { EmailOutboxModal } from './components/EmailOutboxModal';

function MainRouter() {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isAiLabOpen, setIsAiLabOpen] = useState(false);
  const [isOutboxOpen, setIsOutboxOpen] = useState(false);
  const [urlInviteToken, setUrlInviteToken] = useState<string | undefined>(undefined);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Check URL pathname for /invite/:token
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/invite/')) {
      const token = path.split('/invite/')[1];
      if (token) {
        setUrlInviteToken(token);
        setCurrentTab('invite');
      }
    }
  }, []);

  // Sync default tab when user logs in or switches
  useEffect(() => {
    if (!user) {
      if (currentTab !== 'login' && currentTab !== 'register-landlord' && currentTab !== 'invite') {
        setCurrentTab('landing');
      }
    } else {
      if (user.role === 'landlord') {
        setCurrentTab('dashboard');
      } else if (user.role === 'tenant') {
        setCurrentTab('my-home');
      } else if (user.role === 'admin') {
        setCurrentTab('admin-stats');
      }
    }
  }, [user?.role, user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-heading font-bold text-sm tracking-wide">Loading RentPulse Companion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col selection:bg-emerald-500 selection:text-white font-sans">
      {/* Main Layout Container */}
      {!user ? (
        /* Public Layout (No sidebar, top navbar only) */
        <div className="flex-1 flex flex-col">
          <Navbar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            onOpenAiLab={() => setIsAiLabOpen(true)}
            onOpenOutbox={() => setIsOutboxOpen(true)}
          />
          <main className="flex-1">
            {currentTab === 'landing' && (
              <LandingPage
                onNavigate={setCurrentTab}
              />
            )}
            {currentTab === 'login' && <LoginPage onNavigate={setCurrentTab} />}
            {currentTab === 'register-landlord' && <RegisterLandlordPage onNavigate={setCurrentTab} />}
            {currentTab === 'invite' && (
              <TenantInvitePage inviteToken={urlInviteToken} onNavigate={setCurrentTab} />
            )}
          </main>
        </div>
      ) : (
        /* Logged-In Portal Layout (Human-First Sidebar + Top Header) */
        <div className="flex-1 flex">
          {/* Left Human-First Sidebar */}
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            onOpenAiLab={() => setIsAiLabOpen(true)}
            onOpenOutbox={() => setIsOutboxOpen(true)}
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
          />

          {/* Main Content Area (Offset by sidebar width on desktop) */}
          <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
            {/* Top Header */}
            <Navbar
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              onOpenAiLab={() => setIsAiLabOpen(true)}
              onOpenOutbox={() => setIsOutboxOpen(true)}
              onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            />

            {/* Dashboard Content */}
            <main className="flex-1 p-3 sm:p-6 lg:p-8">
              {user.role === 'landlord' && (
                <LandlordPortal
                  currentTab={currentTab}
                  setCurrentTab={setCurrentTab}
                  onOpenOutbox={() => setIsOutboxOpen(true)}
                />
              )}
              {user.role === 'tenant' && (
                <TenantPortal
                  currentTab={currentTab}
                  setCurrentTab={setCurrentTab}
                  onOpenAiLab={() => setIsAiLabOpen(true)}
                />
              )}
              {user.role === 'admin' && (
                <AdminPortal
                  currentTab={currentTab}
                  setCurrentTab={setCurrentTab}
                  onOpenOutbox={() => setIsOutboxOpen(true)}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <AiTestLabModal
        isOpen={isAiLabOpen}
        onClose={() => setIsAiLabOpen(false)}
      />

      <EmailOutboxModal
        isOpen={isOutboxOpen}
        onClose={() => setIsOutboxOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainRouter />
      </AuthProvider>
    </ToastProvider>
  );
}
