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
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 md:p-6 shadow-sm hover:shadow-md hover:border-teal-500/50 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
    >
      <div className="relative z-10 flex flex-col h-full">
        {/* Compact Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-[8px] font-black rounded-lg uppercase tracking-wider border border-slate-100 dark:border-slate-800">
            <Activity size={10} />
            {disease.searchCount} Insights
          </div>
          <div className="flex items-center gap-1 px-2 py-1 text-slate-400 text-[8px] font-black uppercase tracking-widest">
            <Layers size={10} />
            {disease.hosts.length} Hosts
          </div>
        </div>

        {/* Title & Agent */}
        <div className="mb-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight group-hover:text-teal-600 transition-colors mb-1">
            {disease.name}
          </h3>
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <Bug size={12} className="shrink-0 opacity-40" />
            <p className="text-[10px] font-bold italic line-clamp-1 tracking-tight">
              {disease.causalAgent.replace(/<[^>]+>/g, '')}
            </p>
          </div>
        </div>

        {/* Action Row - Minimalist */}
        <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <div className="flex -space-x-1.5">
            {disease.hosts.slice(0, 3).map((h, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[7px] font-black text-slate-400 uppercase shadow-sm"
                title={h.animalName}
              >
                {h.animalName.charAt(0)}
              </div>
            ))}
            {disease.hosts.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[7px] font-black text-slate-400">
                +{disease.hosts.length - 3}
              </div>
            )}
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-colors shadow-sm">
            <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* Hover Gradient Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-teal-50/50 dark:from-teal-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default DiseaseCard;
