import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import type { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useOrderItems(orderId: string | undefined) {
  return useQuery({
    queryKey: ['order_items', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const { data, error } = await supabase.from('order_items').select('*').eq('order_id', orderId);
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ order, items }: { order: TablesInsert<'orders'>; items: TablesInsert<'order_items'>[] }) => {
      const { data: orderData, error: orderError } = await supabase.from('orders').insert(order).select().single();
      if (orderError) throw orderError;
      const itemsWithOrderId = items.map((item) => ({ ...item, order_id: orderData.id }));
      const { error: itemsError } = await supabase.from('order_items').insert(itemsWithOrderId);
      if (itemsError) throw itemsError;
      return orderData;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'orders'> }) => {
      const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}
