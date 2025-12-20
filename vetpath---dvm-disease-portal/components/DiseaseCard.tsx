import React from 'react';
import { Disease } from '../types';
import { Activity, Bug, ArrowRight, Layers } from 'lucide-react';

interface DiseaseCardProps {
  disease: Disease;
  onClick: () => void;
}

const DiseaseCard: React.FC<DiseaseCardProps> = ({ disease, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-2xl hover:shadow-teal-500/10 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden border-b-4 border-b-transparent hover:border-b-teal-500"
    >
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-emerald-500/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform duration-700 group-hover:scale-150 group-hover:rotate-12"></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50/50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-[9px] font-black rounded-xl uppercase tracking-[0.1em] border border-teal-100/50 dark:border-teal-800/50">
            <Activity size={12} className="group-hover:animate-pulse" />
            {disease.searchCount} Clinical Insights
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 text-[9px] font-black rounded-xl uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            <Layers size={10} />
            {disease.hosts.length} Hosts
          </div>
        </div>

        <h3 className="text-xl md:text-2xl font-black mb-2 text-slate-900 dark:text-white tracking-tight italic leading-tight group-hover:text-teal-600 transition-colors">
          {disease.name}
        </h3>

        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-8">
          <Bug size={14} className="shrink-0 opacity-50" />
          <p className="text-xs font-bold italic line-clamp-1 tracking-tight">
            {disease.causalAgent}
          </p>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <div className="flex -space-x-2 overflow-hidden">
            {disease.hosts.slice(0, 4).map((h, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-black text-slate-400 uppercase shadow-sm group-hover:border-teal-500/20 transition-colors"
                title={h.animalName}
              >
                {h.animalName.charAt(0)}
              </div>
            ))}
            {disease.hosts.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-black text-slate-400">
                +{disease.hosts.length - 4}
              </div>
            )}
          </div>

          <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-teal-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-teal-500/30 transition-all duration-500 transform group-hover:rotate-12">
            <ArrowRight size={20} strokeWidth={3} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseCard;
