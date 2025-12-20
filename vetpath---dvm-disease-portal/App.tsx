
import React, { useState, useEffect, useCallback } from 'react';
import { Disease, SortOption, User, FontScale } from './types';
import { INITIAL_DISEASES } from './constants';
import { supabase } from './services/supabaseClient';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const App: React.FC = () => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'admin' | 'update-password'>('login');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontScale, setFontScale] = useState<FontScale>('normal');
  const [customAnimalTypes, setCustomAnimalTypes] = useState<string[]>([]);

  // Helper to validate UUID
  const isUUID = (uuid: string) => {
    const s = "" + uuid;
    const match = s.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    return match !== null;
  };

  // Load data from Supabase
  const fetchData = async () => {
    // Fetch Diseases
    const { data: diseasesData, error: dError } = await supabase
      .from('diseases')
      .select('*')
      .order('created_at', { ascending: false });

    if (!dError && diseasesData) {
      // Map snake_case from DB to camelCase for App
      const mappedDiseases: Disease[] = diseasesData.map((d: any) => ({
        id: d.id,
        name: d.name,
        causalAgent: d.causal_agent,
        createdAt: new Date(d.created_at).getTime(),
        searchCount: d.search_count || 0,
        hosts: d.hosts || []
      }));
      setDiseases(mappedDiseases);
    } else if (dError && dError.code === '42P01') {
      setDiseases(INITIAL_DISEASES);
    }

    // Fetch Custom Animals
    const { data: animalsData, error: aError } = await supabase
      .from('custom_animal_types')
      .select('name');

    if (!aError && animalsData) {
      setCustomAnimalTypes(animalsData.map(a => a.name));
    }
  };

  useEffect(() => {
    (supabase.auth as any).getSession().then(({ data: { session } }: any) => {
      if (session?.user) {
        setUser({ id: session.user.id, username: session.user.email || 'Admin' });
        fetchData();
        if (currentPage === 'login') setCurrentPage('home');
      }
    });

    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((_event: string, session: any) => {
      if (session?.user) {
        setUser({ id: session.user.id, username: session.user.email || 'Admin' });
        fetchData();
        if (_event === 'PASSWORD_RECOVERY') {
          setCurrentPage('update-password');
        } else if (currentPage === 'login') {
          setCurrentPage('home');
        }
      } else {
        setUser(null);
        setCurrentPage('login');
      }
    });

    const theme = localStorage.getItem('vetpath_theme');
    if (theme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const savedScale = localStorage.getItem('vetpath_fontscale') as FontScale;
    if (savedScale) setFontScale(savedScale);

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (fontScale === 'normal') root.style.fontSize = '16px';
    else if (fontScale === 'large') root.style.fontSize = '18px';
    else if (fontScale === 'extra-large') root.style.fontSize = '20px';
    localStorage.setItem('vetpath_fontscale', fontScale);
  }, [fontScale]);

  const [isNightMode, setIsNightMode] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);

  useEffect(() => {
    if (isNightMode) document.body.classList.add('night-mode');
    else document.body.classList.remove('night-mode');
  }, [isNightMode]);

  useEffect(() => {
    if (isReadingMode) document.body.classList.add('reading-mode');
    else document.body.classList.remove('reading-mode');
  }, [isReadingMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      if (newVal) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('vetpath_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('vetpath_theme', 'light');
      }
      return newVal;
    });
  };

  const toggleNightMode = () => setIsNightMode(prev => !prev);
  const toggleReadingMode = () => setIsReadingMode(prev => !prev);

  const handleLogout = async () => {
    await (supabase.auth as any).signOut();
    setUser(null);
    setCurrentPage('login');
  };

  const handleUpsertDisease = async (disease: Disease) => {
    // Map camelCase from App to snake_case for DB
    const payload: any = {
      name: disease.name,
      causal_agent: disease.causalAgent,
      hosts: disease.hosts,
      search_count: disease.searchCount
    };

    // Only include ID if it's a valid UUID (to update existing records)
    // If it's a new record with a temporary ID (like a timestamp), 
    // we omit it so Supabase generates a proper UUID.
    if (isUUID(disease.id)) {
      payload.id = disease.id;
    }

    const { error } = await supabase
      .from('diseases')
      .upsert(payload);

    if (error) {
      console.error("Error upserting disease:", error);
      alert("Failed to save disease record. Check console for details.");
    } else {
      fetchData();
    }
  };

  const handleDeleteDisease = async (id: string) => {
    const { error } = await supabase.from('diseases').delete().eq('id', id);
    if (error) console.error("Error deleting:", error);
    fetchData();
  };

  const handleUpdateSearchCount = useCallback(async (id: string) => {
    const target = diseases.find(d => d.id === id);
    if (target && isUUID(id)) {
      const newCount = (target.searchCount || 0) + 1;
      // Optimistic UI update
      setDiseases(prev => prev.map(d => d.id === id ? { ...d, searchCount: newCount } : d));

      await supabase
        .from('diseases')
        .update({ search_count: newCount })
        .eq('id', id);
    }
  }, [diseases]);

  const handleAddCustomAnimal = async (name: string) => {
    const { error } = await supabase.from('custom_animal_types').insert({ name });
    if (error) console.error("Error adding custom animal:", error);
    fetchData();
  };

  if (!user && currentPage !== 'update-password') {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <main className="max-w-7xl mx-auto px-4 py-10">
          <AdminLogin
            initialMode="login"
            onSuccess={() => setCurrentPage('home')}
          />
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Navbar
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isNightMode={isNightMode}
        toggleNightMode={toggleNightMode}
        isReadingMode={isReadingMode}
        toggleReadingMode={toggleReadingMode}
        currentPage={currentPage === 'update-password' ? 'login' : (currentPage as any)}
        setCurrentPage={(p) => setCurrentPage(p as any)}
        user={user}
        onLogout={handleLogout}
        fontScale={fontScale}
        setFontScale={setFontScale}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        {currentPage === 'home' && <Home diseases={diseases} onViewDetails={handleUpdateSearchCount} />}
        {currentPage === 'update-password' && (
          <AdminLogin
            initialMode="update"
            onSuccess={() => setCurrentPage('home')}
          />
        )}
        {currentPage === 'admin' && user && (
          <AdminDashboard
            diseases={diseases}
            customAnimalTypes={customAnimalTypes}
            onAddCustomAnimal={handleAddCustomAnimal}
            onUpsertDisease={handleUpsertDisease}
            onDeleteDisease={handleDeleteDisease}
          />
        )}
      </main>

      <footer className="py-10 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
        <p>© {new Date().getFullYear()} VetPath • <a href="#" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline">Clinical Reference V2.0</a></p><br></br>
        <p>Made with ❤️ by <a href="https://naimhossain006.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline" style={{ fontSize: '12px' }}>Naim Hossain </a> </p>
        <p>  - Founder And CEO of <a href="https://nextbyte-it.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline" style={{ fontSize: '12px' }}>NextByte</a></p>
      </footer>
    </div>
  );
};

export default App;
