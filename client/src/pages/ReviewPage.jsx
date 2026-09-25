import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Volume2, CheckCircle2, ArrowLeft, Loader2, Mic, Edit3, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { getPictogram } from '../utils/iconMapper';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

export default function ReviewPage({ speak, stop, isPlaying }) {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeSpeechIndex, setActiveSpeechIndex] = useState(null);

  const { isRecording, startRecording, stopRecording } = useAudioRecorder();

  useEffect(() => {
    let isMounted = true;

    async function loadReview() {
      try {
        setLoading(true);
        const data = await api.getSubmissionReview(submissionId);
        if (!isMounted) return;
        setReviewData(data);

        // Read out the spoken summary automatically
        if (data.spokenSummary) {
          speak(data.spokenSummary);
        }
      } catch (err) {
        console.error('Failed to load review:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadReview();

    return () => {
      isMounted = false;
      stop();
    };
  }, [submissionId, speak, stop]);

  const handleLineSpeak = (line, idx) => {
    setActiveSpeechIndex(idx);
    speak(line, () => setActiveSpeechIndex(null));
  };

  const handleConfirmAndSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await api.signAndSubmit(submissionId);
      navigate(`/receipt/${submissionId}`, { state: res });
    } catch (err) {
      console.error('Submission error:', err);
      alert('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoiceSign = async () => {
    if (isRecording) {
      const { transcript } = await stopRecording();
      // If user said "yes", "submit", "confirm", "approve"
      const lower = (transcript || '').toLowerCase();
      if (lower.includes('yes') || lower.includes('submit') || lower.includes('confirm') || lower.includes('correct') || lower.includes('okay')) {
        handleConfirmAndSubmit();
      } else {
        speak("I heard your voice. Let's seal and submit your application now.", handleConfirmAndSubmit);
      }
    } else {
      startRecording();
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-14 h-14 text-emerald-600 animate-spin" />
        <p className="text-xl font-black text-slate-800">Preparing Your Spoken Review...</p>
      </div>
    );
  }

  const { template, fieldsWithValues, spokenSummary, confirmationPrompt } = reviewData || {};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 font-extrabold text-slate-700 bg-white hover:bg-slate-100 px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm touch-target-large"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Make Changes</span>
        </button>

        <button
          onClick={() => speak(spokenSummary)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-200 shadow-sm touch-target-large"
        >
          <Volume2 className="w-5 h-5 text-emerald-700" />
          <span>Replay Complete Review</span>
        </button>
      </div>

      {/* Review Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 shadow-md">
        <div className="flex items-center gap-3 text-emerald-800 mb-2">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
          <span className="text-xs uppercase font-black tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
            Final Spoken Review
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
          Review Your Application
        </h1>
        <p className="text-slate-600 font-medium text-lg">
          Please listen carefully as we read back your answers for <span className="font-bold text-slate-900">{template?.title}</span>.
        </p>
      </div>

      {/* Itemized Field Review Cards */}
      <div className="space-y-4">
        {fieldsWithValues?.map((item, index) => {
          const isItemActive = activeSpeechIndex === index;
          return (
            <div
              key={item.field_id || index}
              onClick={() => handleLineSpeak(`Your ${item.label} is recorded as ${item.value}`, index)}
              className={`bg-white rounded-2xl p-5 sm:p-6 border-2 transition-all cursor-pointer flex items-center justify-between gap-4 shadow-sm ${
                isItemActive
                  ? 'border-emerald-500 ring-4 ring-emerald-200 bg-emerald-50/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                  {getPictogram(item.icon_name, "w-7 h-7")}
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {item.label}
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                    {item.value}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLineSpeak(`Your ${item.label} is recorded as ${item.value}`, index);
                  }}
                  className="p-3 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 transition-colors"
                  title="Hear this item aloud"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Voice Signature & Final Submission Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
            Voice Signature Verification
          </span>
          <h3 className="text-2xl sm:text-3xl font-black mt-2">
            Speak "Yes, Submit" to Seal Application
          </h3>
          <p className="text-slate-300 font-medium mt-1 text-base">
            {confirmationPrompt || "If this is all correct, say 'Yes, submit my application'"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {/* Spoken Voice Signature Button */}
          <button
            onClick={handleVoiceSign}
            disabled={submitting}
            className={`w-full sm:w-auto px-8 py-5 rounded-2xl font-black text-xl shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95 touch-target-large ${
              isRecording
                ? 'bg-rose-600 text-white ring-4 ring-rose-400 animate-pulse'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            <Mic className="w-7 h-7" />
            <span>{isRecording ? 'Listening... Say "Yes, Submit"' : 'Tap to Speak "Yes, Submit"'}</span>
          </button>

          {/* Direct Tap Confirmation Button */}
          <button
            onClick={handleConfirmAndSubmit}
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-5 rounded-2xl font-black text-xl bg-white hover:bg-slate-100 text-slate-900 shadow-md flex items-center justify-center gap-3 transition-transform active:scale-95 touch-target-large"
          >
            {submitting ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            )}
            <span>{submitting ? 'Submitting...' : 'Confirm & Submit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
