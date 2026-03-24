'use client';

import { useQuizStore } from '@/store/quiz-store';

export default function Toast() {
  const toastMessage = useQuizStore((s) => s.toastMessage);
  const dismissToast = useQuizStore((s) => s.dismissToast);

  if (!toastMessage) return null;

  return (
    <div className="toast show" onClick={dismissToast}>
      {toastMessage}
    </div>
  );
}
