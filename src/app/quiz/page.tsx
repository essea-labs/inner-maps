'use client';

import { useEffect, useState } from 'react';
import { useQuizStore, restoreStateFromSession, clearSessionState, isReturningUser } from '@/store/quiz-store';
import { supabase } from '@/lib/supabase';
import { setAuthCallbackInProgress } from '@/hooks/useAuth';

import LandingPage from '@/components/LandingPage';
import NameInput from '@/components/quiz/NameInput';
import BirthdayInput from '@/components/quiz/BirthdayInput';
import QuizScreen from '@/components/quiz/QuizScreen';
import MiniReveal from '@/components/quiz/MiniReveal';
import SignupForm from '@/components/quiz/SignupForm';
import ResetPasswordForm from '@/components/quiz/ResetPasswordForm';
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

// Loading placeholder — rendered identically on server and client to prevent
// hydration mismatch. The real UI only mounts after useEffect fires.
function LoadingPlaceholder() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div style={{ fontSize: 32, animation: 'pulseGlow 1.5s ease-in-out infinite' }}>✦</div>
      <p style={{ fontSize: 14, color: 'var(--text-light)' }}>Loading your profile…</p>
    </div>
  );
}

export default function QuizPage() {
  // Mount guard — guarantees server and client render the same placeholder,
  // eliminating hydration mismatches from localStorage/window reads in Zustand.
  const [mounted, setMounted] = useState(false);

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

  // Mark as mounted on client — must be the first effect
  useEffect(() => { setMounted(true); }, []);

  // Scroll to top on every screen change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  // Auto-restore returning user's quiz state on load.
  // For returning users, restoringState starts true (set in store init), so the
  // first render shows a loading screen instead of flashing the landing page.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Skip if other handlers will take over (they handle restoringState themselves)
    if (params.get('authCallback') === '1' || params.get('purchase') === 'success') return;

    // Check sessionStorage first — covers browser-back from Stripe/OAuth
    const sessionPatch = restoreStateFromSession();
    if (sessionPatch) {
      useQuizStore.setState({ ...sessionPatch, restoringState: false });
      clearSessionState();
      return;
    }

    // Otherwise try DB restore for logged-in users.
    // Use getSession() instead of getUser() — the middleware already refreshed
    // the token via getUser(), so the session cookie is valid. getSession() reads
    // the local cookie without a network round-trip, saving ~200-400ms.
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      let user = session?.user ?? null;

      // getSession() reads the local cookie — fast but can fail if the token
      // is stale. For returning users, fall back to getUser() which validates
      // server-side and auto-refreshes the token. This prevents flashing the
      // landing page when the cookie is expired but the account is valid.
      if (!user && isReturningUser()) {
        const { data } = await supabase.auth.getUser();
        user = data.user ?? null;
      }

      if (user && !user.is_anonymous && useQuizStore.getState().results === null) {
        await restoreUserState(user.id, user.email ?? '');
      } else {
        // Not a returning user or already have results — clear loading
        useQuizStore.setState({ restoringState: false });
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Store inviterCode when arriving from an invite link, and fetch inviter name
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviterCode = params.get('inviterCode');
    if (inviterCode && params.get('authCallback') !== '1') {
      sessionStorage.setItem('innerMapsInviterCode', inviterCode);
      window.history.replaceState({}, '', '/quiz');

      // Fetch inviter name for the disclosure banner (non-blocking, non-fatal)
      fetch(`/api/invite-lookup?code=${encodeURIComponent(inviterCode)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.inviterName) {
            sessionStorage.setItem('innerMapsInviterName', data.inviterName);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Handle Stripe purchase success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('purchase') !== 'success') return;

    const product = params.get('product') ?? '';
    const connectionId = params.get('connection_id') ?? undefined;
    const sessionId = params.get('session_id') ?? '';

    // Restore quiz state saved before Stripe redirect (page reloads on return)
    const sessionPatch = restoreStateFromSession();
    if (sessionPatch) {
      // Don't restore screen/tab — purchase handler navigates to the report screen
      delete sessionPatch.screen;
      delete sessionPatch.activeTab;
      useQuizStore.setState({ ...sessionPatch, restoringState: false });
    }
    clearSessionState();
    // Ensure loading gate is cleared even without session data
    useQuizStore.setState({ restoringState: false });

    // Store session ID so we can claim this purchase if user signs up later
    if (sessionId) {
      try { sessionStorage.setItem('im_stripe_session_id', sessionId); } catch { /* */ }
    }

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

    // Confirm purchase in DB directly (don't rely solely on webhook)
    (async () => {
      if (sessionId) {
        try {
          const res = await fetch('/api/purchases/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.receipt_url) {
              useQuizStore.setState({ receiptUrl: data.receipt_url });
            }
            console.log('Purchase confirmed via direct verification');
            return; // Confirmed — no need for retry loop
          }
        } catch (err) {
          console.warn('Direct purchase confirm failed, falling back to webhook check:', err);
        }
      }

      // Fallback: retry webhook-based check if direct confirm failed
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      for (let attempt = 0; attempt < 5; attempt++) {
        await checkPurchases(user.id);
        const store = useQuizStore.getState();
        const confirmed = product === 'individual_report'
          ? store.purchasedIndividual
          : !!(connectionId && store.purchasedCompatibility[connectionId]);
        if (confirmed) break;
        // Wait before retrying (2s, 4s, 6s, 8s, 10s)
        await new Promise(r => setTimeout(r, (attempt + 1) * 2000));
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle post-OAuth / magic-link / password-reset callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('authCallback') !== '1') return;

    // Prevent useAuth from double-restoring while we handle this callback
    setAuthCallbackInProgress(true);

    let intent = params.get('intent') ?? 'save';
    const authError = params.get('authError');

    // Detect expired/reused recovery links: Supabase may redirect without
    // type=recovery on failure, so the callback falls back to intent=save.
    // The localStorage flag set when requesting the reset survives this.
    let recoveryPending = false;
    try { recoveryPending = localStorage.getItem('im_recovery_pending') === '1'; } catch { /* */ }
    if (intent !== 'recovery' && recoveryPending) intent = 'recovery';

    // Password reset callback
    if (intent === 'recovery') {
      // Valid recovery token — show the reset form (already set by store init).
      // Keep im_recovery_pending — only clear it after successful password update
      // (in ResetPasswordForm) so we can detect re-clicks on expired links.
      if (!authError) {
        useQuizStore.setState({ restoringState: false });
        window.history.replaceState({}, '', '/quiz');
        setAuthCallbackInProgress(false);
        return;
      }

      // Token expired or already used — navigate to the right place
      try { localStorage.removeItem('im_recovery_pending'); } catch { /* */ }
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !user.is_anonymous) {
          const storeResults = useQuizStore.getState().results;
          if (!storeResults) await restoreUserState(user.id, user.email ?? '');
          else useQuizStore.setState({ screen: 'results', restoringState: false });
        } else {
          showToast('This reset link has expired. Please request a new one.');
          useQuizStore.setState({ screen: 'landing', restoringState: false });
        }
        window.history.replaceState({}, '', '/quiz');
        setAuthCallbackInProgress(false);
      })();
      return;
    }

    // Check if auth failed during callback (non-recovery)
    if (authError) {
      showToast('Sign-in failed. Please try again.');
      useQuizStore.setState({ restoringState: false });
      window.history.replaceState({}, '', '/quiz');
      setAuthCallbackInProgress(false);
      return;
    }

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Check both URL param (cookie-passed from auth callback) and sessionStorage (from invite landing)
      const inviterCode = params.get('inviterCode') ?? sessionStorage.getItem('innerMapsInviterCode');

      // Restore quiz state saved before Google OAuth redirect
      const sessionPatch = restoreStateFromSession();
      if (sessionPatch) {
        useQuizStore.setState(sessionPatch);
      }
      clearSessionState();

      if (user) {
        // Pass inviterCode to handlePostAuth — it handles completeInvite + navigation
        await handlePostAuth(user.id, user.email ?? '', intent, inviterCode);
      } else {
        showToast('Signed in! Take the quiz to save your results.');
        setScreen('landing');
      }

      // Clean up URL without triggering a navigation
      window.history.replaceState({}, '', '/quiz');
      // Allow useAuth to resume normal behavior
      setAuthCallbackInProgress(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Before mount, return the same placeholder the server rendered
  if (!mounted) return <LoadingPlaceholder />;

  function renderScreen() {
    // Show loading until we know which screen to display — prevents flash of
    // landing page for logged-in users, password reset, and during SSR
    if (restoringState) return <LoadingPlaceholder />;

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
      case 'resetPassword':
        return <ResetPasswordForm />;
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
