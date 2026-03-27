'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuizStore } from '@/store/quiz-store';
import type { User } from '@supabase/supabase-js';

// Cache the auth fetch so multiple useAuth() consumers don't each hit the DB
let _authPromise: Promise<User | null> | null = null;

// Flag set by quiz/page.tsx auth callback handler to prevent useAuth from
// double-restoring state. The URL param check doesn't work because the
// callback handler cleans the URL before useAuth runs.
let _authCallbackInProgress = false;

export function setAuthCallbackInProgress(v: boolean) { _authCallbackInProgress = v; }

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const loadConnections = useQuizStore((s) => s.loadConnections);

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
        // Quiz data restoration is handled exclusively by quiz/page.tsx's
        // auto-restore effect. Doing it here too caused a race condition
        // where two concurrent restoreUserState calls could flash the
        // landing page between them.
      })
      .finally(() => {
        setLoading(false);
        setTimeout(() => { _authPromise = null; }, 100);
      });

    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        // Don't trigger side effects during auth callback processing
        if (_authCallbackInProgress) return;
        if (u && !u.is_anonymous) loadConnections(u.id);
      });
      subscription = data.subscription;
    } catch {
      // Non-fatal
    }

    return () => subscription?.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, loading };
}
