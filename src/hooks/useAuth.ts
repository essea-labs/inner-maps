'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuizStore } from '@/store/quiz-store';
import type { User } from '@supabase/supabase-js';

// Cache the auth fetch so multiple useAuth() consumers don't each hit the DB
let _authPromise: Promise<User | null> | null = null;

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const loadConnections = useQuizStore((s) => s.loadConnections);
  const restoreUserState = useQuizStore((s) => s.restoreUserState);

  useEffect(() => {
    let subscription: ReturnType<typeof supabase.auth.onAuthStateChange>['data']['subscription'] | null = null;

    // Deduplicate: if another useAuth instance is already fetching, reuse the promise
    if (!_authPromise) {
      _authPromise = supabase.auth.getUser()
        .then(({ data }) => data.user ?? null)
        .catch(() => null);
    }

    _authPromise
      .then(async (u) => {
        setUser(u);
        if (u && !u.is_anonymous) {
          // Don't restore if auth callback is handling navigation (prevents double-restore flash)
          const params = new URLSearchParams(window.location.search);
          if (params.get('authCallback') === '1') return;

          // Don't restore during password reset — let the reset form handle navigation
          const currentScreen = useQuizStore.getState().screen;
          if (currentScreen === 'resetPassword') return;

          const storeResults = useQuizStore.getState().results;
          if (!storeResults) {
            await restoreUserState(u.id, u.email ?? '');
          }
          // loadConnections is called inside restoreUserState, no need to duplicate
        }
      })
      .finally(() => {
        setLoading(false);
        // Clear cache after all consumers have resolved
        setTimeout(() => { _authPromise = null; }, 100);
      });

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
