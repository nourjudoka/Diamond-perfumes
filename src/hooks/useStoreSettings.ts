import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { EGYPT_GOVERNORATES } from '@/constants/egyptGovernorates';

const STORE_SETTINGS_ID = 1;

export function useStoreSettings() {
  return useQuery({
    queryKey: ['store_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', STORE_SETTINGS_ID)
        .maybeSingle();

      if (error) throw error;
      return (
        data ?? {
          id: STORE_SETTINGS_ID,
          shipping_is_free: false,
          shipping_fee: 15,
          delivery_eta: '3-5 business days',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      );
    },
  });
}

export function useUpsertStoreSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: TablesUpdate<'store_settings'>) => {
      const payload: TablesInsert<'store_settings'> = {
        id: STORE_SETTINGS_ID,
        shipping_is_free: updates.shipping_is_free ?? false,
        shipping_fee: updates.shipping_fee ?? 15,
        delivery_eta: updates.delivery_eta ?? '3-5 business days',
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('store_settings')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['store_settings'] }),
  });
}

export function useGovernorateShippingRules() {
  return useQuery({
    queryKey: ['governorate_shipping_rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('governorate_shipping_rules')
        .select('*')
        .order('governorate', { ascending: true });

      if (error) throw error;

      const mapped = new Map((data ?? []).map((row) => [row.governorate, row]));
      return EGYPT_GOVERNORATES.map((governorate) => {
        const existing = mapped.get(governorate);
        return (
          existing ?? {
            governorate,
            is_free: false,
            shipping_fee: 15,
            arrival_eta: '3-5 business days',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        );
      });
    },
  });
}

export function useUpsertGovernorateShippingRules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      rows: Array<TablesInsert<'governorate_shipping_rules'> | TablesUpdate<'governorate_shipping_rules'>>
    ) => {
      const payload = rows.map((row) => ({
        governorate: row.governorate!,
        is_free: row.is_free ?? false,
        shipping_fee: row.shipping_fee ?? 15,
        arrival_eta: row.arrival_eta ?? '3-5 business days',
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('governorate_shipping_rules')
        .upsert(payload, { onConflict: 'governorate' })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['governorate_shipping_rules'] }),
  });
}

