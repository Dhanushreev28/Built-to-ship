import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, Volume2, VolumeX, HelpCircle, Shield, Home } from 'lucide-react';

export default function HeaderNav({ isMuted, onToggleMute, onPlayHelp }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Logo / Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
            <Mic className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              BolVaani
              <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Voice First
              </span>
            </span>
            <p className="text-xs font-semibold text-slate-500 hidden sm:block">
              Speak instead of typing • AI reads responses aloud
            </p>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Home Button */}
          <Link
            to="/"
            title="Go to Home"
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors touch-target-large flex items-center justify-center"
          >
            <Home className="w-6 h-6" />
          </Link>

          {/* Sound Mute/Unmute */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Turn Sound On' : 'Mute Sound'}
            className={`p-3 rounded-2xl transition-colors touch-target-large flex items-center justify-center ${
              isMuted
                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
            }`}
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>

          {/* Spoken Help Trigger */}
          <button
            onClick={onPlayHelp}
            title="Listen to instructions"
            className="p-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors touch-target-large flex items-center justify-center"
          >
            <HelpCircle className="w-6 h-6" />
          </button>

          {/* Admin / Supervisor Link */}
          <Link
            to="/admin/templates"
            title="Supervisor / Submissions Dashboard"
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors touch-target-large flex items-center justify-center"
          >
            <Shield className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </header>
  );
}
