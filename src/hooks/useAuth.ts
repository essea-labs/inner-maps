'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuizStore } from '@/store/quiz-store';
import type { User } from '@supabase/supabase-js';

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const loadConnections = useQuizStore((s) => s.loadConnections);
  const restoreUserState = useQuizStore((s) => s.restoreUserState);

  useEffect(() => {
    let subscription: ReturnType<typeof supabase.auth.onAuthStateChange>['data']['subscription'] | null = null;

    async function loadUserData(u: User) {
      // Load connections for real (non-anonymous) accounts
      if (u && !u.is_anonymous) {
        // If the store has no results, restore from DB
        const storeResults = useQuizStore.getState().results;
        if (!storeResults) {
          await restoreUserState(u.id);
        } else {
          // Results already in store — just load connections
          await loadConnections(u.id);
        }
      }
    }

    supabase.auth.getUser()
      .then(({ data }) => {
        const u = data.user ?? null;
        setUser(u);
        if (u) loadUserData(u);
      })
      .catch(() => { /* non-fatal — user stays null */ })
      .finally(() => setLoading(false));

    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u && !u.is_anonymous) loadConnections(u.id);
      });
      subscription = data.subscription;
    } catch {
      // Non-fatal — auth state changes just won't be tracked
    }

    return () => subscription?.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, loading };
}
