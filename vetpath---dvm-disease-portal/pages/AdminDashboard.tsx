
import React, { useState, useEffect } from 'react';
import { Disease, HostEntry, AnimalType, TreatmentItem, TreatmentType } from '../types';
import { ANIMAL_OPTIONS } from '../constants';
import { suggestDiseaseDetails } from '../services/geminiService';

interface AdminDashboardProps {
  diseases: Disease[];
  customAnimalTypes: string[];
  onAddCustomAnimal: (name: string) => void;
  onUpsertDisease: (disease: Disease) => void;
  onDeleteDisease: (id: string) => void;
  isAuthorized: boolean;
  onAuthorize: () => void;
}

const emptyHost: HostEntry = {
  animalName: '',
  cause: '',
  clinicalSigns: '',
  diagnosis: '',
  treatments: [],
  prevention: '',
  precaution: '',
  epidemiology: '',
  customFields: {}
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  diseases, 
  customAnimalTypes, 
  onAddCustomAnimal, 
  onUpsertDisease, 
  onDeleteDisease,
  isAuthorized,
  onAuthorize
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [secretCode, setSecretCode] = useState('');
  const [authError, setAuthError] = useState(false);
  
  const [name, setName] = useState('');
  const [causalAgent, setCausalAgent] = useState('');
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [hostEntries, setHostEntries] = useState<Record<string, HostEntry>>({});
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [customHostName, setCustomHostName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Custom field management
  const [newFieldName, setNewFieldName] = useState('');
  const [activeCustomFieldAnimal, setActiveCustomFieldAnimal] = useState<string | null>(null);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const CORRECT_CODE = (process.env as any).ADMIN_SECRET_CODE || 'DVM2025';
    if (secretCode === CORRECT_CODE) {
      onAuthorize();
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const startEditing = (disease: Disease) => {
    setEditingId(disease.id);
    setName(disease.name);
    setCausalAgent(disease.causalAgent);
    setSelectedAnimals(disease.hosts.map(h => h.animalName));
    const entries: Record<string, HostEntry> = {};
    disease.hosts.forEach(h => {
      entries[h.animalName] = { ...h, customFields: h.customFields || {} };
    });
    setHostEntries(entries);
    setViewMode('form');
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCausalAgent('');
    setSelectedAnimals([]);
    setHostEntries({});
    setCustomHostName('');
    setShowCustomInput(false);
    setViewMode('list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnimalToggle = (animal: string) => {
    if (animal === AnimalType.OTHER) {
      setShowCustomInput(true);
      return;
    }

    setSelectedAnimals(prev => {
      const isAlreadySelected = prev.includes(animal);
      if (isAlreadySelected) {
        const next = prev.filter(a => a !== animal);
        const newHostEntries = { ...hostEntries };
        delete newHostEntries[animal];
        setHostEntries(newHostEntries);
        return next;
      } else {
        const next = [...prev, animal];
        setHostEntries(prevEntries => ({
          ...prevEntries,
          [animal]: { ...emptyHost, animalName: animal, customFields: {} }
        }));
        return next;
      }
    });
  };

  const addCustomHost = () => {
    const trimmed = customHostName.trim();
    if (!trimmed) return;
    onAddCustomAnimal(trimmed);
    if (!selectedAnimals.includes(trimmed)) {
      setSelectedAnimals(prev => [...prev, trimmed]);
      setHostEntries(prevEntries => ({
        ...prevEntries,
        [trimmed]: { ...emptyHost, animalName: trimmed, customFields: {} }
      }));
    }
    setCustomHostName('');
    setShowCustomInput(false);
  };

  const updateHostEntry = (animal: string, field: keyof HostEntry, value: any) => {
    setHostEntries(prev => ({
      ...prev,
      [animal]: {
        ...prev[animal],
        [field]: value
      }
    }));
  };

  const addCustomField = (animal: string) => {
    if (!newFieldName.trim()) return;
    const key = newFieldName.trim();
    setHostEntries(prev => ({
      ...prev,
      [animal]: {
        ...prev[animal],
        customFields: {
          ...(prev[animal].customFields || {}),
          [key]: ''
        }
      }
    }));
    setNewFieldName('');
    setActiveCustomFieldAnimal(null);
  };

  const updateCustomFieldValue = (animal: string, key: string, value: string) => {
    setHostEntries(prev => ({
      ...prev,
      [animal]: {
        ...prev[animal],
        customFields: {
          ...(prev[animal].customFields || {}),
          [key]: value
        }
      }
    }));
  };

  const removeCustomField = (animal: string, key: string) => {
    setHostEntries(prev => {
      const newFields = { ...(prev[animal].customFields || {}) };
      delete newFields[key];
      return {
        ...prev,
        [animal]: {
          ...prev[animal],
          customFields: newFields
        }
      };
    });
  };

  const addTreatment = (animal: string) => {
    const newItem: TreatmentItem = {
      id: Date.now().toString() + Math.random(),
      type: TreatmentType.MEDICINE,
      name: '',
      dose: '',
      frequency: '',
      duration: '',
      notes: ''
    };
    setHostEntries(prev => ({
      ...prev,
      [animal]: {
        ...prev[animal],
        treatments: [...prev[animal].treatments, newItem]
      }
    }));
  };

  const updateTreatmentItem = (animal: string, tId: string, field: keyof TreatmentItem, value: any) => {
    setHostEntries(prev => ({
      ...prev,
      [animal]: {
        ...prev[animal],
        treatments: prev[animal].treatments.map(t => t.id === tId ? { ...t, [field]: value } : t)
      }
    }));
  };

  const removeTreatment = (animal: string, tId: string) => {
    setHostEntries(prev => ({
      ...prev,
      [animal]: {
        ...prev[animal],
        treatments: prev[animal].treatments.filter(t => t.id !== tId)
      }
    }));
  };

  const handleAISuggest = async (animal: string) => {
    if (!name) {
      alert("Please enter a disease name first.");
      return;
    }
    setIsGenerating(animal);
    const result = await suggestDiseaseDetails(name, animal);
    setIsGenerating(null);

    if (result) {
      let structuredTreatments: TreatmentItem[] = [];
      if (result.treatment) {
        structuredTreatments = [
          { id: 't-med-' + Math.random(), type: TreatmentType.MEDICINE, name: result.treatment.medicine, dose: '', frequency: '', duration: '', notes: '' },
          { id: 't-drug-' + Math.random(), type: TreatmentType.DRUG, name: result.treatment.drug, dose: '', frequency: '', duration: '', notes: '' },
          { id: 't-vac-' + Math.random(), type: TreatmentType.VACCINE, name: result.treatment.vaccine, dose: '', frequency: '', duration: '', notes: '' },
        ];
      }
      setHostEntries(prev => ({
        ...prev,
        [animal]: { ...prev[animal], ...result, treatments: structuredTreatments, animalName: animal, customFields: prev[animal].customFields }
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAnimals.length === 0) {
      alert("Please select at least one host animal.");
      return;
    }
    const newDisease: Disease = {
      id: editingId || Date.now().toString(),
      name,
      causalAgent,
      createdAt: editingId ? diseases.find(d => d.id === editingId)?.createdAt || Date.now() : Date.now(),
      searchCount: editingId ? diseases.find(d => d.id === editingId)?.searchCount || 0 : 0,
      hosts: selectedAnimals.map(a => hostEntries[a])
    };
    onUpsertDisease(newDisease);
    resetForm();
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-in fade-in duration-500">
        <div className="w-full max-w-sm bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 text-center">
          <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-700 dark:text-white mb-2">Admin Security Check</h2>
          <p className="text-slate-500 text-xs mb-6">Enter the secret code to access management tools</p>
          
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <input 
              type="password" 
              placeholder="Secret Code" 
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-0 ring-1 rounded-xl text-center font-bold tracking-widest focus:ring-2 focus:ring-teal-500 transition-all dark:text-white ${authError ? 'ring-red-500' : 'ring-slate-100 dark:ring-slate-700'}`}
            />
            {authError && <p className="text-red-500 text-[10px] font-bold uppercase">Invalid secret code</p>}
            <button 
              type="submit"
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const allPossibleAnimals = Array.from(new Set([...ANIMAL_OPTIONS.filter(a => a !== AnimalType.OTHER), ...customAnimalTypes]));

  if (viewMode === 'list') {
    return (
      <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-700 dark:text-white">Registry Management</h1>
            <p className="text-sm text-slate-500">Edit or publish veterinary medical protocols</p>
          </div>
          <button 
            onClick={() => { resetForm(); setViewMode('form'); }}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md flex items-center gap-2 group text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            ADD DISEASE
          </button>
        </header>

        <div className="grid grid-cols-1 gap-3">
          {diseases.map(disease => (
            <div key={disease.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:border-teal-300 transition-all shadow-sm">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-700 dark:text-white truncate">{disease.name}</h3>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mb-2">{disease.causalAgent}</p>
                <div className="flex flex-wrap gap-1.5">
                  {disease.hosts.map((h, i) => (
                    <span key={i} className="text-[10px] font-bold bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-lg text-slate-500 border border-slate-100 dark:border-slate-700 uppercase">
                      {h.animalName}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button 
                  onClick={() => startEditing(disease)}
                  className="p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-teal-600 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button 
                  onClick={() => { if(confirm(`Delete ${disease.name}?`)) onDeleteDisease(disease.id); }}
                  className="p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-red-600 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-right-4 duration-400 pb-20">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-700 dark:text-white">
            {editingId ? 'Edit Protocol' : 'New Protocol'}
          </h1>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Medical Entry Form</p>
        </div>
        <button onClick={resetForm} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase">Cancel</button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
        <section className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-700 pb-4">
            <span className="w-8 h-8 bg-teal-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">1</span>
            <h3 className="text-lg font-bold text-slate-700 dark:text-white">Identification</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Pathology Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-0 ring-1 ring-slate-100 dark:ring-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all dark:text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Causal Agent</label>
              <input type="text" required value={causalAgent} onChange={(e) => setCausalAgent(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-0 ring-1 ring-slate-100 dark:ring-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all dark:text-white" />
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-700 pb-4">
            <span className="w-8 h-8 bg-teal-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">2</span>
            <h3 className="text-lg font-bold text-slate-700 dark:text-white">Host Vectors</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {allPossibleAnimals.map(animal => {
              const isActive = selectedAnimals.includes(animal);
              return (
                <button
                  key={animal} type="button" onClick={() => handleAnimalToggle(animal)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    isActive ? 'bg-teal-600 border-teal-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  {animal}
                </button>
              );
            })}
            <button
              type="button" onClick={() => handleAnimalToggle(AnimalType.OTHER)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-teal-600 flex items-center gap-1"
            >
              + CUSTOM
            </button>
          </div>
          {showCustomInput && (
            <div className="flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
              <input 
                type="text" value={customHostName} onChange={(e) => setCustomHostName(e.target.value)}
                placeholder="Custom host name..." className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border-0 ring-1 ring-teal-500/30 rounded-lg text-sm dark:text-white font-semibold"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomHost())}
              />
              <button type="button" onClick={addCustomHost} className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg uppercase">Add</button>
              <button type="button" onClick={() => setShowCustomInput(false)} className="text-xs font-bold text-slate-400">Cancel</button>
            </div>
          )}
        </section>

        {selectedAnimals.map((animal) => (
          <section key={animal} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border-2 border-slate-50 dark:border-slate-700 shadow-md space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-teal-600 text-white text-[10px] font-bold rounded uppercase tracking-tighter">{animal}</span>
                <h3 className="text-base font-bold text-slate-700 dark:text-white uppercase tracking-tight">Clinical Protocol</h3>
              </div>
              <button
                type="button" disabled={isGenerating === animal} onClick={() => handleAISuggest(animal)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-teal-400 text-[10px] font-bold rounded-lg hover:bg-teal-600 hover:text-white transition-all shadow-sm"
              >
                {isGenerating === animal ? 'GENERATE...' : 'AI SUGGEST'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Cause" value={hostEntries[animal]?.cause} onChange={(v) => updateHostEntry(animal, 'cause', v)} />
              <FormField label="Symptoms" value={hostEntries[animal]?.clinicalSigns} onChange={(v) => updateHostEntry(animal, 'clinicalSigns', v)} />
              <FormField label="Diagnosis" value={hostEntries[animal]?.diagnosis} onChange={(v) => updateHostEntry(animal, 'diagnosis', v)} />
              <FormField label="Prevention" value={hostEntries[animal]?.prevention} onChange={(v) => updateHostEntry(animal, 'prevention', v)} />
              <FormField label="Precautions" value={hostEntries[animal]?.precaution} onChange={(v) => updateHostEntry(animal, 'precaution', v)} />
              <FormField label="Epidemiology" value={hostEntries[animal]?.epidemiology} onChange={(v) => updateHostEntry(animal, 'epidemiology', v)} />
            </div>

            {/* Custom Fields Section */}
            <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 flex items-center gap-2">Supplemental Fields</h4>
                {activeCustomFieldAnimal !== animal ? (
                  <button type="button" onClick={() => setActiveCustomFieldAnimal(animal)} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 text-teal-600 text-[10px] font-bold rounded-lg border border-slate-100 dark:border-slate-700">+ ADD FIELD</button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" placeholder="Field Label (e.g. Incubation)" value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border-0 ring-1 ring-teal-500 rounded-lg text-[10px] font-bold dark:text-white"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomField(animal))}
                    />
                    <button type="button" onClick={() => addCustomField(animal)} className="px-3 py-1.5 bg-teal-600 text-white text-[10px] font-bold rounded-lg">SAVE</button>
                    <button type="button" onClick={() => { setActiveCustomFieldAnimal(null); setNewFieldName(''); }} className="text-[10px] font-bold text-slate-400">X</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(hostEntries[animal]?.customFields || {}).map(([key, value]) => (
                  <div key={key} className="relative group">
                    <div className="flex items-center justify-between mb-1 ml-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">{key}</label>
                      <button type="button" onClick={() => removeCustomField(animal, key)} className="text-[9px] text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase">Delete</button>
                    </div>
                    <textarea
                      rows={2}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-0 ring-1 ring-slate-100 dark:ring-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all text-xs dark:text-white font-medium resize-none"
                      value={value} onChange={(e) => updateCustomFieldValue(animal, key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 flex items-center gap-2">Therapy Protocol</h4>
                <button type="button" onClick={() => addTreatment(animal)} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 text-teal-600 text-[10px] font-bold rounded-lg border border-slate-100 dark:border-slate-700">+ ADD DRUG/VACCINE</button>
              </div>
              <div className="space-y-4">
                {hostEntries[animal]?.treatments.map((t, idx) => (
                  <div key={t.id} className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                        <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                          {Object.values(TreatmentType).map(type => (
                            <button
                              key={type} type="button" onClick={() => updateTreatmentItem(animal, t.id, 'type', type)}
                              className={`px-3 py-1 rounded text-[9px] font-bold transition-all ${t.type === type ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button type="button" onClick={() => removeTreatment(animal, t.id)} className="text-red-500 text-[10px] font-bold uppercase">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 ml-1">Name</label>
                        <input type="text" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-0 ring-1 ring-slate-100 dark:ring-slate-700 rounded-lg text-xs dark:text-white" value={t.name} onChange={(e) => updateTreatmentItem(animal, t.id, 'name', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <TreatmentSmallField label="Dose" value={t.dose} onChange={(v) => updateTreatmentItem(animal, t.id, 'dose', v)} />
                        <TreatmentSmallField label="Freq" value={t.frequency} onChange={(v) => updateTreatmentItem(animal, t.id, 'frequency', v)} />
                        <TreatmentSmallField label="Dur" value={t.duration} onChange={(v) => updateTreatmentItem(animal, t.id, 'duration', v)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {selectedAnimals.length > 0 && (
          <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
            <button
              type="submit"
              className="px-10 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center gap-3 pointer-events-auto active:scale-95"
            >
              PUBLISH RECORD
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

const FormField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{label}</label>
    <textarea
      required rows={3}
      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-0 ring-1 ring-slate-100 dark:ring-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all text-xs dark:text-white font-medium resize-none"
      value={value || ''} onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const TreatmentSmallField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-bold text-slate-400 ml-1">{label}</label>
    <input type="text" className="w-full px-2 py-2 bg-white dark:bg-slate-800 border-0 ring-1 ring-slate-100 dark:ring-slate-700 rounded-lg text-[10px] dark:text-white" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export default AdminDashboard;
