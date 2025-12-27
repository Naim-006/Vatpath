import React, { useState, useEffect } from 'react';
import { User, FontScale } from '../types';
import { Menu, X, Moon, Sun, Monitor, BookOpen, Eye, LogOut, Settings, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  isNightMode: boolean;
  toggleNightMode: () => void;
  isReadingMode: boolean;
  toggleReadingMode: () => void;
  user: User | null;
  onLogout: () => void;
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  isDarkMode, toggleTheme,
  isNightMode, toggleNightMode,
  isReadingMode, toggleReadingMode,
  user, onLogout,
  fontScale, setFontScale
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAccMenu, setShowAccMenu] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Close mobile menu on resize > md
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const NavButton = ({ label, to, icon: Icon }: any) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${active
          ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
      >
        {Icon && <Icon size={18} />}
        {label}
      </Link>
    );
  };

  return (
    <>
      <nav className="sticky top-0 z-[100] glass border-b border-slate-200/50 dark:border-slate-800/50 h-16 md:h-20 transition-all duration-300 print:hidden">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300">
                V
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse-slow"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl md:text-2xl tracking-tighter text-slate-800 dark:text-white leading-none">
                VetPath
              </span>
            </div>
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl backdrop-blur-sm border border-slate-200/50 dark:border-white/5">

            {/* Accessibility Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAccMenu(!showAccMenu)}
                className={`p-2.5 rounded-xl transition-all duration-300 ${showAccMenu
                  ? 'bg-teal-100/50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                  : 'hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                title="Accessibility & View"
              >
                <Eye size={20} />
              </button>

              {showAccMenu && (
                <div className="absolute right-0 top-full mt-4 w-72 glass-card rounded-2xl p-4 z-50 animate-slide-up">
                  <div className="space-y-4">

                    {/* Font Scale */}
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-400 mb-2 px-1">Text Size</h4>
                      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
                        {(['normal', 'large', 'extra-large'] as FontScale[]).map((scale) => (
                          <button
                            key={scale}
                            onClick={() => setFontScale(scale)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${fontScale === scale ? 'bg-white dark:bg-slate-700 shadow-md text-teal-600' : 'text-slate-500 hover:text-slate-700'
                              }`}
                          >
                            {scale === 'normal' ? 'Aa' : scale === 'large' ? 'Aa+' : 'Aa++'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Modes */}
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-400 mb-2 px-1">View Modes</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          onClick={toggleReadingMode}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all border ${isReadingMode
                            ? 'bg-teal-50 border-teal-200 text-teal-900 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-100'
                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                        >
                          <BookOpen size={18} />
                          <div className="flex flex-col items-start">
                            <span className="text-xs font-bold">Reading Mode</span>
                            <span className="text-[10px] opacity-70">Focus layout, high contrast</span>
                          </div>
                        </button>

                        <button
                          onClick={toggleNightMode}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all border ${isNightMode
                            ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-100'
                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                        >
                          <Moon size={18} />
                          <div className="flex flex-col items-start">
                            <span className="text-xs font-bold">Night Light</span>
                            <span className="text-[10px] opacity-70">Warm filter, eye protection</span>
                          </div>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-400"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <>
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${isActive('/admin')
                    ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-md'
                    : 'hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                >
                  <Shield size={16} />
                  ADMIN
                </Link>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <button
                  onClick={onLogout}
                  className="p-2.5 rounded-xl hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-all text-slate-400"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md transform active:scale-95 ${isActive('/login')
                  ? 'bg-teal-600 text-white shadow-teal-500/30'
                  : 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/10'
                  }`}
              >
                SIGN IN
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[90] top-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl md:hidden overflow-y-auto animate-fade-in">
          <div className="p-4 space-y-6">

            <div className="space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Navigation</p>
              <NavButton
                label="Home"
                to="/"
                icon={Monitor}
              />
              {user && (
                <NavButton
                  label="Admin Portal"
                  to="/admin"
                  icon={Shield}
                />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Display Settings</p>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Dark Mode</span>
                  <button onClick={toggleTheme} className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Night Light</span>
                  <button
                    onClick={toggleNightMode}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isNightMode ? 'bg-amber-100 text-amber-800' : 'bg-white text-slate-500'}`}
                  >
                    {isNightMode ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Reading Mode</span>
                  <button
                    onClick={toggleReadingMode}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isReadingMode ? 'bg-teal-100 text-teal-800' : 'bg-white text-slate-500'}`}
                  >
                    {isReadingMode ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 font-medium">Text Size</span>
                  <div className="flex gap-2">
                    {(['normal', 'large', 'extra-large'] as FontScale[]).map((scale) => (
                      <button
                        key={scale}
                        onClick={() => setFontScale(scale)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${fontScale === scale
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'bg-white border-slate-200 text-slate-500'
                          }`}
                      >
                        {scale === 'normal' ? 'Aa' : scale === 'large' ? '+' : '++'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {user ? (
              <button
                onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                className="w-full py-4 flex items-center justify-center gap-2 text-red-500 font-bold bg-red-50 dark:bg-red-900/10 rounded-xl"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-4 flex items-center justify-center bg-teal-600 text-white font-black rounded-xl shadow-lg shadow-teal-500/20"
              >
                Sign In
              </Link>
            )}

            <div className="pt-6 text-center">
              <p className="text-[10px] text-slate-300 uppercase tracking-widest">v1.2.0 • Build 2405</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
