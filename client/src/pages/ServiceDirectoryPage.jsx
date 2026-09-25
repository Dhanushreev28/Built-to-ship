import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Volume2, Mic, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { getPictogram } from '../utils/iconMapper';

export default function ServiceDirectoryPage({ speak }) {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, tmpls] = await Promise.all([
          api.getCategories(),
          api.getTemplates(categoryId)
        ]);

        const currentCat = cats.find(c => c.id === categoryId || c.slug === categoryId);
        setCategory(currentCat || cats[0]);
        setTemplates(tmpls);

        // Speak category introduction on entry
        if (currentCat) {
          speak(currentCat.spoken_summary);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [categoryId, speak]);

  const handleStartVoice = (templateId) => {
    navigate(`/assist/${templateId}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Back navigation */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 font-extrabold text-slate-700 bg-white hover:bg-slate-100 px-5 py-3 rounded-2xl border border-slate-200 shadow-sm touch-target-large"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to All Categories</span>
      </button>

      {/* Category Header */}
      {category && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              {getPictogram(category.icon_name, "w-10 h-10")}
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                Category
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
                {category.title}
              </h1>
            </div>
          </div>

          <button
            onClick={() => speak(category.spoken_summary)}
            title="Listen to category summary"
            className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 touch-target-large flex items-center justify-center"
          >
            <Volume2 className="w-7 h-7 text-emerald-700" />
          </button>
        </div>
      )}

      {/* Templates List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900">
          Available Applications
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
            <p className="text-slate-500 font-bold text-lg">No application forms found under this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {templates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 hover:border-emerald-500 shadow-md hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4 max-w-xl">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                    {getPictogram(tmpl.icon_name, "w-9 h-9")}
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-1">
                      {tmpl.title}
                    </h3>
                    <p className="text-slate-600 font-medium text-base leading-relaxed mb-3">
                      {tmpl.description}
                    </p>

                    <button
                      onClick={() => speak(tmpl.spoken_intro)}
                      className="inline-flex items-center gap-1.5 text-sm font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Hear Scheme Introduction</span>
                    </button>
                  </div>
                </div>

                {/* Big Start by Voice Button */}
                <button
                  onClick={() => handleStartVoice(tmpl.id)}
                  className="w-full md:w-auto px-8 py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xl shadow-lg hover:shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 transition-transform active:scale-95 touch-target-large"
                >
                  <Mic className="w-7 h-7" />
                  <span>Start by Voice</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
