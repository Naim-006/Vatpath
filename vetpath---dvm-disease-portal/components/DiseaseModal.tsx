
import React, { useState } from 'react';
import { Disease, HostEntry, TreatmentType } from '../types';

interface DiseaseModalProps {
  disease: Disease;
  onClose: () => void;
}

const typeColors: Record<string, string> = {
  [TreatmentType.MEDICINE]: 'bg-blue-500 text-white',
  [TreatmentType.DRUG]: 'bg-purple-500 text-white',
  [TreatmentType.VACCINE]: 'bg-amber-500 text-white',
};

const DiseaseModal: React.FC<DiseaseModalProps> = ({ disease, onClose }) => {
  const [activeHostIndex, setActiveHostIndex] = useState(0);
  const activeHost = disease.hosts[activeHostIndex];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200"
        role="dialog" aria-modal="true"
      >
        <header className="px-6 py-5 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {disease.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-700 dark:text-white leading-none">{disease.name}</h2>
              <p className="text-teal-600 dark:text-teal-400 font-bold text-[10px] mt-1 uppercase tracking-wider">{disease.causalAgent}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r border-slate-50 dark:border-slate-800 p-4 space-y-2 bg-slate-50/30 dark:bg-slate-900/50 overflow-y-auto">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 px-2 mb-2">Host Selection</h4>
            {disease.hosts.map((host, idx) => (
              <button
                key={idx} onClick={() => setActiveHostIndex(idx)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeHostIndex === idx ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {host.animalName}
              </button>
            ))}
          </aside>

          <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              <div className="space-y-8">
                <DetailItem label="Cause" value={activeHost.cause} />
                <DetailItem label="Clinical Signs" value={activeHost.clinicalSigns} color="text-red-500 font-semibold" />
                <DetailItem label="Verification" value={activeHost.diagnosis} />
                
                {/* Dynamically render custom fields here if they exist */}
                {activeHost.customFields && Object.entries(activeHost.customFields).map(([label, value]) => (
                  <DetailItem key={label} label={label} value={value} />
                ))}
              </div>
              <div className="space-y-8">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h4 className="text-teal-600 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">Therapeutics</h4>
                  <div className="space-y-5">
                    {activeHost.treatments.map((t) => (
                      <div key={t.id} className="border-l-2 border-teal-500/30 pl-4 py-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${typeColors[t.type]}`}>{t.type}</span>
                          <h5 className="text-xs font-bold text-slate-700 dark:text-white">{t.name}</h5>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {t.dose} • {t.frequency} • {t.duration}
                        </p>
                        {t.notes && <p className="mt-1 text-[10px] italic text-slate-400">{t.notes}</p>}
                      </div>
                    ))}
                    {activeHost.treatments.length === 0 && <p className="text-xs text-slate-400">No protocol recorded.</p>}
                  </div>
                </div>
                <DetailItem label="Prevention" value={activeHost.prevention} />
                <DetailItem label="Precautions" value={activeHost.precaution} />
                <DetailItem label="Epidemiology" value={activeHost.epidemiology} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div className="space-y-1.5 animate-in slide-in-from-left-2 duration-300">
    <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</h5>
    <div className={`text-sm leading-relaxed ${color || 'text-slate-600 dark:text-slate-300'}`}>
      {value || 'Not specified.'}
    </div>
  </div>
);

export default DiseaseModal;
