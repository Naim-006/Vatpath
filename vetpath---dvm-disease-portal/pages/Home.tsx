import React, { useState, useMemo } from 'react';
import { Disease, SortOption } from '../types';
import { SORT_OPTIONS } from '../constants';
import DiseaseCard from '../components/DiseaseCard';
import DiseaseModal from '../components/DiseaseModal';
import { Search, Filter, Stethoscope } from 'lucide-react';

interface HomeProps {
  diseases: Disease[];
  onViewDetails: (id: string) => void;
}

const Home: React.FC<HomeProps> = ({ diseases, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);

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
    onViewDetails(disease.id);
    setSelectedDisease(disease);
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Hero Section */}
      <section className="relative -mt-6 md:-mt-10 py-16 md:py-24 px-4 overflow-hidden rounded-b-[3rem] bg-gradient-to-br from-slate-50 via-teal-50/50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl -mr-20 -mt-20 user-select-none pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl -ml-20 -mb-20 user-select-none pointer-events-none"></div>

        <div className="max-w-3xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm mb-4">
            <Stethoscope size={14} className="text-teal-600" />
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">Clinical Reference v2.0</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1]">
            Veterinary <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">Pathology</span> Registry
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
            Instant access to evidence-based protocols, epidemiological insights, and clinical guidelines for veterinary professionals.
          </p>

          <div className="relative max-w-xl mx-auto mt-8 transform hover:scale-[1.01] transition-transform duration-300">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search diseases, pathogens, or hosts..."
              className="w-full pl-12 pr-5 py-4 bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none transition-all text-slate-700 dark:text-white text-base font-medium placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400 font-black text-lg">
              {filteredAndSortedDiseases.length}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Active Records</span>
              <span className="text-xs text-slate-500 font-medium">Updated 2 mins ago</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
            <Filter size={16} className="text-slate-400 ml-2" />
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value as SortOption)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${sortBy === opt.value
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
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
              <div key={disease.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <DiseaseCard disease={disease} onClick={() => handleOpenDisease(disease)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No diseases found</h3>
            <p className="text-slate-500">Try adjusting your search terms or filters.</p>
          </div>
        )}
      </div>

      {selectedDisease && (
        <DiseaseModal disease={selectedDisease} onClose={() => setSelectedDisease(null)} />
      )}
    </div>
  );
};

export default Home;
