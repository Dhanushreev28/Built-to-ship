import React from 'react';
import { Check } from 'lucide-react';
import { getPictogram } from '../utils/iconMapper';

export default function ProgressStepBar({
  fields = [],
  currentFieldId = null,
  completedFieldIds = [],
  onStepClick
}) {
  if (!fields || fields.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200 mb-6">
      <div className="flex items-center justify-between relative">
        {/* Background connector line */}
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 -translate-y-1/2 z-0" />

        {fields.map((f, idx) => {
          const isDone = completedFieldIds.includes(f.id);
          const isCurrent = f.id === currentFieldId;

          return (
            <button
              key={f.id}
              onClick={() => onStepClick && onStepClick(f)}
              title={`${f.label} - Step ${idx + 1}`}
              className="relative z-10 flex flex-col items-center group focus:outline-none"
            >
              <div
                className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-200 shadow-sm border-2 ${
                  isDone
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-white border-emerald-600 text-emerald-700 ring-4 ring-emerald-100 scale-110'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? (
                  <Check className="w-6 h-6 stroke-[3]" />
                ) : (
                  getPictogram(f.icon_name, "w-5 h-5")
                )}
              </div>

              <span
                className={`text-[11px] sm:text-xs font-bold mt-1.5 max-w-[70px] truncate text-center ${
                  isCurrent
                    ? 'text-emerald-700 font-extrabold'
                    : isDone
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                {f.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
