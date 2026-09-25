import React from 'react';
import { CheckCircle2, Volume2, Download, RefreshCw, Printer } from 'lucide-react';

export default function VoiceReceiptCard({
  receiptCode,
  submissionId,
  formTitle,
  submittedAt,
  pdfUrl,
  onPlayReceiptAudio,
  onStartNew
}) {
  const digits = (receiptCode || '0000').split('');

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-emerald-500 max-w-xl mx-auto text-center">
      {/* Giant Success Badge */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-6 shadow-inner animate-bounce-subtle">
        <CheckCircle2 className="w-14 h-14 sm:w-16 sm:h-16 stroke-[2.5]" />
      </div>

      <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
        Voice Submission Successful
      </span>

      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 mb-2">
        Application Submitted!
      </h2>
      <p className="text-slate-600 font-medium mb-6">
        {formTitle}
      </p>

      {/* Giant 4-Digit Spoken Reference Number */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 mb-6 shadow-lg">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-400 mb-2">
          Your 4-Digit Spoken Reference Code
        </p>

        <div className="flex justify-center items-center gap-3 sm:gap-4 my-2">
          {digits.map((d, i) => (
            <div
              key={i}
              className="w-14 h-18 sm:w-18 sm:h-22 bg-slate-800 border-2 border-emerald-500 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-black text-emerald-400 shadow-inner"
            >
              {d}
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 mt-3">
          Memorize or show this code at the government or employer office.
        </p>
      </div>

      {/* Spoken Audio Replay of Receipt */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
        <button
          onClick={onPlayReceiptAudio}
          className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg shadow-md transition-all touch-target-large"
        >
          <Volume2 className="w-6 h-6" />
          <span>Read Code Aloud</span>
        </button>

        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          download={`BolVaani_Application_${receiptCode}.pdf`}
          className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-lg shadow-md transition-all touch-target-large"
        >
          <Download className="w-6 h-6 text-emerald-400" />
          <span>Download PDF</span>
        </a>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 font-semibold">
        <span>Submitted: {new Date(submittedAt || Date.now()).toLocaleTimeString()}</span>
        <button
          onClick={onStartNew}
          className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>New Application</span>
        </button>
      </div>
    </div>
  );
}
