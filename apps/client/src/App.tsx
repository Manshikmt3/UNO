import React, { useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { RulesModal } from './components/layout/RulesModal';
import { SettingsModal } from './components/layout/SettingsModal';
import { AIGamePage } from './pages/AIGamePage';
import { LandingPage } from './pages/LandingPage';
import { MultiplayerPage } from './pages/MultiplayerPage';
import { RulesPage } from './pages/RulesPage';

export const App: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
        <Navbar
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenRules={() => setIsRulesOpen(true)}
        />

        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/play/ai" element={<AIGamePage />} />
            <Route path="/multiplayer" element={<MultiplayerPage />} />
            <Route path="/join/:code" element={<MultiplayerPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        <RulesModal
          isOpen={isRulesOpen}
          onClose={() => setIsRulesOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;
