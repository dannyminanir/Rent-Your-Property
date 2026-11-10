import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Invite } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Building2, Home, CheckCircle2, User, Mail, Lock, Phone, ArrowRight, AlertTriangle, Key } from 'lucide-react';

interface TenantInvitePageProps {
  inviteToken?: string;
  onNavigate: (tab: string) => void;
}

export const TenantInvitePage: React.FC<TenantInvitePageProps> = ({ inviteToken, onNavigate }) => {
  const [tokenInput, setTokenInput] = useState(inviteToken || '');
  const [invite, setInvite] = useState<Invite | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setUserDirectly, refreshUser } = useAuth();
  const { success, error } = useToast();

  const loadInvite = async (tokenToFetch: string) => {
    if (!tokenToFetch.trim()) return;
    setIsLoading(true);
    setErrorNotice('');
    try {
      const data = await api.getInviteDetails(tokenToFetch.trim());
      setInvite(data.invite);
      if (data.invite.tenantEmail) {
        setEmail(data.invite.tenantEmail);
      }
    } catch (err: any) {
      setErrorNotice(err.message || 'Invalid or expired invitation link.');
      setInvite(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (inviteToken) {
      loadInvite(inviteToken);
    } else {
      loadInvite(tokenInput);
    }
  }, [inviteToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite) return;

    setIsSubmitting(true);
    try {
      const data = await api.registerTenantWithInvite({
        token: invite.token,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      setUserDirectly(data.user, data.token);
      success('Welcome to Your New Home!', `Successfully joined ${invite.property.name} Unit ${invite.unit.unitNumber}`);
      await refreshUser();
      onNavigate('my-home');
    } catch (err: any) {
      error('Registration Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-blue-300">
                Official Invitation
              </span>
              <h2 className="text-2xl font-black text-white">Join as Tenant</h2>
            </div>
          </div>
          <p className="text-xs text-blue-200">
            Tenants join by invitation to link directly to their apartment unit and lease agreement.
          </p>

          {/* Token verification input if not verified */}
          {!invite && (
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Enter invitation token..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
              />
              <button
                type="button"
                onClick={() => loadInvite(tokenInput)}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs rounded-xl transition"
              >
                {isLoading ? 'Verifying...' : 'Verify Token'}
              </button>
            </div>
          )}
        </div>

        {errorNotice && (
          <div className="m-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">Invalid or Expired Invitation</p>
              <p className="mt-0.5">{errorNotice}</p>
            </div>
          </div>
        )}

        {invite && (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Unit Info Card */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    Assigned Property &amp; Unit
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                    {invite.property?.name} &bull; Unit {invite.unit?.unitNumber}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {invite.property?.address}, {invite.property?.city}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Monthly Rent</span>
                  <span className="text-base font-black text-blue-900">
                    {Number(invite.monthlyRent).toLocaleString()} RWF
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs text-slate-600">
                <span>Landlord: <strong>{invite.landlord?.name}</strong></span>
                <span>{invite.unit?.bedrooms} Bed &bull; {invite.unit?.bathrooms} Bath</span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Diane Keza"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tenant@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+250 788 123 456"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Joining Unit...' : 'Accept Invitation & Access Portal'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
