
import React from 'react';
import { Disease } from '../types';

interface DiseaseCardProps {
  disease: Disease;
  onClick: () => void;
}

const DiseaseCard: React.FC<DiseaseCardProps> = ({ disease, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-md hover:border-teal-400 transition-all cursor-pointer flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-[9px] font-bold rounded uppercase tracking-wider">
          {disease.searchCount} Views
        </span>
        <span className="text-[9px] font-bold text-slate-300 uppercase">ID: {disease.id.slice(0, 4)}</span>
      </div>
      
      <h3 className="text-base font-bold mb-1 text-slate-700 dark:text-white group-hover:text-teal-600 transition-colors">
        {disease.name}
      </h3>
      
      <p className="text-xs text-slate-400 mb-4 italic line-clamp-1">
        {disease.causalAgent}
      </p>

      <div className="mt-auto pt-3 border-t border-slate-50 dark:border-slate-700 flex flex-wrap gap-1.5">
        {disease.hosts.slice(0, 3).map((h, i) => (
          <span key={i} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[9px] font-bold rounded border border-slate-100 dark:border-slate-800 uppercase">
            {h.animalName}
          </span>
        ))}
        {disease.hosts.length > 3 && (
          <span className="text-[9px] font-bold text-slate-400 pt-1">+{disease.hosts.length - 3} more</span>
        )}
      </div>
    </div>
  );
};

export default DiseaseCard;
