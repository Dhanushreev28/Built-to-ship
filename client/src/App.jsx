import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import HeaderNav from './components/HeaderNav';

import HomePage from './pages/HomePage';
import ServiceDirectoryPage from './pages/ServiceDirectoryPage';
import AssistantWorkspacePage from './pages/AssistantWorkspacePage';
import ReviewPage from './pages/ReviewPage';
import ReceiptPage from './pages/ReceiptPage';
import AdminTemplatesPage from './pages/AdminTemplatesPage';

export default function App() {
  const {
    isPlaying,
    currentText,
    isMuted,
    speak,
    stop,
    toggleMute
  } = useAudioPlayer();

  const handlePlayHelp = () => {
    speak(
      "BolVaani is your voice assistant. You do not need to read or type. Whenever you see a question, tap the big green microphone, speak your answer, and the assistant will guide you step by step."
    );
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
        <HeaderNav
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onPlayHelp={handlePlayHelp}
        />

        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  speak={speak}
                  stop={stop}
                  isPlaying={isPlaying}
                />
              }
            />
            <Route
              path="/services/:categoryId"
              element={
                <ServiceDirectoryPage
                  speak={speak}
                  stop={stop}
                  isPlaying={isPlaying}
                />
              }
            />
            <Route
              path="/assist/:templateId"
              element={
                <AssistantWorkspacePage
                  speak={speak}
                  stop={stop}
                  isPlaying={isPlaying}
                  currentSpeakingText={currentText}
                />
              }
            />
            <Route
              path="/review/:submissionId"
              element={
                <ReviewPage
                  speak={speak}
                  stop={stop}
                  isPlaying={isPlaying}
                />
              }
            />
            <Route
              path="/receipt/:submissionId"
              element={
                <ReceiptPage
                  speak={speak}
                  stop={stop}
                  isPlaying={isPlaying}
                />
              }
            />
            <Route
              path="/admin/templates"
              element={<AdminTemplatesPage />}
            />
          </Routes>
        </main>

        {/* Accessible Voice Accessibility Status Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 font-semibold space-y-1">
          <p>
            BolVaani Assistive System • Universal Voice-First Access for Citizen Welfare & Employment
          </p>
          <p className="text-slate-400">
            Powered by Google Gemini 2.5 Flash & High-Accessibility WCAG AAA Audio Pipeline
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
