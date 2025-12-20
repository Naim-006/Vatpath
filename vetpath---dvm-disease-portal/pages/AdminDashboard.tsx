import React, { useState, useRef } from 'react';
import { Disease, HostEntry, AnimalType, TreatmentItem, TreatmentType } from '../types';
import { ANIMAL_OPTIONS } from '../constants';
import { Plus, X, Trash2, Edit, Save, Shield, FolderPlus, FileText, Activity, Download, Upload } from 'lucide-react';
import { exportDiseases, parseImportFile } from '../services/ImportExportService';

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
  animalName: '', cause: '', clinicalSigns: '', diagnosis: '', treatments: [], prevention: '', precaution: '', epidemiology: '', customFields: {}
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  diseases, customAnimalTypes, onAddCustomAnimal, onUpsertDisease, onDeleteDisease, isAuthorized, onAuthorize
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [secretCode, setSecretCode] = useState('');
  const [authError, setAuthError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (confirm("Download registry as Excel file?")) {
      exportDiseases(diseases);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (confirm(`Importing "${file.name}" will overwrite existing records with matching IDs. Continue?`)) {
      try {
        const imported = await parseImportFile(file);
        let count = 0;
        for (const d of imported) {
          await onUpsertDisease(d);
          count++;
        }
        alert(`Successfully imported ${count} records.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        console.error(err);
        alert("Failed to import file. Check format.");
      }
    } else {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const [name, setName] = useState('');
  const [causalAgent, setCausalAgent] = useState('');
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [hostEntries, setHostEntries] = useState<Record<string, HostEntry>>({});

  const [customHostName, setCustomHostName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const [newFieldName, setNewFieldName] = useState('');
  const [activeCustomFieldAnimal, setActiveCustomFieldAnimal] = useState<string | null>(null);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const CORRECT_CODE = (process.env as any).ADMIN_SECRET_CODE || 'DVM2025';
    if (secretCode === CORRECT_CODE) { onAuthorize(); setAuthError(false); }
    else { setAuthError(true); }
  };

  const startEditing = (disease: Disease) => {
    setEditingId(disease.id);
    setName(disease.name);
    setCausalAgent(disease.causalAgent);
    setSelectedAnimals(disease.hosts.map(h => h.animalName));
    const entries: Record<string, HostEntry> = {};
    disease.hosts.forEach(h => { entries[h.animalName] = { ...h, customFields: h.customFields || {} }; });
    setHostEntries(entries);
    setViewMode('form');
  };

  const resetForm = () => {
    setEditingId(null); setName(''); setCausalAgent(''); setSelectedAnimals([]);
    setHostEntries({}); setCustomHostName(''); setShowCustomInput(false);
    setViewMode('list'); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnimalToggle = (animal: string) => {
    if (animal === AnimalType.OTHER) { setShowCustomInput(true); return; }
    setSelectedAnimals(prev => {
      if (prev.includes(animal)) {
        const next = prev.filter(a => a !== animal);
        const newHostEntries = { ...hostEntries };
        delete newHostEntries[animal];
        setHostEntries(newHostEntries);
        return next;
      } else {
        setHostEntries(prevEntries => ({ ...prevEntries, [animal]: { ...emptyHost, animalName: animal, customFields: {} } }));
        return [...prev, animal];
      }
    });
  };

  const addCustomHost = () => {
    const trimmed = customHostName.trim();
    if (!trimmed) return;
    onAddCustomAnimal(trimmed);
    if (!selectedAnimals.includes(trimmed)) {
      setSelectedAnimals(prev => [...prev, trimmed]);
      setHostEntries(prev => ({ ...prev, [trimmed]: { ...emptyHost, animalName: trimmed, customFields: {} } }));
    }
    setCustomHostName(''); setShowCustomInput(false);
  };

  const updateHostEntry = (animal: string, field: keyof HostEntry, value: any) => {
    setHostEntries(prev => ({ ...prev, [animal]: { ...prev[animal], [field]: value } }));
  };

  const addCustomField = (animal: string) => {
    if (!newFieldName.trim()) return;
    setHostEntries(prev => ({ ...prev, [animal]: { ...prev[animal], customFields: { ...(prev[animal].customFields || {}), [newFieldName.trim()]: '' } } }));
    setNewFieldName(''); setActiveCustomFieldAnimal(null);
  };

  const updateCustomFieldValue = (animal: string, key: string, value: string) => {
    setHostEntries(prev => ({ ...prev, [animal]: { ...prev[animal], customFields: { ...(prev[animal].customFields || {}), [key]: value } } }));
  };

  const removeCustomField = (animal: string, key: string) => {
    setHostEntries(prev => {
      const newFields = { ...(prev[animal].customFields || {}) };
      delete newFields[key];
      return { ...prev, [animal]: { ...prev[animal], customFields: newFields } };
    });
  };

  const addTreatment = (animal: string) => {
    const newItem: TreatmentItem = { id: Date.now().toString() + Math.random(), type: TreatmentType.MEDICINE, name: '', dose: '', frequency: '', duration: '', notes: '' };
    setHostEntries(prev => ({ ...prev, [animal]: { ...prev[animal], treatments: [...prev[animal].treatments, newItem] } }));
  };

  const updateTreatmentItem = (animal: string, tId: string, field: keyof TreatmentItem, value: any) => {
    setHostEntries(prev => ({ ...prev, [animal]: { ...prev[animal], treatments: prev[animal].treatments.map(t => t.id === tId ? { ...t, [field]: value } : t) } }));
  };

  const removeTreatment = (animal: string, tId: string) => {
    setHostEntries(prev => ({ ...prev, [animal]: { ...prev[animal], treatments: prev[animal].treatments.filter(t => t.id !== tId) } }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAnimals.length === 0) { alert("Please select at least one host animal."); return; }
    onUpsertDisease({
      id: editingId || Date.now().toString(),
      name, causalAgent,
      createdAt: editingId ? diseases.find(d => d.id === editingId)?.createdAt || Date.now() : Date.now(),
      searchCount: editingId ? diseases.find(d => d.id === editingId)?.searchCount || 0 : 0,
      hosts: selectedAnimals.map(a => hostEntries[a])
    });
    resetForm();
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
        <div className="w-full max-w-sm bg-white dark:bg-slate-800 p-10 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-teal-500/20">
            <Shield size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">Security Clearance</h2>
          <p className="text-slate-500 text-xs font-semibold mb-8">Access restricted to authorized personnel</p>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <input
              type="password" placeholder="ENTER CODE" value={secretCode} onChange={(e) => setSecretCode(e.target.value)}
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 rounded-xl text-center font-bold tracking-[0.2em] focus:ring-4 focus:ring-teal-500/10 transition-all dark:text-white ${authError ? 'border-red-500 ring-red-500/10' : 'border-slate-100 dark:border-slate-700 focus:border-teal-500'}`}
            />
            {authError && <p className="text-red-500 text-[10px] font-bold uppercase animate-pulse">Access Denied</p>}
            <button type="submit" className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 transition-all active:scale-95">UNLOCK</button>
          </form>
        </div>
      </div>
    );
  }

  const allPossibleAnimals = Array.from(new Set([...ANIMAL_OPTIONS.filter(a => a !== AnimalType.OTHER), ...customAnimalTypes]));

  if (viewMode === 'list') {
    return (
      <div className="space-y-8 animate-fade-in pb-20">
        <header className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Registry Control</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage veterinary protocols</p>
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx,.csv"
              onChange={handleFileChange}
            />
            <button
              onClick={handleImportClick}
              className="px-4 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:text-teal-600 transition-all flex items-center gap-2 text-sm shadow-sm"
              title="Import Excel/CSV"
            >
              <Upload size={18} />
              <span className="hidden md:inline">Request Import</span>
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:text-teal-600 transition-all flex items-center gap-2 text-sm shadow-sm"
              title="Export to Excel"
            >
              <Download size={18} />
              <span className="hidden md:inline">Export Data</span>
            </button>
            <button
              onClick={() => { resetForm(); setViewMode('form'); }}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 flex items-center gap-2 transform active:scale-95 transition-all text-sm"
            >
              <Plus size={18} />
              NEW RECORD
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {diseases.map(disease => (
            <div key={disease.id} className="group bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:border-teal-400 transition-all shadow-sm hover:shadow-md">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">{disease.name}</h3>
                  <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-[10px] font-black rounded uppercase tracking-wider">
                    {disease.causalAgent}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {disease.hosts.map((h, i) => (
                    <span key={i} className="text-[10px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700 uppercase">
                      {h.animalName}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                <button onClick={() => startEditing(disease)} className="p-3 bg-slate-50 dark:bg-slate-900/50 text-slate-600 hover:text-teal-600 rounded-xl transition-all">
                  <Edit size={18} />
                </button>
                <button onClick={() => { if (confirm(`Delete ${disease.name}?`)) onDeleteDisease(disease.id); }} className="p-3 bg-slate-50 dark:bg-slate-900/50 text-slate-600 hover:text-red-500 rounded-xl transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-slide-up pb-20">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {editingId ? 'Edit Protocol' : 'New Protocol'}
          </h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Medical Entry Form</p>
        </div>
        <button onClick={resetForm} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest bg-slate-50 dark:bg-slate-800 rounded-lg">Cancel</button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Identification */}
        <section className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-500/20">1</div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Pathology Identification</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Pathology Name" value={name} onChange={setName} required placeholder="e.g. Parvovirus" />
            <InputField label="Causal Agent" value={causalAgent} onChange={setCausalAgent} required placeholder="e.g. CPV-2" />
          </div>
        </section>

        {/* Step 2: Hosts */}
        <section className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-500/20">2</div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Host Distribution</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {allPossibleAnimals.map(animal => {
              const isActive = selectedAnimals.includes(animal);
              return (
                <button
                  key={animal} type="button" onClick={() => handleAnimalToggle(animal)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${isActive ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-500/30' : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  {animal}
                </button>
              );
            })}
            <button
              type="button" onClick={() => handleAnimalToggle(AnimalType.OTHER)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-dashed border-teal-500 text-teal-600 flex items-center gap-1 hover:bg-teal-50 dark:hover:bg-teal-900/20"
            >
              <Plus size={14} /> CUSTOM
            </button>
          </div>
          {showCustomInput && (
            <div className="flex items-center gap-3 animate-slide-up bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
              <input
                type="text" value={customHostName} onChange={(e) => setCustomHostName(e.target.value)}
                placeholder="Enter host name..." className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-lg text-sm dark:text-white font-semibold"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomHost())}
              />
              <button type="button" onClick={addCustomHost} className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg uppercase">Add</button>
            </div>
          )}
        </section>

        {selectedAnimals.map((animal) => (
          <section key={animal} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border-2 border-teal-50/50 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Activity size={120} className="text-teal-900 dark:text-white" />
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <span className="px-4 py-1.5 bg-teal-600 text-white text-xs font-black rounded-lg uppercase tracking-wide shadow-lg shadow-teal-500/20">{animal}</span>
              <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <TextAreaField label="Etiology (Cause)" value={hostEntries[animal]?.cause} onChange={(v) => updateHostEntry(animal, 'cause', v)} />
              <TextAreaField label="Clinical Signs" value={hostEntries[animal]?.clinicalSigns} onChange={(v) => updateHostEntry(animal, 'clinicalSigns', v)} />
              <TextAreaField label="Verification" value={hostEntries[animal]?.diagnosis} onChange={(v) => updateHostEntry(animal, 'diagnosis', v)} />
              <TextAreaField label="Prevention" value={hostEntries[animal]?.prevention} onChange={(v) => updateHostEntry(animal, 'prevention', v)} />
              <TextAreaField label="Precautions" value={hostEntries[animal]?.precaution} onChange={(v) => updateHostEntry(animal, 'precaution', v)} />
              <TextAreaField label="Epidemiology" value={hostEntries[animal]?.epidemiology} onChange={(v) => updateHostEntry(animal, 'epidemiology', v)} />
            </div>

            <div className="space-y-5 pt-6 border-t border-slate-100 dark:border-slate-800 relative z-10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Additional Data Points</h4>
                {activeCustomFieldAnimal !== animal ? (
                  <button type="button" onClick={() => setActiveCustomFieldAnimal(animal)} className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-900/20 px-3 py-1.5 rounded-lg border border-teal-100 dark:border-teal-900/30 hover:bg-teal-100 transition-colors">+ ADD FIELD</button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input type="text" placeholder="Label..." value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} className="w-32 px-2 py-1 bg-white dark:bg-slate-900 border rounded text-xs" onKeyDown={(e) => e.key === 'Enter' && addCustomField(animal)} />
                    <button type="button" onClick={() => addCustomField(animal)} className="text-[10px] font-bold text-white bg-teal-600 px-2 py-1 rounded">OK</button>
                  </div>
                )}
              </div>

              {Object.entries(hostEntries[animal]?.customFields || {}).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                  {Object.entries(hostEntries[animal]?.customFields || {}).map(([key, value]) => (
                    <div key={key} className="relative group">
                      <div className="flex justify-between mb-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{key}</label>
                        <button type="button" onClick={() => removeCustomField(animal, key)} className="text-[9px] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">DELETE</button>
                      </div>
                      <input className="w-full bg-white dark:bg-slate-900 border-0 rounded-lg px-3 py-2 text-xs font-semibold shadow-sm" value={value} onChange={(e) => updateCustomFieldValue(animal, key, e.target.value)} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800 relative z-10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-widest text-teal-600 flex items-center gap-2">
                  <Shield size={14} /> Therapeutic Protocol
                </h4>
                <button type="button" onClick={() => addTreatment(animal)} className="px-4 py-2 bg-slate-800 text-white text-[10px] font-bold rounded-lg hover:bg-slate-700 transition-colors shadow-lg shadow-slate-900/20">+ ADD AGENT</button>
              </div>
              <div className="space-y-3">
                {hostEntries[animal]?.treatments.map((t, idx) => (
                  <div key={t.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:border-teal-400 transition-colors group">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="text-[10px] font-bold text-slate-300">#{idx + 1}</span>
                      <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                        {Object.values(TreatmentType).map(type => (
                          <button
                            key={type} type="button" onClick={() => updateTreatmentItem(animal, t.id, 'type', type)}
                            className={`px-3 py-1 rounded text-[9px] font-bold transition-all ${t.type === type ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                      <div className="flex-1"></div>
                      <button type="button" onClick={() => removeTreatment(animal, t.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-4 space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 pl-1 uppercase">Agent Name</label>
                        <input type="text" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-lg text-xs font-bold dark:text-white focus:ring-teal-500" value={t.name} onChange={(e) => updateTreatmentItem(animal, t.id, 'name', e.target.value)} placeholder="Drug Name..." />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 pl-1 uppercase">Dose</label>
                        <input type="text" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-lg text-xs font-medium dark:text-white focus:ring-teal-500" value={t.dose} onChange={(e) => updateTreatmentItem(animal, t.id, 'dose', e.target.value)} />
                      </div>
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 pl-1 uppercase">Frequency</label>
                        <input type="text" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-lg text-xs font-medium dark:text-white focus:ring-teal-500" value={t.frequency} onChange={(e) => updateTreatmentItem(animal, t.id, 'frequency', e.target.value)} />
                      </div>
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 pl-1 uppercase">Duration</label>
                        <input type="text" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-lg text-xs font-medium dark:text-white focus:ring-teal-500" value={t.duration} onChange={(e) => updateTreatmentItem(animal, t.id, 'duration', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {selectedAnimals.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex justify-center animate-slide-up">
            <button
              type="submit"
              className="px-12 py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-teal-500/20 transition-all flex items-center gap-3 transform hover:-translate-y-1 active:translate-y-0"
            >
              <Save size={20} />
              PUBLISH PROTOCOL
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

const InputField: React.FC<{ label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }> = ({ label, value, onChange, required, placeholder }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
    <input
      type="text" required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all dark:text-white font-semibold placeholder:text-slate-300"
    />
  </div>
);

const TextAreaField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
    <textarea
      rows={4}
      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all text-sm dark:text-white font-medium resize-none leading-relaxed"
      value={value || ''} onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default AdminDashboard;
