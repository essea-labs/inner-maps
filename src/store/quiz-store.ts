import { create } from 'zustand';
import type { ScreenName, QuizAnswers, QuizResults, Connection, StarSign } from '@/lib/types';
import { SECTIONS, getStarSign, calculateResults } from '@/lib/quiz-data';
import { MOCK_CONNECTIONS } from '@/lib/compatibility';
import { supabase } from '@/lib/supabase';
import { saveUserProfile, saveQuizResults, fetchConnections } from '@/lib/db';

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
  activeTab: 'mymap' | 'compat';

  // Modals
  inviteModalOpen: boolean;
  shareModalOpen: boolean;
  reportModalOpen: boolean;

  // Toast
  toastMessage: string | null;

  // Actions
  setScreen: (screen: ScreenName) => void;
  navigateBack: () => void;
  setUserName: (name: string) => void;
  setBirthday: (month: number, day: number) => void;
  setEmail: (email: string) => void;
  setActiveTab: (tab: 'mymap' | 'compat') => void;

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

  // Phase 2: Supabase
  loadConnections: (userId: string) => Promise<void>;
  handlePostAuth: (userId: string, email: string, intent: string) => Promise<void>;
}

function makeDefaultAnswers(): QuizAnswers {
  return {
    cognitive: Array(12).fill(null),
    attachment: Array(8).fill(null),
    connection: Array(10).fill(null),
    enneagram: Array(10).fill(null),
  };
}

// ===== STORE =====

export const useQuizStore = create<QuizStore>((set, get) => ({
  // Initial state
  screen: 'landing',
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

  // ===== PHASE 2: SUPABASE =====

  loadConnections: async (userId: string) => {
    try {
      const conns = await fetchConnections(userId);
      set({ connections: conns });
    } catch (err) {
      console.warn('loadConnections failed:', err);
    }
  },

  handlePostAuth: async (userId: string, email: string, intent: string) => {
    try {
      await saveUserProfile(userId, { email, isAnonymous: false });
      await get().loadConnections(userId);
    } catch (err) {
      console.warn('handlePostAuth save failed:', err);
    }
    get().showToast('Results saved ✓');
    if (intent === 'compatibility') {
      get().setScreen('connections');
    } else if (intent === 'invite') {
      get().setScreen('connections');
      get().setInviteModalOpen(true);
    } else {
      get().setScreen('results');
    }
  },
}));
