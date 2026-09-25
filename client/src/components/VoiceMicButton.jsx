import React from 'react';
import { Mic, Loader2, Volume2, Square } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

export default function VoiceMicButton({
  isRecording = false,
  isProcessing = false,
  isSpeaking = false,
  audioLevel = 0,
  onStartRecord,
  onStopRecord,
  onInterruptSpeech,
  disabled = false
}) {
  // Determine state
  let state = 'idle';
  if (isSpeaking) state = 'speaking';
  else if (isProcessing) state = 'processing';
  else if (isRecording) state = 'listening';

  const handleClick = () => {
    if (disabled) return;

    if (state === 'speaking') {
      if (onInterruptSpeech) onInterruptSpeech();
      return;
    }

    if (state === 'listening') {
      if (onStopRecord) onStopRecord();
    } else if (state === 'idle') {
      if (onStartRecord) onStartRecord();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Visualizer bars above microphone */}
      <div className="h-12 flex items-center justify-center">
        <AudioVisualizer
          audioLevel={audioLevel}
          isRecording={isRecording}
          isSpeaking={isSpeaking}
        />
      </div>

      {/* Interactive Microphone Button with Multi-Ring Ripple */}
      <div className="relative flex items-center justify-center">
        {/* Ripple rings when listening */}
        {state === 'listening' && (
          <>
            <div className="absolute w-28 h-28 rounded-full bg-rose-400 opacity-60 animate-ping" />
            <div className="absolute w-36 h-36 rounded-full bg-rose-300 opacity-30 animate-pulse" />
          </>
        )}

        {/* Pulse rings when speaking */}
        {state === 'speaking' && (
          <div className="absolute w-32 h-32 rounded-full bg-emerald-400 opacity-40 animate-pulse" />
        )}

        {/* Main circular button */}
        <button
          onClick={handleClick}
          disabled={disabled || state === 'processing'}
          aria-label={
            state === 'listening'
              ? 'Stop recording and submit speech'
              : state === 'speaking'
              ? 'Interrupt and speak now'
              : state === 'processing'
              ? 'Understanding speech...'
              : 'Tap to speak your answer'
          }
          className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-200 transform active:scale-95 touch-target-large focus:outline-none focus:ring-4 focus:ring-offset-2 ${
            state === 'listening'
              ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-300 scale-105'
              : state === 'speaking'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-300'
              : state === 'processing'
              ? 'bg-amber-500 text-white cursor-wait'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white ring-4 ring-emerald-200 hover:scale-105'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {state === 'processing' ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : state === 'listening' ? (
            <Square className="w-10 h-10 fill-current animate-pulse" />
          ) : state === 'speaking' ? (
            <Volume2 className="w-10 h-10 animate-bounce" />
          ) : (
            <Mic className="w-11 h-11" />
          )}
        </button>
      </div>

      {/* Prominent Action Label below button */}
      <div className="text-center">
        {state === 'listening' ? (
          <div className="bg-rose-100 text-rose-800 font-bold px-4 py-1.5 rounded-full text-base sm:text-lg flex items-center gap-2 border border-rose-200 shadow-sm animate-pulse">
            <span className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping" />
            <span>Listening... Tap when finished speaking</span>
          </div>
        ) : state === 'processing' ? (
          <div className="bg-amber-100 text-amber-800 font-bold px-4 py-1.5 rounded-full text-base sm:text-lg border border-amber-200 shadow-sm">
            <span>Understanding your answer...</span>
          </div>
        ) : state === 'speaking' ? (
          <button
            onClick={onInterruptSpeech}
            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-4 py-1.5 rounded-full text-base sm:text-lg border border-emerald-300 shadow-sm flex items-center gap-2"
          >
            <Volume2 className="w-5 h-5 text-emerald-700" />
            <span>Assistant Speaking (Tap to Answer)</span>
          </button>
        ) : (
          <div className="bg-emerald-50 text-emerald-900 font-bold px-5 py-2 rounded-full text-lg sm:text-xl border-2 border-emerald-500 shadow-md">
            <span>Tap Green Button & Speak</span>
          </div>
        )}
      </div>
    </div>
  );
}
