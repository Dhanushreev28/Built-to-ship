import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, ArrowRight, Sparkles, Mic } from 'lucide-react';
import { api } from '../services/api';
import { getPictogram } from '../utils/iconMapper';

export default function HomePage({ speak, stop, isPlaying }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const welcomeMessage = "Welcome to Bol-Vaani. You do not need to read or type. Tap any big category below, or tap the speaker button to hear what each service provides.";

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePlayWelcome = () => {
    speak(welcomeMessage);
  };

  const handleCategorySpeak = (e, spokenSummary) => {
    e.stopPropagation();
    speak(spokenSummary);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Welcome Banner with Giant Speaker */}
      <section className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/30 backdrop-blur border border-emerald-400/40 px-3.5 py-1.5 rounded-full text-emerald-200 text-xs sm:text-sm font-bold">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Voice-First Assistive Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Speak Your Form. <br />
            <span className="text-emerald-400">Zero Typing. Zero Reading.</span>
          </h1>

          <p className="text-slate-200 text-base sm:text-xl font-medium leading-relaxed">
            Apply for government crop subsidies, pensions, housing, and driver or labor jobs entirely through voice.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={handlePlayWelcome}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-extrabold text-base sm:text-lg shadow-lg transition-all touch-target-large ${
                isPlaying
                  ? 'bg-emerald-400 text-slate-900 ring-4 ring-emerald-300 animate-pulse'
                  : 'bg-white text-emerald-950 hover:bg-emerald-50'
              }`}
            >
              <Volume2 className="w-6 h-6 text-emerald-700" />
              <span>{isPlaying ? 'Speaking Instructions...' : 'Hear Welcome Message'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Categories Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Select Your Need
          </h2>
          <span className="text-sm font-bold text-slate-500 hidden sm:inline">
            Tap the speaker to hear what each card does
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-44 bg-slate-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => navigate(`/services/${cat.id}`)}
                className="group relative bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform">
                      {getPictogram(cat.icon_name, "w-10 h-10 sm:w-12 sm:h-12")}
                    </div>

                    {/* Listen Aloud Button */}
                    <button
                      onClick={(e) => handleCategorySpeak(e, cat.spoken_summary)}
                      title="Hear this category aloud"
                      className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm touch-target-large flex items-center justify-center"
                    >
                      <Volume2 className="w-6 h-6 text-emerald-700" />
                    </button>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
                    {cat.title}
                  </h3>

                  <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-emerald-700 font-extrabold text-lg">
                  <span>Open Services</span>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
