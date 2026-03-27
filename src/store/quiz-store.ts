import { create } from 'zustand';
import type { ScreenName, QuizAnswers, QuizResults, Connection, StarSign } from '@/lib/types';
import { SECTIONS, getStarSign, calculateResults } from '@/lib/quiz-data';
import { MOCK_CONNECTIONS } from '@/lib/compatibility';
import { supabase } from '@/lib/supabase';
import { saveUserProfile, saveQuizResults, fetchConnections, fetchUserQuizResults, completeInvite } from '@/lib/db';

// ===== SESSION PERSISTENCE HELPERS =====
// Save navigation + quiz state to sessionStorage before external redirects (Stripe, OAuth, magic link).
// This ensures the user lands back on the correct screen when they return.

const SESSION_KEYS = ['im_results','im_userName','im_birthMonth','im_birthDay','im_starSign','im_activeConnection','im_screen','im_activeTab'] as const;

export function saveStateToSession() {
  const s = useQuizStore.getState();
  if (s.results) sessionStorage.setItem('im_results', JSON.stringify(s.results));
  if (s.userName) sessionStorage.setItem('im_userName', s.userName);
  if (s.birthMonth != null) sessionStorage.setItem('im_birthMonth', String(s.birthMonth));
  if (s.birthDay != null) sessionStorage.setItem('im_birthDay', String(s.birthDay));
  if (s.starSign) sessionStorage.setItem('im_starSign', JSON.stringify(s.starSign));
  if (s.activeConnection) sessionStorage.setItem('im_activeConnection', JSON.stringify(s.activeConnection));
  // Save current screen/tab so we can return to the right place
  sessionStorage.setItem('im_screen', s.screen);
  sessionStorage.setItem('im_activeTab', s.activeTab);
}

export function restoreStateFromSession(): Record<string, any> | null {
  try {
    const savedResults = sessionStorage.getItem('im_results');
    if (!savedResults) return null; // No saved state
    const patch: Record<string, any> = {};
    patch.results = JSON.parse(savedResults);
    const savedUserName = sessionStorage.getItem('im_userName');
    const savedBirthMonth = sessionStorage.getItem('im_birthMonth');
    const savedBirthDay = sessionStorage.getItem('im_birthDay');
    const savedStarSign = sessionStorage.getItem('im_starSign');
    const savedConnection = sessionStorage.getItem('im_activeConnection');
    const savedScreen = sessionStorage.getItem('im_screen');
    const savedTab = sessionStorage.getItem('im_activeTab');
    if (savedUserName) patch.userName = savedUserName;
    if (savedBirthMonth) patch.birthMonth = Number(savedBirthMonth) || null;
    if (savedBirthDay) patch.birthDay = Number(savedBirthDay) || null;
    if (savedStarSign) patch.starSign = JSON.parse(savedStarSign);
    if (savedConnection) patch.activeConnection = JSON.parse(savedConnection);
    if (savedScreen) patch.screen = savedScreen;
    if (savedTab) patch.activeTab = savedTab;
    return patch;
  } catch {
    return null;
  }
}

export function clearSessionState() {
  SESSION_KEYS.forEach(k => sessionStorage.removeItem(k));
}

// ===== PROFILE CACHE =====
// Cache quiz results in sessionStorage so returning users get instant restore
// without a DB round-trip. The cache is written after successful restore and
// read before attempting a DB fetch.

interface ProfileCache {
  userId: string;
  results: QuizResults;
  userName: string;
  birthMonth: number | null;
  birthDay: number | null;
  email: string;
}

function saveProfileCache(cache: ProfileCache) {
  try { localStorage.setItem('im_profile_cache', JSON.stringify(cache)); } catch { /* non-fatal */ }
}

function loadProfileCache(userId: string): ProfileCache | null {
  try {
    const raw = localStorage.getItem('im_profile_cache');
    if (!raw) return null;
    const cache = JSON.parse(raw) as ProfileCache;
    // Only use cache if it belongs to the same user
    if (cache.userId !== userId) return null;
    return cache;
  } catch { return null; }
}

// ===== STATE SHAPE =====
// currentSection matches the original:
//   0 = starsign (birthday, 0 questions)
//   1 = cognitive (12 questions)
//   2 = attachment (8 questions)
//   3 = connection (10 questions)
//   4 = enneagram (10 questions)

interface QuizStore {
  // Navigation
  screen: ScreenName;
  prevScreens: ScreenName[];

  // User info
  userName: string;
  birthMonth: number | null;
  birthDay: number | null;
  starSign: StarSign | null;
  email: string;

  // Quiz progress
  currentSection: number; // 0=starsign, 1=cognitive, 2=attachment, 3=connection, 4=enneagram
  currentQuestion: number;

  // Answers
  answers: QuizAnswers;

  // Results
  results: QuizResults | null;

  // Connections / compatibility
  connections: Connection[];
  activeConnection: Connection | null;
  activeTab: 'mymap' | 'compat' | 'profile';

  // Modals
  inviteModalOpen: boolean;
  shareModalOpen: boolean;
  reportModalOpen: boolean;

  // Purchases
  purchasedIndividual: boolean;
  purchasedCompatibility: Record<string, boolean>; // keyed by connection id
  purchaseIntent: string | null; // 'purchase_individual' | 'purchase_compatibility'
  receiptUrl: string | null;

  // Auth
  currentUserId: string | null;

  // Loading
  restoringState: boolean;

  // Toast
  toastMessage: string | null;

  // Actions
  setScreen: (screen: ScreenName) => void;
  navigateBack: () => void;
  setUserName: (name: string) => void;
  setBirthday: (month: number, day: number) => void;
  setEmail: (email: string) => void;
  setActiveTab: (tab: 'mymap' | 'compat' | 'profile') => void;

  answerCognitive: (qIndex: number, value: string) => void;
  answerAttachment: (qIndex: number, value: number) => void;
  answerConnection: (qIndex: number, value: string) => void;
  answerEnneagram: (qIndex: number, value: number | string) => void;

  nextQuestion: () => void;
  prevQuestion: () => void;
  continueMini: () => void;

  calculateAndSetResults: () => void;
  resetQuiz: () => void;

  setActiveConnection: (connection: Connection | null) => void;
  setInviteModalOpen: (open: boolean) => void;
  setShareModalOpen: (open: boolean) => void;
  setReportModalOpen: (open: boolean) => void;
  showToast: (message: string) => void;
  dismissToast: () => void;

  // Purchases
  setPurchased: (productType: string, connectionId?: string) => void;
  setPurchaseIntent: (intent: string | null) => void;
  checkPurchases: (userId: string) => Promise<void>;
  startCheckout: (productType: string, connectionId?: string) => Promise<void>;

  // Phase 2: Supabase
  loadConnections: (userId: string) => Promise<void>;
  restoreUserState: (userId: string, email?: string) => Promise<void>;
  handlePostAuth: (userId: string, email: string, intent: string, inviterCode?: string | null) => Promise<void>;
}

function makeDefaultAnswers(): QuizAnswers {
  return {
    cognitive: Array(12).fill(null),
    attachment: Array(8).fill(null),
    connection: Array(10).fill(null),
    enneagram: Array(10).fill(null),
  };
}

// ===== RETURNING USER DETECTION =====
// Check localStorage synchronously on store creation to know whether to show
// loading screen on first render (prevents landing page flash for returning users).

function isReturningUser(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    // Don't show loading screen for password reset — show the form immediately
    const params = new URLSearchParams(window.location.search);
    if (params.get('authCallback') === '1' && params.get('intent') === 'recovery') return false;
    return localStorage.getItem('im_returning') === '1';
  }
  catch { return false; }
}

/** Check if this page load is a password recovery callback */
function isRecoveryCallback(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('authCallback') === '1' && params.get('intent') === 'recovery';
  } catch { return false; }
}

export function markReturningUser() {
  try { localStorage.setItem('im_returning', '1'); } catch { /* non-fatal */ }
}

export function clearReturningUser() {
  try { localStorage.removeItem('im_returning'); } catch { /* non-fatal */ }
}

// ===== STORE =====

export const useQuizStore = create<QuizStore>((set, get) => ({
  // Initial state — recovery callback gets the password form on first render
  screen: isRecoveryCallback() ? 'resetPassword' : 'landing',
  prevScreens: [],
  userName: '',
  birthMonth: null,
  birthDay: null,
  starSign: null,
  email: '',
  currentSection: 1, // Start at cognitive (birthday handled separately)
  currentQuestion: 0,
  answers: makeDefaultAnswers(),
  results: null,
  connections: process.env.NODE_ENV === 'development' ? MOCK_CONNECTIONS : [],
  activeConnection: null,
  activeTab: 'mymap',
  inviteModalOpen: false,
  shareModalOpen: false,
  reportModalOpen: false,
  purchasedIndividual: false,
  purchasedCompatibility: {},
  purchaseIntent: null,
  receiptUrl: null,
  currentUserId: null,
  // Always start with loading so we never flash the wrong screen.
  // Each code path (restore, auth callback, purchase, recovery) clears this
  // once it knows which screen to show.
  restoringState: true,
  toastMessage: null,

  // ===== NAVIGATION =====

  setScreen: (screen) => {
    const { screen: current, prevScreens } = get();
    set({ screen, prevScreens: [...prevScreens, current] });
  },

  navigateBack: () => {
    const { prevScreens, screen, currentSection, currentQuestion } = get();

    if (screen === 'quiz') {
      if (currentQuestion > 0) {
        set({ currentQuestion: currentQuestion - 1 });
        return;
      }
      // First question of this section — go back to prev section or birthday
      if (currentSection > 1) {
        const prevSection = currentSection - 1;
        const prevSectionLen = SECTIONS[prevSection].questions;
        set({ currentSection: prevSection, currentQuestion: prevSectionLen - 1 });
        return;
      }
      // At start of cognitive — go back to birthday
      const prev = prevScreens[prevScreens.length - 1] || 'birthday';
      set({ screen: prev, prevScreens: prevScreens.slice(0, -1) });
      return;
    }

    if (screen === 'miniReveal') {
      // Go back to last question of the just-completed section (currentSection already incremented)
      const prevSec = currentSection - 1;
      const prevSectionLen = SECTIONS[prevSec].questions;
      set({
        screen: 'quiz',
        currentSection: prevSec,
        currentQuestion: prevSectionLen - 1,
        prevScreens: prevScreens.slice(0, -1),
      });
      return;
    }

    if (prevScreens.length > 0) {
      const prev = prevScreens[prevScreens.length - 1];
      set({ screen: prev, prevScreens: prevScreens.slice(0, -1) });
    }
  },

  // ===== USER INFO =====

  setUserName: (name) => set({ userName: name }),

  setBirthday: (month, day) => {
    const starSign = getStarSign(month, day);
    set({ birthMonth: month, birthDay: day, starSign });
  },

  setEmail: (email) => set({ email }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  // ===== ANSWERS =====

  answerCognitive: (qIndex, value) => {
    const answers = { ...get().answers };
    const cognitive = [...answers.cognitive];
    cognitive[qIndex] = value;
    set({ answers: { ...answers, cognitive } });
  },

  answerAttachment: (qIndex, value) => {
    const answers = { ...get().answers };
    const attachment = [...answers.attachment];
    attachment[qIndex] = value;
    set({ answers: { ...answers, attachment } });
  },

  answerConnection: (qIndex, value) => {
    const answers = { ...get().answers };
    const connection = [...answers.connection];
    connection[qIndex] = value;
    set({ answers: { ...answers, connection } });
  },

  answerEnneagram: (qIndex, value) => {
    const answers = { ...get().answers };
    const enneagram = [...answers.enneagram];
    enneagram[qIndex] = value;
    set({ answers: { ...answers, enneagram } });
  },

  // ===== QUIZ NAVIGATION =====

  nextQuestion: () => {
    const { currentSection, currentQuestion, screen: current, prevScreens } = get();
    const section = SECTIONS[currentSection];
    const isLastSection = currentSection === SECTIONS.length - 1;
    const isLastQ = currentQuestion === section.questions - 1;

    if (!isLastQ) {
      // Advance within section
      set({ currentQuestion: currentQuestion + 1 });
    } else if (isLastSection) {
      // Final question of final section → calculate results, show immediately, persist anonymously
      const { answers, starSign, userName, birthMonth, birthDay } = get();
      const results = calculateResults(answers, starSign);
      markReturningUser();
      set({
        results,
        screen: 'results',
        prevScreens: [...prevScreens, current],
      });
      // Sign in anonymously and persist quiz data to Supabase
      (async () => {
        try {
          const { data: { user } } = await supabase.auth.signInAnonymously();
          if (user) {
            await saveUserProfile(user.id, {
              name: userName,
              birthMonth,
              birthDay,
              isAnonymous: true,
            });
            await saveQuizResults(user.id, results, answers);
          }
        } catch (err) {
          // Non-fatal: user still sees results even if DB write fails
          console.warn('Anon save failed:', err);
        }
      })();
    } else {
      // End of non-final section → show miniReveal, increment section
      set({
        currentSection: currentSection + 1,
        currentQuestion: 0,
        screen: 'miniReveal',
        prevScreens: [...prevScreens, current],
      });
    }
  },

  prevQuestion: () => {
    const { currentSection, currentQuestion } = get();
    if (currentQuestion > 0) {
      set({ currentQuestion: currentQuestion - 1 });
    } else if (currentSection > 1) {
      const prevSection = currentSection - 1;
      set({
        currentSection: prevSection,
        currentQuestion: SECTIONS[prevSection].questions - 1,
      });
    }
  },

  continueMini: () => {
    const { screen: current, prevScreens } = get();
    set({ screen: 'quiz', prevScreens: [...prevScreens, current] });
  },

  // ===== RESULTS =====

  calculateAndSetResults: () => {
    const { answers, starSign } = get();
    const results = calculateResults(answers, starSign);
    set({ results });
  },

  resetQuiz: () => {
    clearReturningUser();
    clearSessionState();
    try {
      localStorage.removeItem('im_purchased_individual');
      localStorage.removeItem('im_purchased_compat');
      localStorage.removeItem('im_profile_cache');
    } catch { /* non-fatal */ }
    set({
      screen: 'landing',
      prevScreens: [],
      userName: '',
      birthMonth: null,
      birthDay: null,
      starSign: null,
      email: '',
      currentSection: 1,
      currentQuestion: 0,
      answers: makeDefaultAnswers(),
      results: null,
      currentUserId: null,
      connections: [],
      activeConnection: null,
      activeTab: 'mymap',
      purchasedIndividual: false,
      purchasedCompatibility: {},
      purchaseIntent: null,
      inviteModalOpen: false,
    });
  },

  // ===== CONNECTIONS =====

  setActiveConnection: (connection) => set({ activeConnection: connection }),

  // ===== MODALS =====

  setInviteModalOpen: (open) => set({ inviteModalOpen: open }),
  setShareModalOpen: (open) => set({ shareModalOpen: open }),
  setReportModalOpen: (open) => set({ reportModalOpen: open }),

  // ===== TOAST =====

  showToast: (message) => {
    set({ toastMessage: message });
    setTimeout(() => {
      set({ toastMessage: null });
    }, 2500);
  },

  dismissToast: () => set({ toastMessage: null }),

  // ===== PURCHASES =====

  setPurchased: (productType, connectionId) => {
    if (productType === 'individual_report') {
      set({ purchasedIndividual: true });
      // Persist to localStorage as a backup so it survives refresh even if DB lookup fails
      try { localStorage.setItem('im_purchased_individual', '1'); } catch { /* non-fatal */ }
    } else if (productType === 'compatibility_report' && connectionId) {
      set((s) => ({
        purchasedCompatibility: { ...s.purchasedCompatibility, [connectionId]: true },
      }));
      try {
        const existing = JSON.parse(localStorage.getItem('im_purchased_compat') || '{}');
        existing[connectionId] = true;
        localStorage.setItem('im_purchased_compat', JSON.stringify(existing));
      } catch { /* non-fatal */ }
    }
  },

  setPurchaseIntent: (intent) => set({ purchaseIntent: intent }),

  checkPurchases: async (userId: string) => {
    // First: hydrate from localStorage backup (instant, survives DB failures)
    try {
      if (localStorage.getItem('im_purchased_individual') === '1') {
        set({ purchasedIndividual: true });
      }
      const compatJson = localStorage.getItem('im_purchased_compat');
      if (compatJson) {
        const compat = JSON.parse(compatJson) as Record<string, boolean>;
        set((s) => ({
          purchasedCompatibility: { ...s.purchasedCompatibility, ...compat },
        }));
      }
    } catch { /* non-fatal */ }

    // Then: verify against DB (authoritative source — also writes to localStorage)
    try {
      const res = await fetch(`/api/purchases?user_id=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error('Failed to fetch purchases');
      const { purchases } = await res.json() as {
        purchases: { product_type: string; connection_id: string | null }[];
      };

      for (const p of purchases) {
        if (p.product_type === 'individual_report') {
          set({ purchasedIndividual: true });
          try { localStorage.setItem('im_purchased_individual', '1'); } catch { /* non-fatal */ }
        } else if (p.product_type === 'compatibility_report' && p.connection_id) {
          set((s) => ({
            purchasedCompatibility: { ...s.purchasedCompatibility, [p.connection_id!]: true },
          }));
          try {
            const existing = JSON.parse(localStorage.getItem('im_purchased_compat') || '{}');
            existing[p.connection_id] = true;
            localStorage.setItem('im_purchased_compat', JSON.stringify(existing));
          } catch { /* non-fatal */ }
        }
      }
    } catch (err) {
      console.warn('checkPurchases DB lookup failed (localStorage backup used):', err);
    }
  },

  startCheckout: async (productType: string, connectionId?: string) => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_type: productType, connection_id: connectionId }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        console.error('Checkout API error:', data.error);
        get().showToast(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      if (data.already_purchased) {
        // Already purchased — go straight to report
        get().setPurchased(productType, connectionId);
        if (productType === 'individual_report') {
          get().setScreen('individualReport');
        } else {
          get().setScreen('compatibilityReport');
        }
        get().showToast('Report already unlocked!');
        return;
      }

      if (data.url) {
        // Persist quiz state to sessionStorage so it survives the Stripe redirect
        saveStateToSession();
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      get().showToast('Something went wrong. Please try again.');
    }
  },

  // ===== PHASE 2: SUPABASE =====

  loadConnections: async (userId: string) => {
    try {
      const conns = await fetchConnections(userId);
      set({ connections: conns });
    } catch (err) {
      console.warn('loadConnections failed:', err);
    }
  },

  restoreUserState: async (userId: string, email?: string) => {
    set({ restoringState: true, currentUserId: userId, ...(email ? { email } : {}) });

    // Try cached profile first — renders instantly without any network calls
    const cached = loadProfileCache(userId);
    if (cached) {
      set({
        results: cached.results,
        userName: cached.userName,
        birthMonth: cached.birthMonth,
        birthDay: cached.birthDay,
        starSign: cached.results.starSign,
        email: cached.email || email || '',
        restoringState: false,
      });
      get().setScreen('results');
      // Refresh connections and purchases in the background (non-blocking)
      Promise.all([
        get().loadConnections(userId),
        get().checkPurchases(userId),
      ]).catch(() => { /* non-fatal */ });
      return;
    }

    try {
      // No cache — fire all three fetches in parallel.
      // This eliminates the waterfall: results → (connections + purchases).
      const [data] = await Promise.all([
        fetchUserQuizResults(userId),
        get().loadConnections(userId),
        get().checkPurchases(userId),
      ]);
      if (!data) { set({ restoringState: false }); return; } // User hasn't taken the quiz yet
      const { results, name, birthMonth, birthDay } = data;
      set({ results, userName: name, birthMonth, birthDay, starSign: results.starSign });
      get().setScreen('results');
      set({ restoringState: false });
      // Cache for next time
      saveProfileCache({ userId, results, userName: name, birthMonth, birthDay, email: email || '' });
    } catch (err) {
      console.warn('restoreUserState failed:', err);
      set({ restoringState: false });
    }
  },

  handlePostAuth: async (userId: string, email: string, intent: string, inviterCode?: string | null) => {
    markReturningUser();
    try {
      const { results, answers, userName, birthMonth, birthDay } = get();

      // Check if this user already has saved results in the DB.
      // If so, keep the original results (protects existing compatibility data).
      let existingData: Awaited<ReturnType<typeof fetchUserQuizResults>> = null;
      try { existingData = await fetchUserQuizResults(userId); } catch { /* non-fatal */ }

      set({ currentUserId: userId, email });

      if (existingData) {
        // Existing results in DB — restore them (don't overwrite with new quiz)
        // Pass the current in-memory name so it's preserved if the user just entered it
        await saveUserProfile(userId, { name: userName || existingData.name || undefined, email, isAnonymous: false });
        set({ results: existingData.results, userName: existingData.name, birthMonth: existingData.birthMonth, birthDay: existingData.birthDay, starSign: existingData.results.starSign });
        saveProfileCache({ userId, results: existingData.results, userName: existingData.name, birthMonth: existingData.birthMonth, birthDay: existingData.birthDay, email });
      } else if (results) {
        // First time saving — persist current in-memory results
        await saveUserProfile(userId, { name: userName, email, birthMonth, birthDay, isAnonymous: false });
        await saveQuizResults(userId, results, answers);
        saveProfileCache({ userId, results, userName, birthMonth, birthDay, email });
      } else {
        // No results anywhere — just save profile
        await saveUserProfile(userId, { email, isAnonymous: false });
      }

      // Complete invite if inviterCode was passed (works for both OAuth and email+password)
      let inviteCompleted = false;
      if (inviterCode) {
        try {
          inviteCompleted = await completeInvite(inviterCode, userId);
          if (!inviteCompleted) {
            console.warn('completeInvite returned false for code:', inviterCode);
          }
        } catch (err) {
          console.warn('completeInvite threw:', err);
        }
        sessionStorage.removeItem('innerMapsInviterCode');
      }

      // Load connections and purchases (must await before checking connections)
      await Promise.all([
        get().loadConnections(userId),
        get().checkPurchases(userId),
      ]);

      // If invite was just completed, auto-navigate to compatibility
      if (inviterCode && inviteCompleted) {
        const conns = get().connections;
        if (conns.length > 0) {
          get().setActiveConnection(conns[0]);
          get().setActiveTab('compat');
          set({ screen: 'compatibility', restoringState: false });
          return;
        }
      }
    } catch (err) {
      console.warn('handlePostAuth save failed:', err);
    }

    // Claim any anonymous purchase made before signup
    try {
      const stripeSessionId = sessionStorage.getItem('im_stripe_session_id');
      if (stripeSessionId) {
        await fetch('/api/purchases/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stripe_session_id: stripeSessionId }),
        });
        sessionStorage.removeItem('im_stripe_session_id');
      }
    } catch { /* non-fatal */ }

    // Handle save_after_purchase intent — return to report
    if (intent === 'save_after_purchase') {
      get().showToast('Account created — your report is saved!');
      set({ screen: 'individualReport', restoringState: false });
      return;
    }

    // Handle purchase intents — redirect to Stripe checkout
    if (intent === 'purchase_individual') {
      await get().startCheckout('individual_report');
      return;
    }
    if (intent === 'purchase_compatibility') {
      const connectionId = get().activeConnection?.id;
      await get().startCheckout('compatibility_report', connectionId);
      return;
    }

    // Only toast for the basic "save results" flow
    if (intent === 'save') {
      get().showToast('Results saved ✓');
    }

    // Navigate based on intent and clear loading state
    if (intent === 'compatibility') {
      set({ screen: 'connections', restoringState: false });
    } else if (intent === 'invite') {
      set({ screen: 'connections', restoringState: false });
    } else if (intent === 'profile') {
      set({ screen: 'profile', restoringState: false });
    } else {
      // 'save' or anything else — go to results if we have them, else landing
      set({ screen: get().results ? 'results' : 'landing', restoringState: false });
    }
  },
}));
