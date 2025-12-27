import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disease, SortOption } from '../types';
import { SORT_OPTIONS } from '../constants';
import DiseaseCard from '../components/DiseaseCard';
import { Search, Filter, Stethoscope } from 'lucide-react';

interface HomeProps {
  diseases: Disease[];
  onViewDetails: (id: string) => void;
}

const Home: React.FC<HomeProps> = ({ diseases, onViewDetails }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const filteredAndSortedDiseases = useMemo(() => {
    let result = diseases.filter(d =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.causalAgent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.hosts.some(h => h.animalName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    switch (sortBy) {
      case 'newest': result.sort((a, b) => b.createdAt - a.createdAt); break;
      case 'oldest': result.sort((a, b) => a.createdAt - b.createdAt); break;
      case 'most-searched': result.sort((a, b) => b.searchCount - a.searchCount); break;
      case 'alphabetical': result.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return result;
  }, [diseases, searchTerm, sortBy]);

  const handleOpenDisease = (disease: Disease) => {
    // onViewDetails(disease.id); // This will be handled by the Detail page effect to ensure count accuracy on load
    navigate(`/diseases/${disease.id}`);
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Standard Header Section */}
      <section className="relative -mt-6 md:-mt-10 py-12 md:py-16 px-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 mb-2">
            <Stethoscope size={14} className="text-teal-600" />
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">Clinical Reference V3.01</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            VetPath <span className="text-teal-600 dark:text-teal-400">Diagnostic Database</span>
          </h1>

          <div className="relative max-w-2xl mx-auto mt-8">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by disease name, pathogen, or animal host..."
              className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-2xl transition-all text-slate-700 dark:text-white text-base font-semibold placeholder:text-slate-400 shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Content Area with Separation */}
      <div className="bg-slate-50 dark:bg-slate-950/50 -mt-12 pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-teal-600 dark:text-teal-400 font-black text-lg shadow-sm">
                {filteredAndSortedDiseases.length}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Clinical Records</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Database Synchronized</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto">
              <div className="flex items-center gap-2 px-3 border-r border-slate-100 dark:border-slate-800 mr-1">
                <Filter size={14} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort By</span>
              </div>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value as SortOption)}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${sortBy === opt.value
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {filteredAndSortedDiseases.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedDiseases.map((disease, i) => (
                <div key={disease.id} className="animate-in" style={{ animationDelay: `${i * 30}ms` }}>
                  <DiseaseCard disease={disease} onClick={() => handleOpenDisease(disease)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">No matching records</h3>
              <p className="text-slate-400 text-xs font-bold">Try adjusting your clinical search terms.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
