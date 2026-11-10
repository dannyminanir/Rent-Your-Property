import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { EmailLogEntry } from '../types';
import { Mail, X, Check, RefreshCw, Send, ExternalLink, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface EmailOutboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailOutboxModal: React.FC<EmailOutboxModalProps> = ({ isOpen, onClose }) => {
  const [emails, setEmails] = useState<EmailLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { info } = useToast();

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const data = await api.getEmailLogs();
      setEmails(data.emails || []);
    } catch (err: any) {
      console.warn('Could not fetch email logs:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmails();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    info('Copied', 'Invite/Email content copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Resend Email Activity & Outbox</h3>
              <p className="text-xs text-slate-400">
                Live inspection of tenant invites, landlord approvals, and emergency alerts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchEmails}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Refresh outbox"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2.5 flex items-center gap-2 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Integrated with Resend API. When <code>RESEND_API_KEY</code> is set, real emails are dispatched. In development/evaluation mode, emails are also captured here so you can test invite links instantly!
          </span>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 divide-y divide-slate-100">
          {isLoading && emails.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              Loading outbox...
            </div>
          ) : emails.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Mail className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-700">No emails dispatched yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Generate a tenant invite or approve a landlord to see email dispatches!
              </p>
            </div>
          ) : (
            emails.map((email) => {
              // Extract invite link if present in preview
              const linkMatch = email.preview?.match(/https?:\/\/[^\s]+|http:\/\/localhost:\d+\/invite\/[a-f0-9]+/);
              const inviteLink = linkMatch ? linkMatch[0] : null;

              return (
                <div key={email.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{email.subject}</span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            email.mode === 'live' || email.mode === 'smtp'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {email.mode === 'live'
                            ? 'Resend Live'
                            : email.mode === 'smtp'
                              ? 'Gmail SMTP'
                              : 'Simulated Delivery'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        To: <span className="font-medium text-slate-700">{email.to}</span> &bull;{' '}
                        {new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed font-mono">
                    {email.preview}
                  </p>

                  {inviteLink && (
                    <div className="mt-2 flex items-center gap-2">
                      <a
                        href={inviteLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Invite Link
                      </a>
                      <button
                        onClick={() => copyToClipboard(inviteLink, email.id)}
                        className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition"
                      >
                        {copiedId === email.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Copied!
                          </>
                        ) : (
                          'Copy Link'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Total Recorded Emails: {emails.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
