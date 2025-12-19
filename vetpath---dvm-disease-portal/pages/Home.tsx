
import React, { useState, useMemo } from 'react';
import { Disease, SortOption } from '../types';
import { SORT_OPTIONS } from '../constants';
import DiseaseCard from '../components/DiseaseCard';
import DiseaseModal from '../components/DiseaseModal';

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
    <div className="space-y-8 animate-in fade-in duration-300">
      <section className="text-center py-6 md:py-10 space-y-4">
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-700 dark:text-white">
          DVM Clinical Disease Registry
        </h1>
        <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">
          Evidence-based medical protocols and epidemiological insights for veterinary professionals.
        </p>
        <div className="relative max-w-xl mx-auto mt-6">
          <input 
            type="text" placeholder="Search pathology or host..."
            className="w-full px-5 py-3.5 bg-white dark:bg-slate-800 border-0 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-teal-500 rounded-xl shadow-sm transition-all dark:text-white text-sm"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {filteredAndSortedDiseases.length} Records
        </div>
        <select 
          value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="bg-transparent text-xs font-bold text-slate-500 focus:outline-none cursor-pointer uppercase"
        >
          {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAndSortedDiseases.map(disease => (
          <DiseaseCard key={disease.id} disease={disease} onClick={() => handleOpenDisease(disease)} />
        ))}
      </div>

      {selectedDisease && (
        <DiseaseModal disease={selectedDisease} onClose={() => setSelectedDisease(null)} />
      )}
    </div>
  );
};

export default Home;
