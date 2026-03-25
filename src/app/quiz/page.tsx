'use client';

// This page is a fully dynamic SPA — never statically prerender
export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useQuizStore, restoreStateFromSession, clearSessionState } from '@/store/quiz-store';
import { supabase } from '@/lib/supabase';
import { completeInvite } from '@/lib/db';

import LandingPage from '@/components/LandingPage';
import NameInput from '@/components/quiz/NameInput';
import BirthdayInput from '@/components/quiz/BirthdayInput';
import QuizScreen from '@/components/quiz/QuizScreen';
import MiniReveal from '@/components/quiz/MiniReveal';
import SignupForm from '@/components/quiz/SignupForm';
import Results from '@/components/results/Results';
import ConnectionsTab from '@/components/connections/ConnectionsTab';
import InviteModal from '@/components/connections/InviteModal';
import CompatibilityView from '@/components/compatibility/CompatibilityView';
import IndividualReport from '@/components/reports/IndividualReport';
import CompatibilityReport from '@/components/reports/CompatibilityReport';
import ProfileTab from '@/components/profile/ProfileTab';
import Toast from '@/components/ui/Toast';

import useSwipeBack from '@/hooks/useSwipeBack';
import useKeyboardNav from '@/hooks/useKeyboardNav';

// Pre-hydrate store from sessionStorage before first render.
// This prevents the landing page from flashing when returning from OAuth/Stripe.
if (typeof window !== 'undefined') {
  const patch = restoreStateFromSession();
  if (patch) {
    useQuizStore.setState(patch);
    // Don't clear yet — the auth/purchase effects will clear after they run
  }
}

export default function QuizPage() {
  const screen = useQuizStore((s) => s.screen);
  const inviteModalOpen = useQuizStore((s) => s.inviteModalOpen);
  const handlePostAuth = useQuizStore((s) => s.handlePostAuth);
  const showToast = useQuizStore((s) => s.showToast);
  const setScreen = useQuizStore((s) => s.setScreen);
  const setPurchased = useQuizStore((s) => s.setPurchased);
  const checkPurchases = useQuizStore((s) => s.checkPurchases);
  const restoreUserState = useQuizStore((s) => s.restoreUserState);
  const restoringState = useQuizStore((s) => s.restoringState);

  // Navigation hooks
  useSwipeBack();
  useKeyboardNav();

  // Scroll to top on every screen change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  // Auto-restore returning user's quiz state from DB on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Skip if other handlers will take over
    if (params.get('authCallback') === '1' || params.get('purchase') === 'success') return;

    // If pre-hydration already restored from sessionStorage, just clear and stop
    const store = useQuizStore.getState();
    if (store.results !== null) {
      clearSessionState();
      return;
    }

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Only restore if: real (non-anonymous) user + no results in memory
      if (user && !user.is_anonymous && useQuizStore.getState().results === null) {
        // Set restoringState immediately so components show loading instead of empty states
        useQuizStore.setState({ restoringState: true });
        await restoreUserState(user.id);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Store inviterCode when arriving from an invite link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviterCode = params.get('inviterCode');
    if (inviterCode && params.get('authCallback') !== '1') {
      sessionStorage.setItem('innerMapsInviterCode', inviterCode);
      window.history.replaceState({}, '', '/quiz');
    }
  }, []);

  // Handle Stripe purchase success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('purchase') !== 'success') return;

    const product = params.get('product') ?? '';
    const connectionId = params.get('connection_id') ?? undefined;

    // Restore quiz state saved before Stripe redirect (page reloads on return)
    const sessionPatch = restoreStateFromSession();
    if (sessionPatch) {
      // Don't restore screen/tab — purchase handler navigates to the report screen
      delete sessionPatch.screen;
      delete sessionPatch.activeTab;
      useQuizStore.setState(sessionPatch);
    }
    clearSessionState();

    // Unlock the report and navigate
    setPurchased(product, connectionId);

    if (product === 'individual_report') {
      setScreen('individualReport');
      showToast('Purchase complete — your report is unlocked! ✦');
    } else if (product === 'compatibility_report') {
      setScreen('compatibilityReport');
      showToast('Purchase complete — compatibility report unlocked! ✦');
    }

    // Clean URL
    window.history.replaceState({}, '', '/quiz');

    // Background DB check — confirm purchase once webhook lands
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await checkPurchases(user.id);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle post-OAuth callback (Google sign-in)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('authCallback') !== '1') return;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const intent = params.get('intent') ?? 'save';
      // Check both URL param (cookie-passed from auth callback) and sessionStorage (from invite landing)
      const inviterCode = params.get('inviterCode') ?? sessionStorage.getItem('innerMapsInviterCode');

      // Restore quiz state saved before magic link / OTP redirect
      const sessionPatch = restoreStateFromSession();
      if (sessionPatch) {
        // Restore screen/tab immediately so the UI doesn't flash landing page
        useQuizStore.setState(sessionPatch);
      }
      clearSessionState();

      if (user) {
        await handlePostAuth(user.id, user.email ?? '', intent);
        if (inviterCode) {
          await completeInvite(inviterCode, user.id).catch(console.warn);
          sessionStorage.removeItem('innerMapsInviterCode');
          // Reload connections so the inviter appears, then navigate invitee to compat
          try {
            const store = useQuizStore.getState();
            await store.loadConnections(user.id);
            const conns = useQuizStore.getState().connections;
            if (conns.length > 0) {
              store.setActiveConnection(conns[0]);
              store.setActiveTab('compat');
              store.setScreen('compatibility');
            }
          } catch { /* non-fatal — invitee still lands on results */ }
        }
      } else {
        showToast('Signed in! Take the quiz to save your results.');
        setScreen('landing');
      }

      // Clean up URL without triggering a navigation
      window.history.replaceState({}, '', '/quiz');
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderScreen() {
    // While restoring a returning user's state from DB, show a loading screen
    // instead of briefly flashing the landing page
    if (restoringState && screen === 'landing') {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ fontSize: 32, animation: 'pulseGlow 1.5s ease-in-out infinite' }}>✦</div>
          <p style={{ fontSize: 14, color: 'var(--text-light)' }}>Loading your profile…</p>
        </div>
      );
    }

    switch (screen) {
      case 'landing':
        return <LandingPage />;
      case 'name':
        return <NameInput />;
      case 'birthday':
        return <BirthdayInput />;
      case 'quiz':
        return <QuizScreen />;
      case 'miniReveal':
        return <MiniReveal />;
      case 'signup':
        return <SignupForm />;
      case 'results':
        return <Results />;
      case 'connections':
        return <ConnectionsTab />;
      case 'inviteLanding':
        // Phase 2: deep-link invite landing page
        return <LandingPage />;
      case 'compatibility':
        return <CompatibilityView />;
      case 'individualReport':
        return <IndividualReport />;
      case 'compatibilityReport':
        return <CompatibilityReport />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <LandingPage />;
    }
  }

  return (
    <>
      {renderScreen()}
      {inviteModalOpen && <InviteModal />}
      <Toast />
    </>
  );
}
