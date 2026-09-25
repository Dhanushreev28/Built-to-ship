import React, { useState } from 'react';
import { Volume2, CheckCircle2, Edit3, HelpCircle } from 'lucide-react';
import { getPictogram } from '../utils/iconMapper';

export default function SpokenFieldCard({
  field,
  currentValue,
  isActive = false,
  onReplayAudio,
  onManualEditSubmit,
  isAudioPlaying = false
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(currentValue || '');

  if (!field) return null;

  const handleEditSave = (e) => {
    e.preventDefault();
    if (tempValue.trim()) {
      onManualEditSubmit(field.id, tempValue.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`relative w-full rounded-3xl p-6 sm:p-8 transition-all duration-300 border-2 ${
        isActive
          ? 'bg-white border-emerald-500 shadow-xl ring-4 ring-emerald-100'
          : currentValue
          ? 'bg-slate-50 border-emerald-300 opacity-90'
          : 'bg-white border-slate-200 opacity-60'
      }`}
    >
      {/* Top Banner: Icon + Status */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-md ${
              isActive
                ? 'bg-emerald-600 text-white'
                : currentValue
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {getPictogram(field.icon_name, "w-8 h-8 sm:w-9 sm:h-9")}
          </div>

          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
              Question {field.step_order}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {field.label}
            </h3>
          </div>
        </div>

        {/* Listen Again Button */}
        <button
          onClick={() => onReplayAudio(field.voice_prompt)}
          aria-label="Read this question aloud"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm sm:text-base transition-all touch-target-large ${
            isAudioPlaying
              ? 'bg-emerald-500 text-white shadow-md animate-pulse'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}
        >
          <Volume2 className="w-5 h-5 text-emerald-700" />
          <span className="hidden sm:inline">Hear Question</span>
        </button>
      </div>

      {/* Spoken Question Prompt */}
      <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 mb-4">
        <p className="text-lg sm:text-xl font-medium text-slate-800 leading-relaxed">
          "{field.voice_prompt}"
        </p>
        {field.voice_clarification && (
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
            <HelpCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Tip: {field.voice_clarification}</span>
          </p>
        )}
      </div>

      {/* Recorded / Confirmed Value Display */}
      {currentValue ? (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                Recorded Answer
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-900">
                {currentValue}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onReplayAudio(`I have recorded your answer as: ${currentValue}`)}
              title="Hear answer back"
              className="p-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setTempValue(currentValue);
                setIsEditing(true);
              }}
              title="Edit answer"
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-sm"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-3 text-slate-400 font-semibold text-sm">
          {isActive ? 'Speak your answer using the microphone below' : 'Pending question'}
        </div>
      )}

      {/* Inline Fallback Manual Edit Dialog */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h4 className="text-xl font-bold text-slate-900 mb-2">Edit {field.label}</h4>
            <p className="text-sm text-slate-500 mb-4">You can type or correct the recorded value:</p>
            <form onSubmit={handleEditSave} className="space-y-4">
              <input
                type="text"
                autoFocus
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full text-xl font-bold p-4 border-2 border-emerald-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-200"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md"
                >
                  Save Answer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
