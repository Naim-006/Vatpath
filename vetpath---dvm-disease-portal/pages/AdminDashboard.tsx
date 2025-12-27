import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Disease, HostEntry, AnimalType, TreatmentItem, TreatmentType, DiagnosisDetails } from '../types';
import { ANIMAL_OPTIONS } from '../constants';
import { Plus, Trash2, Edit, Save, Shield, FileText, Upload, Download, CheckCircle2, ChevronDown, ChevronUp, Image as ImageIcon, X, Loader, Sparkles } from 'lucide-react';
import { exportDiseases, parseImportFile } from '../services/ImportExportService';
import { supabase } from '../services/supabaseClient';
import { generateDiseaseContent } from '../services/aiResearchService';

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
  customFields: {},
  images: []
};

// Rich Text Editor Toolbar Modules
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'color': [] }, { 'background': [] }],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'color', 'background'
];

// Helper to strip HTML and decode common entities
const stripHtml = (html: string) => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
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

  // Image Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // AI State
  const [isResearching, setIsResearching] = useState(false);

  const handleAIResearch = async () => {
    if (!name || !activeAnimalTab) {
      alert("Please enter a Disease Name and select a Species first.");
      return;
    }

    if (!confirm(`Auto-fill protocol for ${activeAnimalTab} using AI Research? This will overwrite existing fields.`)) return;

    setIsResearching(true);
    try {
      const result = await generateDiseaseContent(name, activeAnimalTab);

      // Update Causal Agent if empty
      if (!causalAgent && result.causalAgent) {
        setCausalAgent(result.causalAgent);
      }

      // Merge into host entries
      setHostEntries(prev => ({
        ...prev,
        [activeAnimalTab]: {
          ...prev[activeAnimalTab],
          ...result.hostEntry,
          images: prev[activeAnimalTab]?.images?.length ? prev[activeAnimalTab].images : [],
          customFields: prev[activeAnimalTab]?.customFields || {}
        }
      }));

      alert("Research complete! Protocol updated.");
    } catch (error: any) {
      alert(`Research failed: ${error.message}`);
    } finally {
      setIsResearching(false);
    }
  };


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
    disease.hosts.forEach(h => { entries[h.animalName] = { ...h, customFields: h.customFields || {}, images: h.images || [] }; });
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
        const newEntry = { ...emptyHost, animalName: animal, customFields: {}, images: [] };
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
      setHostEntries(prev => ({ ...prev, [trimmed]: { ...emptyHost, animalName: trimmed, customFields: {}, images: [] } }));
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

  // Image Upload Handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, animal: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 500KB check
    if (file.size > 500 * 1024) {
      alert("Image size exceeds 500KB limit.");
      return;
    }

    setUploadingImage(true);
    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const { data, error } = await supabase.storage
        .from('disease-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('disease-images')
        .getPublicUrl(fileName);

      // Add to host entries
      setHostEntries(prev => ({
        ...prev,
        [animal]: {
          ...prev[animal],
          images: [...(prev[animal].images || []), { url: publicUrl, caption: '' }]
        }
      }));

    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const updateImageCaption = (animal: string, index: number, caption: string) => {
    setHostEntries(prev => {
      const newImages = [...(prev[animal].images || [])];
      newImages[index] = { ...newImages[index], caption };
      return {
        ...prev,
        [animal]: { ...prev[animal], images: newImages }
      };
    });
  };

  const removeImage = (animal: string, index: number) => {
    setHostEntries(prev => {
      const newImages = [...(prev[animal].images || [])];
      newImages.splice(index, 1);
      return {
        ...prev,
        [animal]: { ...prev[animal], images: newImages }
      };
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
      <div className="space-y-8 animate-fade-in pb-20 font-sans">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Disease Registry</h1>
            <p className="text-sm text-slate-500 mt-1">Manage veterinary protocols and monographs</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.csv" onChange={handleFileChange} />
            <div className="flex bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden">
              <button onClick={handleImportClick} className="px-4 py-2 flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium border-r border-slate-300 dark:border-slate-700"><Upload size={16} /> Import</button>
              <button onClick={handleExport} className="px-4 py-2 flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium"><Download size={16} /> Export</button>
            </div>
            <button onClick={() => { resetForm(); setViewMode('form'); }} className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-md shadow-sm flex items-center gap-2 transition-colors">
              <Plus size={18} />
              <span>New Entry</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {diseases.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <FileText size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">Registry is currently empty</p>
            </div>
          ) : diseases.map(disease => (
            <div key={disease.id} className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between group">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">{disease.name}</h3>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded border border-slate-200 dark:border-slate-600">
                    {stripHtml(disease.causalAgent)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                  <span className="font-medium mr-2">Hosts:</span>
                  {disease.hosts.map((h, i) => (
                    <span key={i} className="bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-xs">
                      {h.animalName}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => startEditing(disease)} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-md transition-colors">
                  <Edit size={18} />
                </button>
                <button onClick={() => { if (confirm(`Purge ${disease.name}?`)) onDeleteDisease(disease.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
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
    <div className="max-w-5xl mx-auto pb-40 font-sans">
      <header className="mb-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={resetForm} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <CheckCircle2 size={24} className="rotate-180" style={{ transform: 'rotate(180deg)' }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {editingId ? 'Edit Disease Monograph' : 'New Disease Monograph'}
            </h1>
          </div>
        </div>
        <button onClick={resetForm} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-red-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm transition-colors">
          Discard Changes
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Identification */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 pb-2 border-b border-slate-100 dark:border-slate-700">1. Identification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Disease Name" value={name} onChange={setName} required placeholder="e.g. Anthrax" />
            <RichEditorField label="Causal Agent" value={causalAgent} onChange={setCausalAgent} defaultOpen={true} simple={true} />
          </div>
        </div>

        {/* Step 2: Hosts Selection */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 pb-2 border-b border-slate-100 dark:border-slate-700">2. Affected Species</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {allPossibleAnimals.map(animal => (
              <button
                key={animal} type="button" onClick={() => handleAnimalToggle(animal)}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all border ${selectedAnimals.includes(animal)
                  ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
              >
                {animal}
              </button>
            ))}
            <button
              type="button" onClick={() => setShowCustomInput(!showCustomInput)}
              className="px-4 py-2 rounded-md text-sm font-bold border border-dashed border-teal-500 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/10 flex items-center gap-2"
            >
              <Plus size={14} /> Add Species
            </button>
          </div>
          {showCustomInput && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700 max-w-md">
              <input
                type="text" value={customHostName} onChange={(e) => setCustomHostName(e.target.value)}
                placeholder="Species name..." className="flex-1 h-9 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomHost())}
              />
              <button type="button" onClick={addCustomHost} className="h-9 px-4 bg-teal-600 text-white text-xs font-bold rounded uppercase">Add</button>
            </div>
          )}
        </div>

        {/* Step 3: Tabbed Protocol Editor */}
        {selectedAnimals.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Tabs Header */}
            <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex overflow-x-auto">
              {selectedAnimals.map(animal => (
                <button
                  key={animal} type="button" onClick={() => setActiveAnimalTab(animal)}
                  className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeAnimalTab === animal
                    ? 'bg-white dark:bg-slate-800 border-teal-600 text-teal-700 dark:text-teal-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  {animal}
                </button>
              ))}
            </div>

            {/* Content Logic */}
            <div className="p-6 md:p-8" key={activeAnimalTab}>
              {activeAnimalTab && hostEntries[activeAnimalTab] ? (
                <>
                  <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{activeAnimalTab} Protocol</h2>
                      <p className="text-sm text-slate-500">Edit clinical details and treatment for this species.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAIResearch}
                      disabled={isResearching}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {isResearching ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      <span>Research with AI</span>
                    </button>
                  </div>

                  {/* Enhanced WYSIWYG Editors for Major Fields */}
                  <div className="space-y-6">
                    <RichEditorField label="Cause" value={hostEntries[activeAnimalTab].cause} onChange={(v) => updateHostEntry(activeAnimalTab, 'cause', v)} defaultOpen={true} />
                    <RichEditorField label="Clinical Signs" value={hostEntries[activeAnimalTab].clinicalSigns} onChange={(v) => updateHostEntry(activeAnimalTab, 'clinicalSigns', v)} />
                  </div>

                  {/* Diagnosis Management - RICH TEXT MATRIX */}
                  <div className="space-y-6 mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Diagnostic Matrix</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <RichEditorField label="Field Findings" value={hostEntries[activeAnimalTab].diagnosisDetails?.field} onChange={(v) => updateDiagnosisDetail(activeAnimalTab, 'field', v)} />
                      <RichEditorField label="Laboratory Findings" value={hostEntries[activeAnimalTab].diagnosisDetails?.laboratory} onChange={(v) => updateDiagnosisDetail(activeAnimalTab, 'laboratory', v)} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <RichEditorField label="Virological Screening" value={hostEntries[activeAnimalTab].diagnosisDetails?.virologicalTest} onChange={(v) => updateDiagnosisDetail(activeAnimalTab, 'virologicalTest', v)} />
                        <RichEditorField label="Serological Screening" value={hostEntries[activeAnimalTab].diagnosisDetails?.serologicalTest} onChange={(v) => updateDiagnosisDetail(activeAnimalTab, 'serologicalTest', v)} />
                      </div>
                      <RichEditorField label="Post-Mortem / Necropsy" value={hostEntries[activeAnimalTab].diagnosisDetails?.postMortemFindings} onChange={(v) => updateDiagnosisDetail(activeAnimalTab, 'postMortemFindings', v)} />
                    </div>
                  </div>

                  {/* Management Data RIch Text */}
                  <div className="space-y-6 mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Management & Epidemiology</h3>
                    <RichEditorField label="Prevention" value={hostEntries[activeAnimalTab].prevention} onChange={(v) => updateHostEntry(activeAnimalTab, 'prevention', v)} />
                    <RichEditorField label="Precaution" value={hostEntries[activeAnimalTab].precaution} onChange={(v) => updateHostEntry(activeAnimalTab, 'precaution', v)} />
                    <RichEditorField label="Epidemiology" value={hostEntries[activeAnimalTab].epidemiology} onChange={(v) => updateHostEntry(activeAnimalTab, 'epidemiology', v)} />
                  </div>

                  {/* Treatments Matrix - Keep tabular but clean styling */}
                  <div className="space-y-6 mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Therapeutic Agents</h3>
                      <button type="button" onClick={() => addTreatment(activeAnimalTab)} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md shadow-sm transition-all">+ Add Agent</button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {hostEntries[activeAnimalTab].treatments.length === 0 ? (
                        <div className="py-8 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-center">
                          <p className="text-sm text-slate-500 italic">No treatments added yet.</p>
                        </div>
                      ) : hostEntries[activeAnimalTab].treatments.map((t, idx) => (
                        <TreatmentFormCard key={t.id} idx={idx} treatment={t} animal={activeAnimalTab} onUpdate={updateTreatmentItem} onRemove={removeTreatment} />
                      ))}
                    </div>
                  </div>

                  {/* Clinical Gallery Images */}
                  <div className="space-y-6 mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Clinical Gallery</h3>
                        <p className="text-xs text-slate-500">Max 500KB per image. Captions will be shown in the view.</p>
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          ref={imageInputRef}
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, activeAnimalTab)}
                        />
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-md shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {uploadingImage ? <Loader size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                          Upload Image
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(hostEntries[activeAnimalTab].images || []).map((img, idx) => (
                        <div key={idx} className="relative group bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                          <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded mb-2 overflow-hidden">
                            <img src={img.url} alt="Clinical" className="w-full h-full object-cover" />
                          </div>
                          <input
                            type="text"
                            placeholder="Add caption..."
                            value={img.caption}
                            onChange={(e) => updateImageCaption(activeAnimalTab, idx, e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 text-xs py-1 px-1 outline-none transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(activeAnimalTab, idx)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {(hostEntries[activeAnimalTab].images || []).length === 0 && (
                        <div className="col-span-full py-8 text-center text-slate-400 text-sm italic">
                          No images in gallery.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Custom Fields */}
                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Additional Metadata</h3>
                      {activeCustomFieldAnimal !== activeAnimalTab ? (
                        <button type="button" onClick={() => setActiveCustomFieldAnimal(activeAnimalTab)} className="text-xs font-bold text-teal-600 border border-teal-200 bg-teal-50 px-3 py-1.5 rounded hover:bg-teal-100">+ New Field</button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input type="text" placeholder="Key Name..." value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} className="w-40 h-8 px-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs" onKeyDown={(e) => e.key === 'Enter' && addCustomField(activeAnimalTab)} />
                          <button type="button" onClick={() => addCustomField(activeAnimalTab)} className="h-8 px-3 bg-teal-600 text-white text-xs font-bold rounded">Add</button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(hostEntries[activeAnimalTab].customFields || {}).map(([key, value]) => (
                        <div key={key} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-md flex items-center gap-3">
                          <div className="flex-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">{key}</label>
                            <input className="w-full bg-transparent border-none text-sm font-medium focus:ring-0 p-0 text-slate-800 dark:text-slate-200" value={value} onChange={(e) => updateCustomFieldValue(activeAnimalTab, key, e.target.value)} />
                          </div>
                          <button type="button" onClick={() => removeCustomField(activeAnimalTab, key)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center opacity-40">
                  <FileText size={48} className="mb-4 text-slate-400" />
                  <p className="font-medium text-slate-500">Select a species to edit protocol</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Global Submit Floating Bar */}
        {selectedAnimals.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-center shadow-lg">
            <button
              type="submit"
              className="px-8 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-md shadow-md transition-all flex items-center gap-3"
            >
              <CheckCircle2 size={20} />
              <span className="uppercase tracking-wide">Save Registry Entry</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

// --- SUBCOMPONENTS ---

const InputField: React.FC<{ label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }> = ({ label, value, onChange, required, placeholder }) => (
  <div className="space-y-1">
    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</label>
    <input
      type="text" required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
    />
  </div>
);

// Collapsible Rich Editor Component
const RichEditorField: React.FC<{ label: string; value: string; onChange: (v: string) => void; defaultOpen?: boolean; simple?: boolean }> = React.memo(({ label, value, onChange, defaultOpen = false, simple = false }) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultOpen || !!value);

  // Simplified modules for small fields if requested, or full for others
  const editorModules = React.useMemo(() => ({
    toolbar: simple ? [
      ['bold', 'italic', 'underline'],
      ['clean']
    ] : modules.toolbar
  }), [simple]);

  return (
    <div className={`border rounded-lg overflow-hidden transition-all duration-200 ${isExpanded ? 'border-teal-500/50 shadow-sm ring-1 ring-teal-500/10' : 'border-slate-200 dark:border-slate-700'}`}>
      <div
        className={`flex items-center justify-between px-4 py-3 cursor-pointer select-none transition-colors ${isExpanded ? 'bg-teal-50 dark:bg-teal-900/10' : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col">
          <label className={`text-sm font-bold ${isExpanded ? 'text-teal-800 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'}`}>{label}</label>
          {!isExpanded && value && (
            <span className="text-xs text-slate-400 truncate max-w-[200px] md:max-w-md mt-0.5" dangerouslySetInnerHTML={{ __html: value.replace(/<[^>]+>/g, '') }}></span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{isExpanded ? 'Minimize' : 'Expand'}</span>
          {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 quill-wrapper">
          <ReactQuill
            theme="snow"
            value={value || ''}
            onChange={onChange}
            modules={editorModules}
            formats={formats}
            className="bg-transparent dark:text-white"
          />
        </div>
      )}
    </div>
  );
});

const TreatmentFormCard: React.FC<{ idx: number; treatment: TreatmentItem; animal: string; onUpdate: any; onRemove: any }> = ({ idx, treatment, animal, onUpdate, onRemove }) => {
  const borderColors: Record<string, string> = {
    [TreatmentType.MEDICINE]: 'border-blue-500',
    [TreatmentType.DRUG]: 'border-purple-500',
    [TreatmentType.VACCINE]: 'border-amber-500',
    [TreatmentType.ANTHALMATICS]: 'border-emerald-500',
    [TreatmentType.NOTE]: 'border-slate-400',
  };

  return (
    <div className={`bg-white dark:bg-slate-900 p-4 rounded-lg border-l-4 border-y border-r border-y-slate-200 border-r-slate-200 dark:border-y-slate-700 dark:border-r-slate-700 ${borderColors[treatment.type] || 'border-teal-400'} shadow-sm`}>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="text-xs font-bold text-slate-400">Agent #{idx + 1}</div>
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded p-1">
          {Object.values(TreatmentType).map(type => (
            <button
              key={type} type="button" onClick={() => onUpdate(animal, treatment.id, 'type', type)}
              className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-all ${treatment.type === type ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex-1"></div>
        <button type="button" onClick={() => onRemove(animal, treatment.id)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4">
        {(treatment.type === TreatmentType.MEDICINE || treatment.type === TreatmentType.DRUG || treatment.type === TreatmentType.ANTHALMATICS) && (
          <>
            <div className="sm:col-span-2 md:col-span-4 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Label</label>
              <input className="w-full h-9 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm font-bold" value={treatment.name} onChange={(v) => onUpdate(animal, treatment.id, 'name', v.target.value)} placeholder="..." />
            </div>
            <div className="sm:col-span-1 md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Dose</label>
              <input className="w-full h-9 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm" value={treatment.dose || ''} onChange={(v) => onUpdate(animal, treatment.id, 'dose', v.target.value)} />
            </div>
            <div className="sm:col-span-1 md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Route</label>
              <input className="w-full h-9 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm" value={treatment.route || ''} onChange={(v) => onUpdate(animal, treatment.id, 'route', v.target.value)} />
            </div>
            <div className="sm:col-span-1 md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Freq</label>
              <input className="w-full h-9 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm" value={treatment.frequency || ''} onChange={(v) => onUpdate(animal, treatment.id, 'frequency', v.target.value)} />
            </div>
            <div className="sm:col-span-1 md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Days</label>
              <input className="w-full h-9 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm" value={treatment.duration || ''} onChange={(v) => onUpdate(animal, treatment.id, 'duration', v.target.value)} />
            </div>
          </>
        )}

        {treatment.type === TreatmentType.VACCINE && (
          <>
            <div className="sm:col-span-2 md:col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Vaccine Name</label>
              <input className="w-full h-9 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm font-bold" value={treatment.name} onChange={(v) => onUpdate(animal, treatment.id, 'name', v.target.value)} />
            </div>
            <div className="sm:col-span-1 md:col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Route</label>
              <input className="w-full h-9 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm" value={treatment.route || ''} onChange={(v) => onUpdate(animal, treatment.id, 'route', v.target.value)} />
            </div>
            <div className="sm:col-span-1 md:col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Schedule</label>
              <input className="w-full h-9 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm" value={treatment.duration || ''} onChange={(v) => onUpdate(animal, treatment.id, 'duration', v.target.value)} />
            </div>
            <div className="sm:col-span-1 md:col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Booster</label>
              <input className="w-full h-9 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm" value={treatment.boosterDose || ''} onChange={(v) => onUpdate(animal, treatment.id, 'boosterDose', v.target.value)} />
            </div>
          </>
        )}

        {treatment.type === TreatmentType.NOTE && (
          <div className="md:col-span-12 space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Remarks</label>
            <textarea className="w-full h-20 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm resize-none" value={treatment.notes || ''} onChange={(v) => onUpdate(animal, treatment.id, 'notes', v.target.value)} placeholder="Type remarks..." />
          </div>
        )}

        {treatment.type !== TreatmentType.NOTE && (
          <div className="md:col-span-12 space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Instructions</label>
            <input className="w-full h-9 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm italic" value={treatment.notes || ''} onChange={(v) => onUpdate(animal, treatment.id, 'notes', v.target.value)} placeholder="e.g. Give with food..." />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
