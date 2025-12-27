import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Disease, TreatmentType } from '../types';
import { Printer, AlertTriangle, ChevronRight, ImageIcon } from 'lucide-react';

interface DiseaseDetailProps {
    diseases: Disease[];
    onViewDetails: (id: string) => void;
}

// Helper to strip HTML and decode common entities
const stripHtml = (html: string) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

const MonographSection: React.FC<{ title: string; children?: React.ReactNode; content?: string }> = ({ title, children, content }) => (
    <div className="mb-8 font-sans">
        <h3 className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-lg font-bold px-4 py-2 mb-4 rounded-md">
            {title}
        </h3>
        <div className="text-slate-800 dark:text-slate-300 px-0 md:px-2 text-[15px] md:text-base">
            {content ? (
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap break-words [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5" dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
                <div className="min-w-0 w-full break-words">
                    {children}
                </div>
            )}
        </div>
    </div>
);

const DiseaseDetail: React.FC<DiseaseDetailProps> = ({ diseases, onViewDetails }) => {
    const { id } = useParams<{ id: string }>();
    const [activeHostIndex, setActiveHostIndex] = useState(0);

    const disease = useMemo(() => {
        return diseases.find(d => d.id === id);
    }, [diseases, id]);

    React.useEffect(() => {
        window.scrollTo(0, 0);
        if (id) {
            onViewDetails(id);
        }
    }, [id]); // only on id change

    if (!disease) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 font-sans">
                <div className="bg-red-50 text-red-500 p-4 rounded-full mb-4">
                    <AlertTriangle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Disease Not Found</h2>
                <Link to="/" className="text-teal-600 font-bold hover:underline">
                    Return to Library
                </Link>
            </div>
        );
    }

    const currentHost = disease.hosts[activeHostIndex] || disease.hosts[0];
    const hasMultipleHosts = disease.hosts.length > 1;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 animate-fade-in font-sans">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Main Content Column */}
                <div className="lg:col-span-8 lg:border-r lg:border-slate-200 dark:border-slate-800 lg:pr-12">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                            {disease.name}
                        </h1>
                        <div className="flex flex-wrap gap-3 mb-6">
                            <span className="inline-flex items-center justify-center px-4 py-1.5 border border-teal-600 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wide rounded hover:bg-teal-50 dark:hover:bg-teal-900/10 cursor-default transition-colors">
                                Monograph
                            </span>
                            <div className="inline-flex items-center text-slate-500 text-sm font-medium">
                                <span className="mr-2 italic">Causal Agent:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {stripHtml(disease.causalAgent)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Host Tabs (Mobile Friendly) */}
                    {hasMultipleHosts && (
                        <div className="mb-8 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                            <div className="flex space-x-6 min-w-max pb-3">
                                {disease.hosts.map((host, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveHostIndex(idx)}
                                        className={`text-sm font-bold uppercase tracking-wider transition-colors pb-1 relative ${activeHostIndex === idx
                                            ? 'text-teal-700 dark:text-teal-400'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                            }`}
                                    >
                                        {host.animalName}
                                        {activeHostIndex === idx && (
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 dark:bg-teal-400 translate-y-3.5"></span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Content Sections - Monograph Style */}
                    {currentHost && (
                        <div className="space-y-4">
                            {/* Clinical Signs */}
                            <MonographSection title="Clinical Signs" content={currentHost.clinicalSigns} />

                            {/* Diagnosis - Combined Logic */}
                            {(currentHost.diagnosisDetails?.field || currentHost.diagnosisDetails?.laboratory) && (
                                <MonographSection title="Diagnosis & Findings">
                                    <div className="space-y-8">
                                        {currentHost.diagnosisDetails.field && (
                                            <div>
                                                <h4 className="font-extrabold text-lg text-slate-800 dark:text-white uppercase mb-3 border-l-4 border-teal-500 pl-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-r-lg">Field Diagnosis</h4>
                                                <div className="text-slate-700 dark:text-slate-300 pl-2 prose dark:prose-invert whitespace-pre-wrap break-words max-w-none" dangerouslySetInnerHTML={{ __html: currentHost.diagnosisDetails.field }} />
                                            </div>
                                        )}
                                        {currentHost.diagnosisDetails.laboratory && (
                                            <div>
                                                <h4 className="font-extrabold text-lg text-slate-800 dark:text-white uppercase mb-3 border-l-4 border-indigo-500 pl-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-r-lg">Laboratory Findings</h4>
                                                <div className="text-slate-700 dark:text-slate-300 pl-2 prose dark:prose-invert whitespace-pre-wrap break-words max-w-none" dangerouslySetInnerHTML={{ __html: currentHost.diagnosisDetails.laboratory }} />
                                            </div>
                                        )}
                                        {(currentHost.diagnosisDetails.virologicalTest || currentHost.diagnosisDetails.serologicalTest) && (
                                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid md:grid-cols-2 gap-8">
                                                {currentHost.diagnosisDetails.virologicalTest && (
                                                    <div>
                                                        <h4 className="font-extrabold text-base text-slate-800 dark:text-slate-200 uppercase mb-3 pl-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">Virological</h4>
                                                        <div className="text-sm prose dark:prose-invert px-2" dangerouslySetInnerHTML={{ __html: currentHost.diagnosisDetails.virologicalTest }} />
                                                    </div>
                                                )}
                                                {currentHost.diagnosisDetails.serologicalTest && (
                                                    <div>
                                                        <h4 className="font-extrabold text-base text-slate-800 dark:text-slate-200 uppercase mb-3 pl-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">Serological</h4>
                                                        <div className="text-sm prose dark:prose-invert px-2" dangerouslySetInnerHTML={{ __html: currentHost.diagnosisDetails.serologicalTest }} />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {currentHost.diagnosisDetails.postMortemFindings && (
                                            <div>
                                                <h4 className="font-extrabold text-lg text-slate-800 dark:text-white uppercase mb-3 border-l-4 border-red-500 pl-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-r-lg">Post-Mortem / Necropsy</h4>
                                                <div className="text-slate-700 dark:text-slate-300 pl-2 prose dark:prose-invert whitespace-pre-wrap break-words max-w-none" dangerouslySetInnerHTML={{ __html: currentHost.diagnosisDetails.postMortemFindings }} />
                                            </div>
                                        )}
                                    </div>
                                </MonographSection>
                            )}

                            {/* Treatment */}
                            <MonographSection title="Treatment & Dosage">
                                {currentHost.treatments.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-2">
                                        {currentHost.treatments.map((tx, i) => (
                                            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                                <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base leading-tight">{tx.name}</span>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border shrink-0 ${tx.type === 'MEDICINE' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-400' :
                                                        tx.type === 'VACCINE' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-400' :
                                                            tx.type === 'ANTHALMATICS' ? 'bg-emerald-50 text-emerald-600 border-emerald-1100 dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400' :
                                                                'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                                                        }`}>
                                                        {tx.type}
                                                    </span>
                                                </div>
                                                <div className="p-4 space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dose & Route</span>
                                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{tx.dose} <span className="text-xs text-slate-400">({tx.route})</span></span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Frequency</span>
                                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{tx.frequency || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Duration</span>
                                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{tx.duration || 'N/A'}</span>
                                                        </div>
                                                        {tx.type === 'VACCINE' && (
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Booster</span>
                                                                <span className="text-sm font-bold text-teal-600 dark:text-teal-400 underline decoration-teal-500/30 underline-offset-2">{tx.boosterDose || 'None'}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {tx.notes && (
                                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                                                            <p className="text-[11px] text-slate-500 italic leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2 rounded">
                                                                <strong className="text-[10px] uppercase tracking-wide not-italic text-slate-400 mr-1">Note:</strong>
                                                                {tx.notes}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                                        <p className="italic text-slate-400 font-medium">No specific treatment protocol listed.</p>
                                    </div>
                                )}
                            </MonographSection>

                            {/* Management (Prevention, Precaution, Epidemiology) */}
                            <MonographSection title="Management & Epidemiology">
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-slate-900/40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <h4 className="font-extrabold text-xs text-teal-800 dark:text-teal-400 uppercase tracking-[0.2em] bg-teal-50/50 dark:bg-teal-900/20 px-5 py-3 border-b border-teal-100/50 dark:border-teal-900/30 flex items-center justify-between">
                                            Prevention
                                            <div className="h-1.5 w-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div>
                                        </h4>
                                        <div className="p-5 md:p-6">
                                            {currentHost.prevention ? (
                                                <div className="text-slate-700 dark:text-slate-300 text-[15px] leading-relaxed prose dark:prose-invert whitespace-pre-wrap break-words max-w-none [&>p]:mb-4" dangerouslySetInnerHTML={{ __html: currentHost.prevention }} />
                                            ) : <span className="text-slate-400 italic text-sm">No prevention strategy recorded.</span>}
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900/40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <h4 className="font-extrabold text-xs text-amber-800 dark:text-amber-400 uppercase tracking-[0.2em] bg-amber-50/50 dark:bg-amber-900/20 px-5 py-3 border-b border-amber-100/50 dark:border-amber-900/30 flex items-center justify-between">
                                            Precaution
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                                        </h4>
                                        <div className="p-5 md:p-6">
                                            {currentHost.precaution ? (
                                                <div className="text-slate-700 dark:text-slate-300 text-[15px] leading-relaxed prose dark:prose-invert whitespace-pre-wrap break-words max-w-none [&>p]:mb-4" dangerouslySetInnerHTML={{ __html: currentHost.precaution }} />
                                            ) : <span className="text-slate-400 italic text-sm">No precautions listed.</span>}
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900/40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <h4 className="font-extrabold text-xs text-indigo-800 dark:text-indigo-400 uppercase tracking-[0.2em] bg-indigo-50/50 dark:bg-indigo-900/20 px-5 py-3 border-b border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-between">
                                            Epidemiology
                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                                        </h4>
                                        <div className="p-5 md:p-6">
                                            {currentHost.epidemiology ? (
                                                <div className="text-slate-700 dark:text-slate-300 text-[15px] leading-relaxed prose dark:prose-invert whitespace-pre-wrap break-words max-w-none [&>p]:mb-4" dangerouslySetInnerHTML={{ __html: currentHost.epidemiology }} />
                                            ) : <span className="text-slate-400 italic text-sm">No epidemiological data.</span>}
                                        </div>
                                    </div>
                                </div>
                            </MonographSection>

                            {/* Clinical Gallery */}
                            {currentHost.images && currentHost.images.length > 0 && (
                                <MonographSection title="Clinical Gallery">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        {currentHost.images.map((img, i) => (
                                            <div key={i} className="flex flex-col space-y-2">
                                                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm aspect-video bg-slate-100 dark:bg-slate-800 hover:shadow-md transition-all">
                                                    <img
                                                        src={img.url}
                                                        alt={img.caption || `Clinical Image ${i + 1}`}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                                        loading="lazy"
                                                    />
                                                </div>
                                                {img.caption && (
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 italic font-medium text-center px-2">
                                                        {img.caption}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </MonographSection>
                            )}
                        </div>
                    )}

                    <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-xs text-slate-400 italic">
                            * Veterinary use only. Always consult a licensed professional for definitive diagnosis and treatment planning.
                        </p>
                    </div>

                </div>

                {/* Sidebar Column (Desktop Only - or Bottom on Mobile) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                            <span>Quick Actions</span>
                        </h3>
                        <div className="space-y-3">
                            <button onClick={() => window.print()} className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-teal-500 hover:text-teal-600 transition-colors group text-sm font-bold text-slate-600">
                                <span className="flex items-center gap-2"><Printer size={16} /> Print Monograph</span>
                                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <Link to="/" className="w-full flex items-center justify-between p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-bold shadow-sm">
                                <span>Back to Library</span>
                            </Link>
                        </div>
                    </div>

                    {/* Dynamic "Related" or "Stats" Block */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Registry Metadata</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Subject</span>
                                <span className="font-bold text-slate-900 dark:text-white">{currentHost?.animalName}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Record ID</span>
                                <span className="font-mono text-xs text-slate-400">{disease.id.slice(0, 8)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Images</span>
                                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                    <ImageIcon size={12} className="text-teal-500" />
                                    {currentHost.images?.length || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiseaseDetail;
