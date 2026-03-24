'use client';

import { useQuizStore } from '@/store/quiz-store';

export default function TabBar() {
  const activeTab = useQuizStore((s) => s.activeTab);
  const setActiveTab = useQuizStore((s) => s.setActiveTab);
  const setScreen = useQuizStore((s) => s.setScreen);

  function handleMyMap() {
    setActiveTab('mymap');
    setScreen('results');
  }

  function handleCompat() {
    setActiveTab('compat');
    setScreen('compatibility');
  }

  return (
    <div className="tab-bar">
      <button
        className={`tab-btn${activeTab === 'mymap' ? ' active' : ''}`}
        onClick={handleMyMap}
      >
        <span className="tab-icon">✦</span>
        <span className="tab-label">My Map</span>
      </button>
      <button
        className={`tab-btn${activeTab === 'compat' ? ' active' : ''}`}
        onClick={handleCompat}
      >
        <span className="tab-icon">⟡</span>
        <span className="tab-label">Compatibility</span>
      </button>
    </div>
  );
}
