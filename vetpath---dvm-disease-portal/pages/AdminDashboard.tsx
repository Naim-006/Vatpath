import React, { useState, useRef, useEffect } from 'react';
import { Disease, HostEntry, AnimalType, TreatmentItem, TreatmentType, DiagnosisDetails } from '../types';
import { ANIMAL_OPTIONS } from '../constants';
import { Plus, X, Trash2, Edit, Save, Shield, FileText, Activity, Download, Upload, ChevronRight, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { exportDiseases, parseImportFile } from '../services/ImportExportService';

interface AdminDashboardProps {
  diseases: Disease[];
  customAnimalTypes: string[];
  onAddCustomAnimal: (name: string) => void;
  onUpsertDisease: (disease: Disease) => void;
  onDeleteDisease: (id: string) => void;
}

const emptyHost: HostEntry = {
  animalName: '',
  cause: '',
  clinicalSigns: '',
  diagnosisDetails: {
    field: '',
    laboratory: '',
    virologicalTest: '',
    serologicalTest: '',
    postMortemFindings: ''
  },
  treatments: [],
  prevention: '',
  precaution: '',
  epidemiology: '',
  customFields: {}
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  diseases, customAnimalTypes, onAddCustomAnimal, onUpsertDisease, onDeleteDisease
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState('');
  const [causalAgent, setCausalAgent] = useState('');
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [hostEntries, setHostEntries] = useState<Record<string, HostEntry>>({});
  const [activeAnimalTab, setActiveAnimalTab] = useState<string | null>(null);

  const [customHostName, setCustomHostName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [activeCustomFieldAnimal, setActiveCustomFieldAnimal] = useState<string | null>(null);

  // Auto-Restore Draft
  useEffect(() => {
    const draft = localStorage.getItem('vetpath_admin_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (confirm('Unsaved work found. Restore your last session?')) {
          setName(parsed.name || '');
          setCausalAgent(parsed.causalAgent || '');
          setSelectedAnimals(parsed.selectedAnimals || []);
          setHostEntries(parsed.hostEntries || {});
          setEditingId(parsed.editingId || null);
          setActiveAnimalTab(parsed.selectedAnimals?.[0] || null);
          setViewMode('form');
        } else {
          localStorage.removeItem('vetpath_admin_draft');
        }
      } catch (e) {
        console.error("Failed to restore draft", e);
      }
    }
  }, []);

  // Auto-Save Draft
  useEffect(() => {
    if (viewMode === 'form') {
      const draft = {
        name, causalAgent, selectedAnimals, hostEntries, editingId, timestamp: Date.now()
      };
      localStorage.setItem('vetpath_admin_draft', JSON.stringify(draft));
    }
  }, [name, causalAgent, selectedAnimals, hostEntries, editingId, viewMode]);

  const handleExport = () => {
    if (confirm("Download registry as Excel file?")) exportDiseases(diseases);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (confirm(`Importing "${file.name}" will overwrite matching records. Continue?`)) {
      try {
        const imported = await parseImportFile(file);
        for (const d of imported) await onUpsertDisease(d);
        alert(`Successfully imported ${imported.length} records.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) { alert("Import failed. Check file format."); }
    }
  };

  const startEditing = (disease: Disease) => {
    setEditingId(disease.id);
    setName(disease.name);
    setCausalAgent(disease.causalAgent);
    const hostNames = disease.hosts.map(h => h.animalName);
    setSelectedAnimals(hostNames);
    const entries: Record<string, HostEntry> = {};
    disease.hosts.forEach(h => { entries[h.animalName] = { ...h, customFields: h.customFields || {} }; });
    setHostEntries(entries);
    setActiveAnimalTab(hostNames[0] || null);
    setViewMode('form');
  };

  const resetForm = () => {
    setEditingId(null); setName(''); setCausalAgent(''); setSelectedAnimals([]);
    setHostEntries({}); setCustomHostName(''); setShowCustomInput(false);
    setActiveAnimalTab(null);
    setViewMode('list'); window.scrollTo({ top: 0, behavior: 'smooth' });
    localStorage.removeItem('vetpath_admin_draft');
  };

  const handleAnimalToggle = (animal: string) => {
    if (animal === AnimalType.OTHER) { setShowCustomInput(true); return; }
    setSelectedAnimals(prev => {
      if (prev.includes(animal)) {
        const next = prev.filter(a => a !== animal);
        const newHostEntries = { ...hostEntries };
        delete newHostEntries[animal];
        setHostEntries(newHostEntries);
        if (activeAnimalTab === animal) setActiveAnimalTab(next[0] || null);
        return next;
      } else {
        const newEntry = { ...emptyHost, animalName: animal, customFields: {} };
        setHostEntries(prevEntries => ({ ...prevEntries, [animal]: newEntry }));
        if (!activeAnimalTab) setActiveAnimalTab(animal);
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
      setActiveAnimalTab(trimmed);
    }
    setCustomHostName(''); setShowCustomInput(false);
  };

  const updateHostEntry = (animal: string, field: keyof HostEntry, value: any) => {
    setHostEntries(prev => ({ ...prev, [animal]: { ...prev[animal], [field]: value } }));
  };

  const updateDiagnosisDetail = (animal: string, subfield: keyof DiagnosisDetails, value: any) => {
    setHostEntries(prev => ({
      ...prev, [animal]: {
        ...prev[animal], diagnosisDetails: { ...(prev[animal].diagnosisDetails || {}), [subfield]: value }
      }
    }));
  };

  const addCustomField = (animal: string) => {
    if (!newFieldName.trim()) return;
    setHostEntries(prev => ({ ...prev, [animal]: { ...prev[animal], customFields: { ...(prev[animal].customFields || {}), [newFieldName.trim()]: '' } } }));
    setNewFieldName(''); setActiveCustomFieldAnimal(null);
  };

  const addTreatment = (animal: string) => {
    const newItem: TreatmentItem = {
      id: Date.now().toString() + Math.random(),
      type: TreatmentType.MEDICINE,
      name: '', dose: '', route: '', frequency: '', duration: '', boosterDose: '', notes: ''
    };
    setHostEntries(prev => ({ ...prev, [animal]: { ...prev[animal], treatments: [...prev[animal].treatments, newItem] } }));
  };

  const updateTreatmentItem = (animal: string, tId: string, field: keyof TreatmentItem, value: any) => {
    setHostEntries(prev => ({ ...prev, [animal]: { ...prev[animal], treatments: prev[animal].treatments.map(t => t.id === tId ? { ...t, [field]: value } : t) } }));
  };

  const removeTreatment = (animal: string, tId: string) => {
    setHostEntries(prev => ({ ...prev, [animal]: { ...prev[animal], treatments: prev[animal].treatments.filter(t => t.id !== tId) } }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAnimals.length === 0) { alert("Select at least one host."); return; }
    onUpsertDisease({
      id: editingId || Date.now().toString(),
      name, causalAgent,
      createdAt: editingId ? diseases.find(d => d.id === editingId)?.createdAt || Date.now() : Date.now(),
      searchCount: editingId ? diseases.find(d => d.id === editingId)?.searchCount || 0 : 0,
      hosts: selectedAnimals.map(a => hostEntries[a])
    });
    resetForm();
  };

  const allPossibleAnimals = Array.from(new Set([...ANIMAL_OPTIONS.filter(a => a !== AnimalType.OTHER), ...customAnimalTypes]));

  if (viewMode === 'list') {
    return (
      <div className="space-y-8 animate-fade-in pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Registry Control</h1>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Protocol Management System</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.csv" onChange={handleFileChange} />
            <div className="flex h-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-1 shadow-sm">
              <button onClick={handleImportClick} className="px-4 flex items-center gap-2 text-slate-500 hover:text-teal-600 font-bold text-xs uppercase" title="Import Data"><Upload size={16} /> Import</button>
              <div className="w-px bg-slate-100 dark:bg-slate-700 my-2"></div>
              <button onClick={handleExport} className="px-4 flex items-center gap-2 text-slate-500 hover:text-teal-600 font-bold text-xs uppercase" title="Export Data"><Download size={16} /> Export</button>
            </div>
            <button onClick={() => { resetForm(); setViewMode('form'); }} className="h-12 px-8 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-xl shadow-teal-500/20 flex items-center gap-3 transition-all active:scale-95 group">
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
              <span className="text-sm uppercase tracking-wider">New Record</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {diseases.length === 0 ? (
            <div className="py-20 text-center bg-slate-50/50 dark:bg-slate-900/10 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
              <FileText size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs font-black">Electronic Registry is Empty</p>
            </div>
          ) : diseases.map(disease => (
            <div key={disease.id} className="group premium-card p-6 md:p-8 flex items-center justify-between hover:border-teal-400/50 relative overflow-hidden">
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-4 mb-3">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight italic">{disease.name}</h3>
                  <span className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-[10px] font-black rounded-lg uppercase border border-teal-100/50 dark:border-teal-800">
                    {disease.causalAgent}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {disease.hosts.map((h, i) => (
                    <span key={i} className="text-[10px] font-black text-slate-500 bg-slate-50/50 dark:bg-slate-950 px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-slate-800 uppercase tracking-tighter">
                      {h.animalName}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 relative z-20">
                <button onClick={() => startEditing(disease)} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 text-slate-400 hover:text-teal-600 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all">
                  <Edit size={18} />
                </button>
                <button onClick={() => { if (confirm(`Purge ${disease.name}?`)) onDeleteDisease(disease.id); }} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 text-slate-400 hover:text-red-500 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all">
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
    <div className="max-w-6xl mx-auto animate-in pb-40">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-500/20">
              <LayoutGrid size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">
                {editingId ? 'Modify Record' : 'Create Entry'}
              </h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Veterinary Informatics Matrix</p>
            </div>
          </div>
        </div>
        <button onClick={resetForm} className="h-10 px-6 text-[10px] font-black text-slate-400 hover:text-red-500 transition-all uppercase tracking-widest bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm active:scale-95">Discard Entry</button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Step 1: Identification */}
        <div className="premium-card p-8 md:p-12 space-y-8">
          <SectionHeader number="01" title="Biological Identification" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputField label="Disease Name" value={name} onChange={setName} required placeholder="Pathology label..." />
            <InputField label="Causal Agent" value={causalAgent} onChange={setCausalAgent} required placeholder="Microorganism ID..." />
          </div>
        </div>

        {/* Step 2: Hosts Selection */}
        <div className="premium-card p-8 md:p-12 space-y-8">
          <SectionHeader number="02" title="Subject Distribution" />
          <div className="flex flex-wrap gap-2 pb-4">
            {allPossibleAnimals.map(animal => (
              <button
                key={animal} type="button" onClick={() => handleAnimalToggle(animal)}
                className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedAnimals.includes(animal)
                  ? 'bg-teal-600 border-teal-500 text-white shadow-xl shadow-teal-500/30 -translate-y-1'
                  : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                  }`}
              >
                {animal}
              </button>
            ))}
            <button
              type="button" onClick={() => setShowCustomInput(!showCustomInput)}
              className="px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-950 border border-dashed border-teal-500 text-teal-600 flex items-center gap-2 hover:bg-teal-50"
            >
              <Plus size={14} /> Custom Host
            </button>
          </div>
          {showCustomInput && (
            <div className="flex items-center gap-3 animate-in bg-teal-50/30 dark:bg-teal-900/10 p-4 rounded-[1.5rem] border border-teal-100 dark:border-teal-800/50">
              <input
                type="text" value={customHostName} onChange={(e) => setCustomHostName(e.target.value)}
                placeholder="Declare new species..." className="flex-1 h-12 px-5 bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl text-xs dark:text-white font-black uppercase tracking-tighter shadow-sm"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomHost())}
              />
              <button type="button" onClick={addCustomHost} className="h-12 px-6 bg-teal-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-teal-500/20 active:scale-95 transition-all">Add</button>
            </div>
          )}
        </div>

        {/* Step 3: Tabbed Protocol Editor */}
        {selectedAnimals.length > 0 && (
          <div className="premium-card min-h-[600px] flex flex-col overflow-hidden transition-all duration-700">
            {/* Tabs Header */}
            <div className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800/50 flex flex-wrap hide-scrollbar overflow-x-auto p-3 gap-2">
              {selectedAnimals.map(animal => (
                <button
                  key={animal} type="button" onClick={() => setActiveAnimalTab(animal)}
                  className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 relative ${activeAnimalTab === animal
                    ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-xl shadow-slate-200/50 dark:shadow-none'
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  {animal}
                  {activeAnimalTab === animal && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-teal-500 rounded-full"></div>}
                </button>
              ))}
            </div>

            {/* Content Logic */}
            <div className="flex-1 p-8 md:p-12 animate-in space-y-12" key={activeAnimalTab}>
              {activeAnimalTab && hostEntries[activeAnimalTab] ? (
                <>
                  <SectionHeader number="03" title={`Protocol for ${activeAnimalTab}`} />

                  {/* Grid for Primary Data */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <TextAreaField label="Etiology (Primary Cause)" value={hostEntries[activeAnimalTab].cause} onChange={(v) => updateHostEntry(activeAnimalTab, 'cause', v)} color="bg-blue-50/10 dark:bg-blue-900/10" />
                    <TextAreaField label="Observed Clinical Signs" value={hostEntries[activeAnimalTab].clinicalSigns} onChange={(v) => updateHostEntry(activeAnimalTab, 'clinicalSigns', v)} color="bg-red-50/10 dark:bg-red-900/10" />
                  </div>

                  {/* Diagnosis Management */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-teal-500" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white mt-1">Diagnostic Sub-Matrix</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <DiagnosisInput label="Field Findings" value={hostEntries[activeAnimalTab].diagnosisDetails?.field} onChange={(v) => updateDiagnosisDetail(activeAnimalTab, 'field', v)} color="bg-slate-50/50 dark:bg-slate-900/10" />
                      <DiagnosisInput label="Laboratory Analysis" value={hostEntries[activeAnimalTab].diagnosisDetails?.laboratory} onChange={(v) => updateDiagnosisDetail(activeAnimalTab, 'laboratory', v)} color="bg-slate-50/50 dark:bg-slate-900/10" />
                      <DiagnosisInput label="Virological Screening" value={hostEntries[activeAnimalTab].diagnosisDetails?.virologicalTest} onChange={(v) => updateDiagnosisDetail(activeAnimalTab, 'virologicalTest', v)} color="bg-slate-50/50 dark:bg-slate-900/10" />
                      <DiagnosisInput label="Serological Screening" value={hostEntries[activeAnimalTab].diagnosisDetails?.serologicalTest} onChange={(v) => updateDiagnosisDetail(activeAnimalTab, 'serologicalTest', v)} color="bg-slate-50/50 dark:bg-slate-900/10" />
                      <div className="lg:col-span-2">
                        <DiagnosisInput label="Post-Mortem / Necropsy Findings" value={hostEntries[activeAnimalTab].diagnosisDetails?.postMortemFindings} onChange={(v) => updateDiagnosisDetail(activeAnimalTab, 'postMortemFindings', v)} color="bg-slate-50/50 dark:bg-slate-900/10" />
                      </div>
                    </div>
                  </div>

                  {/* Management Data */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <TextAreaField label="Prevention Strategy" value={hostEntries[activeAnimalTab].prevention} onChange={(v) => updateHostEntry(activeAnimalTab, 'prevention', v)} />
                    <TextAreaField label="Safety Precautions" value={hostEntries[activeAnimalTab].precaution} onChange={(v) => updateHostEntry(activeAnimalTab, 'precaution', v)} />
                    <TextAreaField label="Epidemiological Context" value={hostEntries[activeAnimalTab].epidemiology} onChange={(v) => updateHostEntry(activeAnimalTab, 'epidemiology', v)} />
                  </div>

                  {/* Treatments Matrix */}
                  <div className="space-y-8 pt-12 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield size={18} className="text-teal-600" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 mt-1">Therapeutic Agents</h4>
                      </div>
                      <button type="button" onClick={() => addTreatment(activeAnimalTab)} className="h-10 px-6 bg-slate-950 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all">+ Add Agent</button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {hostEntries[activeAnimalTab].treatments.length === 0 ? (
                        <div className="py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-center">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Matrix is currently empty</p>
                        </div>
                      ) : hostEntries[activeAnimalTab].treatments.map((t, idx) => (
                        <TreatmentFormCard key={t.id} idx={idx} treatment={t} animal={activeAnimalTab} onUpdate={updateTreatmentItem} onRemove={removeTreatment} />
                      ))}
                    </div>
                  </div>

                  {/* Custom Fields */}
                  <div className="pt-12 border-t border-slate-100 dark:border-slate-800 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Advanced Metadata</h4>
                      {activeCustomFieldAnimal !== activeAnimalTab ? (
                        <button type="button" onClick={() => setActiveCustomFieldAnimal(activeAnimalTab)} className="text-[10px] font-bold text-teal-600 px-4 py-2 bg-teal-50 dark:bg-teal-900/20 rounded-xl">+ NEW KEY</button>
                      ) : (
                        <div className="flex items-center gap-2 animate-in">
                          <input type="text" placeholder="Key Name..." value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} className="w-40 h-9 px-3 bg-white dark:bg-slate-900 border rounded-lg text-xs font-bold" onKeyDown={(e) => e.key === 'Enter' && addCustomField(activeAnimalTab)} />
                          <button type="button" onClick={() => addCustomField(activeAnimalTab)} className="h-9 px-4 bg-teal-600 text-white text-[10px] font-bold rounded-lg uppercase">Add</button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(hostEntries[activeAnimalTab].customFields || {}).map(([key, value]) => (
                        <div key={key} className="glass-card p-4 rounded-2xl group flex items-end gap-4 shadow-sm">
                          <div className="flex-1 space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{key}</label>
                            <input className="w-full h-10 px-4 bg-white dark:bg-slate-900 border-0 rounded-xl text-xs font-bold shadow-inner" value={value} onChange={(e) => updateCustomFieldValue(activeAnimalTab, key, e.target.value)} />
                          </div>
                          <button type="button" onClick={() => removeCustomField(activeAnimalTab, key)} className="mb-2 p-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 select-none">
                  <LayoutGrid size={64} />
                  <p className="mt-4 font-black uppercase tracking-[0.3em] text-xs">Initialization Pending</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Global Submit Floating Bar */}
        {selectedAnimals.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 flex justify-center animate-in">
            <button
              type="submit"
              className="px-20 h-16 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm rounded-[1.5rem] shadow-2xl shadow-teal-500/40 transition-all flex items-center gap-4 transform hover:-translate-y-1 active:scale-95 group"
            >
              <CheckCircle2 size={24} className="group-hover:scale-125 transition-transform" />
              <span className="uppercase tracking-[0.15em]">Publish Protocol to Registry</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

// --- SUBCOMPONENTS ---

const SectionHeader: React.FC<{ number: string; title: string }> = ({ number, title }) => (
  <div className="flex items-center gap-5 border-b border-slate-100 dark:border-slate-800 pb-8">
    <div className="w-14 h-14 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-900 font-black text-2xl shadow-2xl shadow-slate-900/20 dark:shadow-none italic tracking-tighter shrink-0">{number}</div>
    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic">{title}</h3>
  </div>
);

const InputField: React.FC<{ label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }> = ({ label, value, onChange, required, placeholder }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
    <input
      type="text" required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-14 px-6 bg-slate-50/50 dark:bg-slate-900 border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-[1.25rem] focus:ring-2 focus:ring-teal-500 transition-all dark:text-white font-black text-sm uppercase tracking-tighter placeholder:opacity-50"
    />
  </div>
);

const DiagnosisInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; color?: string }> = ({ label, value, onChange, color }) => (
  <div className="space-y-2 group">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 group-focus-within:text-teal-500 transition-colors">{label}</label>
    <textarea
      rows={3} value={value} onChange={(e) => onChange(e.target.value)}
      className={`w-full px-5 py-4 ${color || 'bg-white dark:bg-slate-900'} border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all text-sm font-semibold dark:text-white shadow-inner resize-none leading-relaxed`}
      placeholder="Type analysis..."
    />
  </div>
);

const TextAreaField: React.FC<{ label: string; value: string; onChange: (v: string) => void; color?: string }> = ({ label, value, onChange, color }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleBold = () => {
    const el = textareaRef.current; if (!el) return;
    const start = el.selectionStart; const end = el.selectionEnd;
    const text = el.value;
    const newValue = `${text.substring(0, start)}**${text.substring(start, end)}**${text.substring(end)}`;
    onChange(newValue);
    setTimeout(() => { el.focus(); el.setSelectionRange(start + 2, end + 2); }, 0);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <button type="button" onClick={handleBold} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-teal-600 transition-colors shadow-sm" title="Bold selection">B</button>
      </div>
      <textarea
        ref={textareaRef} rows={5} value={value || ''} onChange={(e) => onChange(e.target.value)}
        className={`w-full px-6 py-5 ${color || 'bg-slate-50/50 dark:bg-slate-950'} border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-[1.5rem] focus:ring-2 focus:ring-teal-500 transition-all text-xs font-semibold dark:text-white resize-none leading-relaxed shadow-inner`}
      />
    </div>
  );
};

const TreatmentFormCard: React.FC<{ idx: number; treatment: TreatmentItem; animal: string; onUpdate: any; onRemove: any }> = ({ idx, treatment, animal, onUpdate, onRemove }) => (
  <div className="glass-card p-6 md:p-8 rounded-[2rem] border-2 border-slate-100/50 dark:border-slate-800/50 hover:border-teal-400 group transition-all duration-500">
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-slate-300">#{idx + 1}</div>
      <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 shadow-inner">
        {Object.values(TreatmentType).map(type => (
          <button
            key={type} type="button" onClick={() => onUpdate(animal, treatment.id, 'type', type)}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${treatment.type === type ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="flex-1"></div>
      <button type="button" onClick={() => onRemove(animal, treatment.id)} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"><Trash2 size={18} /></button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {(treatment.type === TreatmentType.MEDICINE || treatment.type === TreatmentType.DRUG || treatment.type === TreatmentType.ANTHALMATICS) && (
        <>
          <div className="md:col-span-4 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Drug Label</label>
            <input className="w-full h-12 px-4 bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-xl text-xs font-black uppercase tracking-tighter" value={treatment.name} onChange={(v) => onUpdate(animal, treatment.id, 'name', v.target.value)} placeholder="..." />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Dose</label>
            <input className="w-full h-12 px-4 bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-xl text-xs font-bold" value={treatment.dose || ''} onChange={(v) => onUpdate(animal, treatment.id, 'dose', v.target.value)} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Route</label>
            <input className="w-full h-12 px-4 bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-xl text-xs font-bold" value={treatment.route || ''} onChange={(v) => onUpdate(animal, treatment.id, 'route', v.target.value)} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Freq</label>
            <input className="w-full h-12 px-4 bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-xl text-xs font-bold" value={treatment.frequency || ''} onChange={(v) => onUpdate(animal, treatment.id, 'frequency', v.target.value)} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Days</label>
            <input className="w-full h-12 px-4 bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-xl text-xs font-bold" value={treatment.duration || ''} onChange={(v) => onUpdate(animal, treatment.id, 'duration', v.target.value)} />
          </div>
        </>
      )}

      {treatment.type === TreatmentType.VACCINE && (
        <>
          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Vaccine Name</label>
            <input className="w-full h-12 px-4 bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-xl text-xs font-black uppercase tracking-tighter" value={treatment.name} onChange={(v) => onUpdate(animal, treatment.id, 'name', v.target.value)} />
          </div>
          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Route</label>
            <input className="w-full h-12 px-4 bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-xl text-xs font-bold" value={treatment.route || ''} onChange={(v) => onUpdate(animal, treatment.id, 'route', v.target.value)} />
          </div>
          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Schedule</label>
            <input className="w-full h-12 px-4 bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-xl text-xs font-bold" value={treatment.duration || ''} onChange={(v) => onUpdate(animal, treatment.id, 'duration', v.target.value)} />
          </div>
          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Booster</label>
            <input className="w-full h-12 px-4 bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-xl text-xs font-bold" value={treatment.boosterDose || ''} onChange={(v) => onUpdate(animal, treatment.id, 'boosterDose', v.target.value)} />
          </div>
        </>
      )}

      {treatment.type === TreatmentType.NOTE && (
        <div className="md:col-span-12 space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Clinical Remarks</label>
          <textarea className="w-full h-24 px-5 py-4 bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl text-xs font-bold shadow-inner resize-none" value={treatment.notes || ''} onChange={(v) => onUpdate(animal, treatment.id, 'notes', v.target.value)} placeholder="Type remarks..." />
        </div>
      )}

      {treatment.type !== TreatmentType.NOTE && (
        <div className="md:col-span-12 space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Additional Agent Instruction</label>
          <input className="w-full h-12 px-5 bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-xl text-xs font-semibold italic opacity-80" value={treatment.notes || ''} onChange={(v) => onUpdate(animal, treatment.id, 'notes', v.target.value)} placeholder="e.g. Give with food..." />
        </div>
      )}
    </div>
  </div>
);

export default AdminDashboard;
