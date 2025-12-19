import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? 'https://czbcnqzuhlrgjrbtcqor.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6YmNucXp1aGxyZ2pyYnRjcW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNTUzMDQsImV4cCI6MjA4MTczMTMwNH0.5JMaSyiO9fLr-9KaRZKQrR0jU5F0GT70nfej-4neff8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);