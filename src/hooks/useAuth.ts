'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuizStore } from '@/store/quiz-store';
import type { User } from '@supabase/supabase-js';

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const loadConnections = useQuizStore((s) => s.loadConnections);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user ?? null;
      setUser(u);
      // Only load connections for real (non-anonymous) accounts
      if (u && !u.is_anonymous) loadConnections(u.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u && !u.is_anonymous) loadConnections(u.id);
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, loading };
}
