import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeSubscription(
  table: string,
  onUpdate: () => void
) {
  useEffect(() => {
    console.log(`🔔 Subscribing to ${table} changes...`);

    const channel: RealtimeChannel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          console.log(`📡 ${table} updated:`, payload);
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      console.log(`🔕 Unsubscribing from ${table}`);
      supabase.removeChannel(channel);
    };
  }, [table, onUpdate]);
}