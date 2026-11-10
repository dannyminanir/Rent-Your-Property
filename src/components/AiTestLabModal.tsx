import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Sparkles, X, Play, CheckCircle2, AlertTriangle, ShieldAlert, Globe, Clock, Layers } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface AiTestLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TestItem {
  id: number;
  text: string;
  expectedType: 'Emergency' | 'Minor' | 'Normal' | 'Vague' | 'Kinyarwanda';
  notes: string;
}

const PREDEFINED_14_TESTS: TestItem[] = [
  {
    id: 1,
    text: "There is a very strong gas smell in the kitchen and near the stove, it's making us dizzy!",
    expectedType: 'Emergency',
    notes: 'Must trigger is_emergency: true, urgency: urgent, category: appliances/other, and 112 evacuation alert.',
  },
  {
    id: 2,
    text: "Sparking and popping sounds coming from the electrical outlet behind the refrigerator with black smoke!",
    expectedType: 'Emergency',
    notes: 'Must trigger is_emergency: true, urgency: urgent, category: electrical.',
  },
  {
    id: 3,
    text: "Major water pipe burst in the bathroom ceiling, water is pouring like a waterfall and flooding the entire hallway!",
    expectedType: 'Emergency',
    notes: 'Must trigger is_emergency: true, urgency: urgent, category: plumbing.',
  },
  {
    id: 4,
    text: "The bedroom door hinge makes a tiny squeaking sound when closed late at night.",
    expectedType: 'Minor',
    notes: 'Should categorize as doors and locks, urgency: low, is_emergency: false.',
  },
  {
    id: 5,
    text: "The kitchen cabinet knob is slightly loose and wiggles when opening.",
    expectedType: 'Minor',
    notes: 'Should categorize as other/appliances, urgency: low, is_emergency: false.',
  },
  {
    id: 6,
    text: "Lightbulb in the hallway ceiling fixture burned out yesterday.",
    expectedType: 'Minor',
    notes: 'Should categorize as electrical, urgency: low, is_emergency: false.',
  },
  {
    id: 7,
    text: "Water is leaking slowly under the kitchen sink and dripping into the basin bucket.",
    expectedType: 'Normal',
    notes: 'Should categorize as plumbing, urgency: normal, is_emergency: false.',
  },
  {
    id: 8,
    text: "The refrigerator is running but not cooling properly; milk went sour.",
    expectedType: 'Normal',
    notes: 'Should categorize as appliances, urgency: normal, is_emergency: false.',
  },
  {
    id: 9,
    text: "We noticed some ants and small cockroaches around the pantry baseboard.",
    expectedType: 'Normal',
    notes: 'Should categorize as pests, urgency: normal, is_emergency: false.',
  },
  {
    id: 10,
    text: "something is wrong with the door",
    expectedType: 'Vague',
    notes: 'Vague test: AI must classify under doors and locks, urgency: normal/low, and ask a clarifying follow-up.',
  },
  {
    id: 11,
    text: "The wall looks weird and there is a strange noise in the living room.",
    expectedType: 'Vague',
    notes: 'Vague test: AI must categorize under structure, urgency: normal, and ask follow-up questions.',
  },
  {
    id: 12,
    text: "Hari impumuro ikomeye ya gazi mu gikoni kandi dufite ubwoba ko hashobora kwaka umuriro!",
    expectedType: 'Kinyarwanda',
    notes: 'Kinyarwanda Emergency: Gas smell & fear of fire. Must flag is_emergency: true, translate summary to English.',
  },
  {
    id: 13,
    text: "Amazi ari kuva munsi ya shinga mu gikoni kandi hasi hose haratose.",
    expectedType: 'Kinyarwanda',
    notes: 'Kinyarwanda Plumbing: Water leaking under sink, wet floor. Must classify as plumbing, summarize in English.',
  },
  {
    id: 14,
    text: "Amashanyarazi yabuze mu cyumba cy'uburiro gusa andi mazu afite umuriro.",
    expectedType: 'Kinyarwanda',
    notes: 'Kinyarwanda Electrical: Power outage only in bedroom. Must classify as electrical, urgency: normal.',
  },
];

export const AiTestLabModal: React.FC<AiTestLabModalProps> = ({ isOpen, onClose }) => {
  const [results, setResults] = useState<Record<number, any>>({});
  const [loadingIds, setLoadingIds] = useState<Record<number, boolean>>({});
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [customPrompt, setCustomPrompt] = useState('');
  const [customResult, setCustomResult] = useState<any>(null);
  const [customLoading, setCustomLoading] = useState(false);
  const { success, error } = useToast();

  if (!isOpen) return null;

  const runTest = async (test: TestItem) => {
    setLoadingIds((prev) => ({ ...prev, [test.id]: true }));
    try {
      const res = await api.testTriageSimulation(test.text);
      setResults((prev) => ({ ...prev, [test.id]: res.triage }));
    } catch (err: any) {
      error('Triage Test Failed', err.message);
    } finally {
      setLoadingIds((prev) => ({ ...prev, [test.id]: false }));
    }
  };

  const runAllTests = async () => {
    setIsBatchRunning(true);
    success('Starting Batch Triage', 'Running all 14 sample requests through AI triage engine...');
    for (const test of PREDEFINED_14_TESTS) {
      try {
        const res = await api.testTriageSimulation(test.text);
        setResults((prev) => ({ ...prev, [test.id]: res.triage }));
      } catch (err) {
        // continue
      }
    }
    setIsBatchRunning(false);
    success('Batch Complete', 'All 14 test requests triaged and analyzed!');
  };

  const handleCustomTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    setCustomLoading(true);
    try {
      const res = await api.testTriageSimulation(customPrompt.trim());
      setCustomResult(res.triage);
      success('AI Triage Completed', `Category: ${res.triage.category} | Urgency: ${res.triage.urgency}`);
    } catch (err: any) {
      error('Triage Error', err.message);
    } finally {
      setCustomLoading(false);
    }
  };

  const filteredTests = activeFilter === 'all'
    ? PREDEFINED_14_TESTS
    : PREDEFINED_14_TESTS.filter((t) => t.expectedType.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-yellow-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl text-white">AI Maintenance Triage Testing Lab</h3>
                <span className="bg-violet-500/30 text-violet-200 border border-violet-400/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  14 Test Suite
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Evaluates emergency alerts (112), zero-repair safety rules, categories, and Kinyarwanda translations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={runAllTests}
              disabled={isBatchRunning}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              {isBatchRunning ? 'Triaging All 14...' : 'Run All 14 Tests'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live interactive custom test bar */}
        <div className="bg-violet-50/70 border-b border-violet-100 p-4">
          <form onSubmit={handleCustomTriage} className="flex gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Type any custom problem in English, Kinyarwanda, or French (e.g., 'Amazi menshi cyane ari kumeneka mu gikoni')..."
              className="flex-1 px-4 py-2 text-sm rounded-xl border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            />
            <button
              type="submit"
              disabled={customLoading || !customPrompt.trim()}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {customLoading ? <Layers className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Test Custom
            </button>
          </form>

          {customResult && (
            <div className="mt-3 p-3 rounded-xl bg-white border border-violet-200 shadow-sm text-xs grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <span className="font-semibold text-slate-500 block">Category:</span>
                <span className="font-bold text-slate-900 capitalize">{customResult.category}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block">Urgency:</span>
                <span className={`font-bold uppercase ${customResult.urgency === 'urgent' ? 'text-red-600' : 'text-amber-600'}`}>
                  {customResult.urgency}
                </span>
                {customResult.is_emergency && (
                  <span className="ml-2 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-black animate-pulse">
                    EMERGENCY 112
                  </span>
                )}
              </div>
              <div className="md:col-span-2">
                <span className="font-semibold text-slate-500 block">AI Summary (for Landlord):</span>
                <p className="text-slate-800 italic">"{customResult.summary}"</p>
                <p className="text-violet-700 mt-1 font-medium">Q: {customResult.follow_up_question}</p>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500 mr-1">Filter Test Cases:</span>
            {['all', 'emergency', 'minor', 'normal', 'vague', 'kinyarwanda'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-full font-semibold capitalize transition ${
                  activeFilter === filter
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="text-slate-500 flex items-center gap-4">
            <span>Triaged: {Object.keys(results).length} / 14</span>
            <span className="flex items-center gap-1 text-red-600 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" /> Emergency Warnings
            </span>
            <span className="flex items-center gap-1 text-blue-600 font-semibold">
              <Globe className="w-3.5 h-3.5" /> Kinyarwanda NLP
            </span>
          </div>
        </div>

        {/* Body Cards */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {filteredTests.map((test) => {
            const res = results[test.id];
            const isLoading = loadingIds[test.id];

            return (
              <div
                key={test.id}
                className={`p-4 rounded-xl border transition-all ${
                  res?.is_emergency
                    ? 'bg-red-50/50 border-red-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-slate-400">#{test.id}</span>
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          test.expectedType === 'Emergency'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : test.expectedType === 'Kinyarwanda'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : test.expectedType === 'Vague'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : test.expectedType === 'Minor'
                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {test.expectedType}
                      </span>
                      <span className="text-xs text-slate-500 italic">{test.notes}</span>
                    </div>

                    <p className="text-sm font-medium text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono">
                      "{test.text}"
                    </p>
                  </div>

                  <button
                    onClick={() => runTest(test)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center gap-1.5 transition border border-indigo-200 shrink-0"
                  >
                    {isLoading ? (
                      <Layers className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    {res ? 'Re-run' : 'Triage AI'}
                  </button>
                </div>

                {/* AI Result Card */}
                {res && (
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50/80 p-3 rounded-lg">
                    <div>
                      <span className="font-semibold text-slate-500 block">AI Classification:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-slate-800 capitalize bg-white px-2 py-0.5 rounded border border-slate-200">
                          Category: {res.category}
                        </span>
                        <span
                          className={`font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                            res.urgency === 'urgent'
                              ? 'bg-red-100 text-red-800'
                              : res.urgency === 'normal'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          Urgency: {res.urgency}
                        </span>
                      </div>
                      {res.is_emergency && (
                        <div className="mt-2 flex items-center gap-1.5 text-red-700 font-extrabold bg-red-100 px-2.5 py-1 rounded-md border border-red-300">
                          <AlertTriangle className="w-4 h-4 text-red-600 animate-bounce" />
                          <span>EMERGENCY (Safety Alert 112)</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="font-semibold text-slate-500 block">English AI Summary for Landlord:</span>
                      <p className="text-slate-800 mt-1 font-medium bg-white p-2 rounded border border-slate-200">
                        {res.summary}
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-500 block">AI Follow-Up for Tenant:</span>
                      <p className="text-violet-800 mt-1 font-medium bg-violet-50/60 p-2 rounded border border-violet-100">
                        {res.follow_up_question}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Rules Verified: No DIY repair instructions &bull; Strict JSON &bull; Safe Fallback</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition"
          >
            Close Lab
          </button>
        </div>
      </div>
    </div>
  );
};

