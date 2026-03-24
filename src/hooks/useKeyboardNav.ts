import { useEffect } from 'react';
import { useQuizStore } from '@/store/quiz-store';

export default function useKeyboardNav() {
  const navigateBack = useQuizStore((s) => s.navigateBack);
  const screen = useQuizStore((s) => s.screen);

  useEffect(() => {
    const swipeableScreens = ['name', 'birthday', 'quiz', 'miniReveal', 'signup'];
    if (!swipeableScreens.includes(screen)) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Skip if user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        navigateBack();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [screen, navigateBack]);
}
