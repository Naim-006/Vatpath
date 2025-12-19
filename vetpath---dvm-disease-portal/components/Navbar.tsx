
import React, { useState } from 'react';
import { User, FontScale } from '../types';

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  currentPage: 'home' | 'login' | 'admin';
  setCurrentPage: (page: 'home' | 'login' | 'admin') => void;
  user: User | null;
  onLogout: () => void;
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDarkMode, toggleTheme, currentPage, setCurrentPage, user, onLogout, fontScale, setFontScale }) => {
  const [showAccMenu, setShowAccMenu] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 h-16 flex items-center justify-between">
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => setCurrentPage('home')}
        role="button"
        aria-label="Go to Home"
      >
        <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition-transform duration-300">
          V
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xl tracking-tighter dark:text-white">VetPath</span>
          <span className="text-[9px] uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 font-black -mt-1">DVM Intelligence</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Accessibility Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowAccMenu(!showAccMenu)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
            title="Accessibility Settings"
            aria-label="Accessibility Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
          </button>
          
          {showAccMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-[70] animate-in fade-in zoom-in-95">
              <p className="text-[10px] font-black uppercase text-slate-400 px-2 py-1 mb-1">Text Scaling</p>
              {(['normal', 'large', 'extra-large'] as FontScale[]).map((scale) => (
                <button
                  key={scale}
                  onClick={() => { setFontScale(scale); setShowAccMenu(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold capitalize transition-colors ${
                    fontScale === scale 
                    ? 'bg-teal-600 text-white' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {scale.replace('-', ' ')}
                </button>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
          title="Toggle Dark Mode"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>

        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setCurrentPage('admin')}
              className={`hidden md:block px-4 py-2 rounded-lg text-xs font-black transition-all ${
                currentPage === 'admin' 
                ? 'bg-teal-600 text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-teal-600 hover:text-white'
              }`}
            >
              ADMIN PORTAL
            </button>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Sign Out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setCurrentPage('login')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              currentPage === 'login' 
              ? 'bg-teal-600 text-white' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-teal-600 hover:text-white'
            }`}
          >
            SIGN IN
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
