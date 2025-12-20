import React, { useState } from 'react';
import { Disease, HostEntry, TreatmentType } from '../types';
import { X, Activity, Shield, AlertTriangle, Info, Pill, Syringe, Tablets } from 'lucide-react';

interface DiseaseModalProps {
  disease: Disease;
  onClose: () => void;
}

const typeColors: Record<string, string> = {
  [TreatmentType.MEDICINE]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  [TreatmentType.DRUG]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  [TreatmentType.VACCINE]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const DiseaseModal: React.FC<DiseaseModalProps> = ({ disease, onClose }) => {
  const [activeHostIndex, setActiveHostIndex] = useState(0);
  const activeHost = disease.hosts[activeHostIndex];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/20 dark:border-slate-700 animate-slide-up"
        role="dialog" aria-modal="true"
      >
        {/* Header */}
        <header className="px-6 md:px-8 py-6 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-teal-500/20">
              {disease.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white leading-none tracking-tight">{disease.name}</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Pathology
                </span>
                <span className="text-teal-600 dark:text-teal-400 font-bold text-sm tracking-wide">{disease.causalAgent}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar */}
          <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 pl-2">Subject Hosts</h4>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
              {disease.hosts.map((host, idx) => (
                <button
                  key={idx} onClick={() => setActiveHostIndex(idx)}
                  className={`w-full text-left px-5 py-4 rounded-xl text-sm font-bold transition-all relative overflow-hidden group ${activeHostIndex === idx
                      ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-md border border-slate-100 dark:border-slate-700/50'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <span className="relative z-10">{host.animalName}</span>
                  {activeHostIndex === idx && <div className="absolute inset-y-0 left-0 w-1 bg-teal-500"></div>}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-10">
                <Section title="Clinical Profile" icon={Activity}>
                  <div className="space-y-8">
                    <DetailItem label="Etiology (Cause)" value={activeHost.cause} />
                    <div className="p-5 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                      <DetailItem label="Clinical Signs" value={activeHost.clinicalSigns} color="text-slate-700 dark:text-red-200" isHighlight />
                    </div>
                    <DetailItem label="Diagnosis Verification " value={activeHost.diagnosis} />
                  </div>
                </Section>

                {activeHost.customFields && Object.keys(activeHost.customFields).length > 0 && (
                  <Section title="Additional Notes" icon={Info}>
                    <div className="grid grid-cols-1 gap-6">
                      {Object.entries(activeHost.customFields).map(([label, value]) => (
                        <DetailItem key={label} label={label} value={value as string} />
                      ))}
                    </div>
                  </Section>
                )}
              </div>

              <div className="space-y-10">
                <Section title="Therapeutic Protocol" icon={Shield}>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50">
                    <div className="space-y-6">
                      {activeHost.treatments.length > 0 ? activeHost.treatments.map((t) => (
                        <div key={t.id} className="relative pl-6 border-l-2 border-teal-200 dark:border-teal-800">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${typeColors[t.type]}`}>
                              {t.type}
                            </span>
                            <h5 className="text-sm font-bold text-slate-800 dark:text-white">{t.name}</h5>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                            <div>
                              <span className="block text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Dose</span>
                              {t.dose}
                            </div>
                            <div>
                              <span className="block text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Freq</span>
                              {t.frequency}
                            </div>
                            <div>
                              <span className="block text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Duration</span>
                              {t.duration}
                            </div>
                          </div>
                          {t.notes && <p className="mt-2 text-xs italic text-slate-400">{t.notes}</p>}
                        </div>
                      )) : (
                        <div className="text-center py-8 text-slate-400">
                          <p className="text-xs font-medium">No specific protocol recorded.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Section>

                <Section title="Epidemiology & Control" icon={AlertTriangle}>
                  <div className="space-y-8">
                    <DetailItem label="Prevention Strategy" value={activeHost.prevention} />
                    <DetailItem label="Safety Precautions" value={activeHost.precaution} />
                    <DetailItem label="Epidemiological Context" value={activeHost.epidemiology} />
                  </div>
                </Section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; icon: any; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
      <Icon size={16} className="text-teal-600 dark:text-teal-400" />
      <h3 className="text-xs font-black uppercase tracking-[0.15em] text-teal-900 dark:text-teal-100">{title}</h3>
    </div>
    {children}
  </div>
);

const DetailItem: React.FC<{ label: string; value: string; color?: string; isHighlight?: boolean }> = ({ label, value, color, isHighlight }) => (
  <div className={`space-y-2 ${isHighlight ? '' : ''}`}>
    <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</h5>
    <div className={`text-sm leading-7 md:text-base md:leading-8 ${color || 'text-slate-600 dark:text-slate-300'}`}>
      {value || <span className="text-slate-300 dark:text-slate-600 italic">Not specified</span>}
    </div>
  </div>
);

export default DiseaseModal;
