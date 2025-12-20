import React from 'react';
import { Disease } from '../types';
import { Activity, Bug, ArrowRight } from 'lucide-react';

interface DiseaseCardProps {
  disease: Disease;
  onClick: () => void;
}

const DiseaseCard: React.FC<DiseaseCardProps> = ({ disease, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-6 shadow-sm hover:shadow-xl hover:shadow-teal-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 dark:bg-teal-900/10 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-[10px] font-black rounded-lg uppercase tracking-wider backdrop-blur-sm">
            <Activity size={12} />
            {disease.searchCount} Insights
          </div>
        </div>

        <h3 className="text-lg font-black mb-1.5 text-slate-800 dark:text-white leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          {disease.name}
        </h3>

        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-6">
          <Bug size={14} className="opacity-70" />
          <p className="text-xs font-medium italic line-clamp-1">
            {disease.causalAgent}
          </p>
        </div>

        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-wrap gap-1.5 pr-4">
            {disease.hosts.slice(0, 3).map((h, i) => (
              <span key={i} className="px-2 py-1 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-md border border-slate-100 dark:border-slate-800 uppercase tracking-tight">
                {h.animalName}
              </span>
            ))}
            {disease.hosts.length > 3 && (
              <span className="px-2 py-1 bg-slate-50 dark:bg-slate-900/50 text-slate-400 text-[10px] font-bold rounded-md border border-slate-100 dark:border-slate-800">
                +{disease.hosts.length - 3}
              </span>
            )}
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseCard;
