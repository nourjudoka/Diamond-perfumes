import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export function useDiscounts() {
  return useQuery({
    queryKey: ['discounts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('discounts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useActiveDiscounts() {
  return useQuery({
    queryKey: ['discounts', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase.from('discounts').select('*').eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });
}

export function useValidateDiscount() {
  return useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();
      if (error) throw new Error('Invalid discount code');
      const now = new Date();
      if (data.expires_at && new Date(data.expires_at) < now) throw new Error('Discount code has expired');
      if (data.starts_at && new Date(data.starts_at) > now) throw new Error('Discount is not yet active');
      return data;
    },
  });
}

export function useAddDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (discount: TablesInsert<'discounts'>) => {
      const { data, error } = await supabase.from('discounts').insert(discount).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['discounts'] }),
  });
}

export function useUpdateDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'discounts'> }) => {
      const { data, error } = await supabase.from('discounts').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['discounts'] }),
  });
}

export function useDeleteDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('discounts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['discounts'] }),
  });
}
