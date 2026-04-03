import { supabase } from '../supabase';
import { getCurrentUserId } from '../auth/get-user-id';

export type CustomIcon = {
  id: string;
  pixelData: number[][];
  name: string;
  createdAt: string;
};

export async function fetchCustomIcons(userId: string = getCurrentUserId()): Promise<CustomIcon[]> {
  const { data, error } = await (supabase.from as any)('custom_icons')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    pixelData: row.pixel_data,
    name: row.name,
    createdAt: row.created_at,
  }));
}

export async function saveCustomIcon(
  pixelData: number[][],
  name: string = 'Custom',
  userId: string = getCurrentUserId(),
): Promise<CustomIcon> {
  const { data, error } = await (supabase.from as any)('custom_icons')
    .insert({ user_id: userId, pixel_data: pixelData, name })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    pixelData: data.pixel_data,
    name: data.name,
    createdAt: data.created_at,
  };
}

export async function deleteCustomIcon(id: string): Promise<void> {
  const { error } = await (supabase.from as any)('custom_icons')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
