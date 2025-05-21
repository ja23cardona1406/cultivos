import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Obtener las variables de entorno de Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar que las variables de entorno estén presentes
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Crear el cliente de Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Verificación en consola (opcional para desarrollo)
console.log('Supabase URL:', supabaseUrl);
