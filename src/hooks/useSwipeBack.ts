import { useEffect, useRef } from 'react';
import { useQuizStore } from '@/store/quiz-store';

export default function useSwipeBack() {
  const navigateBack = useQuizStore((s) => s.navigateBack);
  const screen = useQuizStore((s) => s.screen);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  useEffect(() => {
    // Only enable swipe-back on quiz screens (not landing or post-results)
    const swipeableScreens = ['name', 'birthday', 'quiz', 'miniReveal', 'signup'];
    if (!swipeableScreens.includes(screen)) return;

    function handleTouchStart(e: TouchEvent) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }

    function handleTouchEnd(e: TouchEvent) {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      // Swipe right (dx > 60) and mostly horizontal (dx > abs(dy))
      if (dx > 60 && Math.abs(dx) > Math.abs(dy)) {
        navigateBack();
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [screen, navigateBack]);
}
