import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

export type Farm = Database['public']['Tables']['fincas']['Row'];
export type FarmInsert = Database['public']['Tables']['fincas']['Insert'];

export const createFarm = async (farm: FarmInsert) => {
  const { data, error } = await supabase
    .from('fincas')
    .insert([{ ...farm, user_id: (await supabase.auth.getUser()).data.user?.id }])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data?.[0] as Farm;
};

export const getAllFarms = async () => {
  const { data, error } = await supabase
    .from('fincas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Farm[];
};

export const getFarmById = async (id: string) => {
  const { data, error } = await supabase
    .from('fincas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Farm;
};

export const updateFarm = async (id: string, updates: Partial<Farm>) => {
  const { data, error } = await supabase
    .from('fincas')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data?.[0] as Farm;
};

export const deleteFarm = async (id: string) => {
  const { error } = await supabase
    .from('fincas')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};