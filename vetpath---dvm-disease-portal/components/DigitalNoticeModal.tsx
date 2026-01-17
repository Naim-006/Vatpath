import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, ChevronRight, AlertCircle, ExternalLink } from 'lucide-react';

interface DigitalNoticeModalProps {
    userEmail?: string;
}

const DigitalNoticeModal: React.FC<DigitalNoticeModalProps> = ({ userEmail }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasRead, setHasRead] = useState(false);
    const [answer, setAnswer] = useState('');
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem('vetpath_notice_seen');
        if (!hasSeen) {
            setIsOpen(true);
        }
    }, []);

    const isVerified = answer.trim().toLowerCase() === 'groq';

    const handleClose = () => {
        if (isVerified) {
            localStorage.setItem('vetpath_notice_seen', 'true');
            setIsOpen(false);
        } else {
            setShowError(true);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-slate-950 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <ShieldAlert className="text-teal-600 dark:text-teal-400" size={18} />
                    <h2 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Clinical Compliance Notice</h2>
                </div>

                {/* Content Area */}
                <div className="p-6 md:p-8 overflow-y-auto flex-1">
                    {!hasRead ? (
                        <div className="space-y-6 animate-slide-up">
                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                                    Welcome to VetPath v3.01! 🎉
                                </h3>

                                <div className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed space-y-5">
                                    <p>Hello! I'm Naim Hossain from NextByte IT. Welcome to your comprehensive veterinary disease portal designed to streamline your clinical research and documentation.
                                    </p>

                                    <p className="bg-gradient-to-r from-teal-50 to-indigo-50 dark:from-teal-900/20 dark:to-indigo-900/20 px-4 py-3 rounded-xl border-l-4 border-teal-500 text-sm font-medium">
                                        Discover the powerful features that make VetPath your ultimate veterinary companion!
                                    </p>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs">
                                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                                            🤖 AI-Powered Disease Research
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-3">
                                            <p>Leverage advanced AI (Groq) to automatically research and populate disease information. Simply provide a disease name, and watch as the AI fills out comprehensive details including symptoms, diagnosis, treatment, and prevention.</p>
                                            <p className="text-teal-600 dark:text-teal-400 font-bold">✨ Save hours of manual research with intelligent auto-fill capabilities!</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                            💬 Unlimited AI Chat Assistant
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                                            <p>Get instant answers to your veterinary questions with our unlimited AI chatbox. Ask anything, anytime—from disease clarifications to treatment recommendations.</p>
                                            <p className="text-indigo-600 dark:text-indigo-400 font-bold">💡 Your 24/7 veterinary knowledge companion!</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                            📸 Smart Image Management
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-3">
                                            <p>Upload and organize disease images with 1 GB of cloud storage. Support for up to 500 KB per image ensures high-quality visual documentation.</p>
                                            <div className="flex items-center gap-2 pt-1">
                                                <ExternalLink size={12} className="text-purple-600" />
                                                <p>Pro tip: Optimize images at <a href="https://imagecompressor.com/" target="_blank" rel="noopener noreferrer" className="text-purple-600 font-bold hover:underline">imagecompressor.com</a> for maximum storage efficiency</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                            🗂️ Comprehensive Disease Portal
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                                            <p>Organize and access detailed disease profiles including clinical signs, diagnostic procedures, treatment protocols, and prevention strategies—all in one centralized platform.</p>
                                            <p className="text-amber-600 dark:text-amber-400 font-bold">📚 Your complete veterinary reference library!</p>
                                        </div>
                                    </div>

                                    <p className="font-black text-slate-800 dark:text-slate-200 pt-2 tracking-tight">Ready to revolutionize your veterinary workflow? Let's get started! 🚀</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setHasRead(true)}
                                className="w-full mt-4 flex items-center justify-center gap-3 bg-teal-600 hover:bg-teal-700 text-white font-black uppercase tracking-[0.1em] text-xs py-5 rounded-2xl transition-all shadow-xl shadow-teal-500/20 group"
                            >
                                I have read all instructions carefully
                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-fade-in flex flex-col items-center text-center py-6">
                            <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-3xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500">
                                <CheckCircle className="text-teal-600 dark:text-teal-400" size={40} />
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">One Final Step</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 px-6">To ensure the system remains sustainable, please verify the AI model used in this app.</p>
                            </div>

                            <div className="w-full max-w-sm space-y-4">
                                <div className="text-left bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <label className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mb-3 block">Compliance Question</label>
                                    <p className="font-bold text-slate-700 dark:text-slate-300 mb-4 leading-tight">What is the name of my AI model?</p>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={answer}
                                        onChange={(e) => {
                                            setAnswer(e.target.value);
                                            setShowError(false);
                                        }}
                                        placeholder="Type correctly..."
                                        className={`w-full h-14 px-5 rounded-2xl border-2 transition-all outline-none text-base font-bold
                                            ${showError ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-teal-500 focus:shadow-lg focus:shadow-teal-500/10'}
                                        `}
                                    />
                                    {showError && (
                                        <div className="flex items-center gap-2 mt-3 text-red-500 text-xs font-bold animate-pulse">
                                            <AlertCircle size={14} />
                                            <span>Incorrect. Please read carefully and try again.</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setHasRead(false);
                                            setAnswer('');
                                            setShowError(false);
                                        }}
                                        className="flex-1 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-xs uppercase tracking-widest"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleClose}
                                        className={`flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all
                                            ${isVerified
                                                ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-xl shadow-teal-500/30'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        Proceed to App
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Meta */}
                <div className="px-6 py-4 bg-slate-100/50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-[0.3em]">
                        VetPath Onboarding Protocol • v3.01
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DigitalNoticeModal;
