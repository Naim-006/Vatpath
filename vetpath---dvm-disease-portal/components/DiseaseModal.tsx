import React, { useState } from 'react';
import { Disease, TreatmentType } from '../types';
import { X, Activity, Shield, AlertTriangle, Info, Pill, Syringe, Tablets, ChevronRight, LayoutGrid, CheckCircle2 } from 'lucide-react';

interface DiseaseModalProps {
  disease: Disease;
  onClose: () => void;
}

const typeColors: Record<string, string> = {
  [TreatmentType.MEDICINE]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  [TreatmentType.DRUG]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  [TreatmentType.VACCINE]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  [TreatmentType.ANTHALMATICS]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  [TreatmentType.NOTE]: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const DiseaseModal: React.FC<DiseaseModalProps> = ({ disease, onClose }) => {
  const [activeHostIndex, setActiveHostIndex] = useState(0);
  const activeHost = disease.hosts[activeHostIndex];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl animate-fade-in p-0 md:p-6">
      <div
        className="bg-white dark:bg-slate-950 w-full h-full md:max-h-[92vh] md:max-w-7xl md:rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col border border-white/10 relative"
        role="dialog" aria-modal="true"
      >
        {/* Header - Sticky */}
        <header className="relative z-30 px-6 md:px-12 py-6 md:py-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-7">
            <div className="hidden md:flex w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[1.25rem] items-center justify-center text-white shadow-xl shadow-teal-500/20 rotate-3 group overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.4),_transparent)]"></div>
              <span className="font-black text-3xl italic tracking-tighter">V</span>
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-none mb-1 md:mb-2 italic">
                {disease.name}
              </h2>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-teal-100/50 dark:border-teal-900/30">
                  Clinical Profile v2.1
                </span>
                <span className="text-xs md:text-sm font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Activity size={14} className="text-emerald-500" />
                  {disease.causalAgent}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400 hover:text-red-500 active:scale-95 bg-slate-50/50 dark:bg-slate-900/50"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </header>

        {/* Main Layout */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-50/30 dark:bg-slate-900/10">

          {/* Mobile Navigation - Scrollable Chips */}
          <div className="md:hidden sticky top-0 z-20 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50 px-4 py-3 hide-scrollbar overflow-x-auto flex gap-2">
            {disease.hosts.map((host, idx) => (
              <button
                key={idx} onClick={() => setActiveHostIndex(idx)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-black transition-all border whitespace-nowrap ${activeHostIndex === idx
                    ? 'bg-teal-600 border-teal-500 text-white shadow-lg shadow-teal-500/20 scale-105'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
              >
                {host.animalName}
              </button>
            ))}
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden md:flex w-80 border-r border-slate-100 dark:border-slate-800/50 p-6 flex-col gap-4 bg-slate-50/50 dark:bg-slate-950/30">
            <h4 className="text-[10px] uppercase font-black tracking-[0.25em] text-slate-400 px-4 mb-2">Select Subject Host</h4>
            <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
              {disease.hosts.map((host, idx) => (
                <button
                  key={idx} onClick={() => setActiveHostIndex(idx)}
                  className={`w-full group relative flex items-center justify-between p-5 rounded-3xl transition-all duration-300 ${activeHostIndex === idx
                      ? 'bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50 translate-x-1'
                      : 'hover:bg-white/50 dark:hover:bg-slate-800/30 text-slate-500 dark:text-slate-400'
                    }`}
                >
                  <span className={`text-sm font-black italic tracking-tight ${activeHostIndex === idx ? 'text-teal-600 dark:text-teal-400' : ''}`}>
                    {host.animalName}
                  </span>
                  {activeHostIndex === idx && <ChevronRight size={16} className="text-teal-500" />}
                </button>
              ))}
            </div>

            <div className="mt-auto p-5 bg-gradient-to-br from-slate-800 to-slate-950 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
              <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1">Registry Data</p>
              <p className="text-xs font-bold leading-relaxed">Secure identification and protocol verification for clinical reference.</p>
            </div>
          </aside>

          {/* Scrolled Content Area */}
          <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar scroll-smooth">
            <div className="max-w-5xl mx-auto space-y-12 pb-20">

              {/* Host Specific Section */}
              <div className="animate-in grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12" key={activeHostIndex}>

                {/* Left Column: Diagnostics */}
                <div className="space-y-8 md:space-y-12">
                  <SectionHeader title="Clinical Profile" icon={Activity} badge="Visual Signs" />

                  <div className="grid grid-cols-1 gap-6">
                    <MainInfoCard label="Etiology (Primary Cause)" value={activeHost.cause} gradient="from-blue-500/10 to-teal-500/10" icon={Activity} />
                    <MainInfoCard label="Signs & Symptoms" value={activeHost.clinicalSigns} gradient="from-red-500/10 to-orange-500/10" isDanger icon={AlertTriangle} />
                  </div>

                  <div className="mt-10">
                    <SectionHeader title="Diagnostic Analysis" icon={LayoutGrid} badge="5-Point Check" />
                    {activeHost.diagnosisDetails && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <DiagnosisCard label="Field Observation" value={activeHost.diagnosisDetails.field} />
                        <DiagnosisCard label="Laboratory Results" value={activeHost.diagnosisDetails.laboratory} />
                        <DiagnosisCard label="Virological Screening" value={activeHost.diagnosisDetails.virologicalTest} />
                        <DiagnosisCard label="Serological Testing" value={activeHost.diagnosisDetails.serologicalTest} />
                        <div className="md:col-span-2">
                          <DiagnosisCard label="Post-Mortem Findings" value={activeHost.diagnosisDetails.postMortemFindings} isWide />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Treatment & Control */}
                <div className="space-y-8 md:space-y-12">
                  <SectionHeader title="Therapeutic Protocol" icon={Shield} badge="Clinical Agents" />

                  <div className="space-y-5">
                    {activeHost.treatments.length > 0 ? activeHost.treatments.map((t, i) => (
                      <TreatmentAgentCard key={i} treatment={t} />
                    )) : (
                      <div className="premium-card p-12 text-center border-dashed bg-transparent shadow-none">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                          <Shield size={20} />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No protocol recorded</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-12 bg-emerald-50/50 dark:bg-emerald-950/20 p-8 rounded-[2rem] border border-emerald-100/50 dark:border-emerald-800/30">
                    <SectionHeader title="Epidemiology & Control" icon={Shield} badge="Prevention" />
                    <div className="grid grid-cols-1 gap-8 mt-6">
                      <SimpleDetail label="Prevention Strategy" value={activeHost.prevention} />
                      <SimpleDetail label="Safety Guidelines" value={activeHost.precaution} isAlert />
                      <SimpleDetail label="Spread Dynamics" value={activeHost.epidemiology} />
                    </div>
                  </div>

                  {activeHost.customFields && Object.keys(activeHost.customFields).length > 0 && (
                    <div className="pt-8">
                      <SectionHeader title="Technical Data Points" icon={Info} badge="Custom" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        {Object.entries(activeHost.customFields).map(([label, value]) => (
                          <DiagnosisCard key={label} label={label} value={value as string} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// --- SUBCOMPONENTS ---

const SectionHeader: React.FC<{ title: string; icon: any; badge?: string }> = ({ title, icon: Icon, badge }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-800 transition-transform group-hover:rotate-6">
        <Icon size={18} />
      </div>
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">{title}</h3>
    </div>
    {badge && <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-md">{badge}</span>}
  </div>
);

const MainInfoCard: React.FC<{ label: string; value: string; gradient: string; isDanger?: boolean; icon: any }> = ({ label, value, gradient, isDanger, icon: Icon }) => (
  <div className={`premium-card p-6 md:p-8 relative group hover:shadow-2xl transition-all duration-700 ${isDanger ? 'border-red-100/30 dark:border-red-900/20' : ''}`}>
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} rounded-bl-[80px] -mr-8 -mt-8 opacity-50 group-hover:scale-125 transition-transform duration-1000`}></div>
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={14} className={isDanger ? 'text-red-500' : 'text-teal-500'} />
        <h5 className={`text-[10px] font-black uppercase tracking-widest ${isDanger ? 'text-red-500' : 'text-slate-400'}`}>{label}</h5>
      </div>
      <div className={`text-base md:text-lg leading-relaxed font-bold tracking-tight ${isDanger ? 'text-slate-800 dark:text-red-200' : 'text-slate-700 dark:text-slate-200'}`}>
        {formatMarkdown(value)}
      </div>
    </div>
  </div>
);

const DiagnosisCard: React.FC<{ label: string; value: string; isWide?: boolean }> = ({ label, value, isWide }) => (
  <div className="glass-card p-5 rounded-3xl hover:border-teal-500/50 transition-colors group">
    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
      {label}
      <CheckCircle2 size={10} className="text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </label>
    <div className="text-sm leading-relaxed font-semibold text-slate-600 dark:text-slate-300">
      {formatMarkdown(value)}
    </div>
  </div>
);

const TreatmentAgentCard: React.FC<{ treatment: any }> = ({ treatment: t }) => (
  <div className={`premium-card p-6 border-l-4 transition-all hover:translate-x-1 ${t.type === TreatmentType.NOTE ? 'border-slate-400 bg-slate-50/50 dark:bg-slate-900/50' : 'border-teal-500'
    }`}>
    <div className="flex items-center gap-3 mb-4">
      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${typeColors[t.type]}`}>
        {t.type}
      </span>
      {t.type !== TreatmentType.NOTE && <h5 className="text-sm font-black text-slate-800 dark:text-white italic">{t.name}</h5>}
    </div>

    {t.type !== TreatmentType.NOTE && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/50 dark:bg-slate-950/50 rounded-2xl border border-white/20 dark:border-slate-800/50 relative overflow-hidden group">
        <div className="absolute inset-y-0 right-0 w-1 bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <GridItem label="Dose" value={t.dose} icon={Tablets} />
        <GridItem label="Route" value={t.route} icon={Syringe} />
        <GridItem label="Freq" value={t.frequency} icon={Pill} />
        <GridItem label="Duration" value={t.duration} icon={Activity} />

        {t.type === TreatmentType.VACCINE && t.boosterDose && (
          <div className="col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <GridItem label="Booster" value={t.boosterDose} icon={Info} />
          </div>
        )}
      </div>
    )}

    {t.type === TreatmentType.NOTE ? (
      <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
        {formatMarkdown(t.notes)}
      </div>
    ) : (
      t.notes && (
        <div className="mt-4 flex items-start gap-2 bg-teal-50/30 dark:bg-teal-900/10 p-3 rounded-xl border border-teal-100/50 dark:border-teal-900/20">
          <Info size={14} className="text-teal-500 shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-teal-700 dark:text-teal-400 leading-relaxed italic">
            {formatMarkdown(t.notes)}
          </p>
        </div>
      )
    )}
  </div>
);

const GridItem: React.FC<{ label: string; value: string; icon: any }> = ({ label, value, icon: Icon }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1 opacity-50">
      <Icon size={10} />
      <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
    </div>
    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{value || 'N/A'}</div>
  </div>
);

const SimpleDetail: React.FC<{ label: string; value: string; isAlert?: boolean }> = ({ label, value, isAlert }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${isAlert ? 'bg-orange-500 animate-pulse' : 'bg-teal-500'}`}></div>
      <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</h5>
    </div>
    <div className={`text-sm md:text-base leading-relaxed font-semibold ${isAlert ? 'text-orange-950 dark:text-orange-200' : 'text-slate-600 dark:text-slate-300'}`}>
      {formatMarkdown(value)}
    </div>
  </div>
);

// Formatting helper for markdown-lite
function formatMarkdown(text: string) {
  if (!text) return <span className="opacity-30 italic font-medium text-xs">Unspecified</span>;
  return text.split('\n').map((line, i) => (
    <span key={i} className="block">
      {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-teal-600 dark:text-teal-400 font-black underline decoration-teal-500/20 underline-offset-4">{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </span>
  ));
}

export default DiseaseModal;
