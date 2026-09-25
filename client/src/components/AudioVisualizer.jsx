import React from 'react';

export default function AudioVisualizer({ audioLevel = 0, isRecording = false, isSpeaking = false }) {
  // 9 dynamic bars
  const bars = [0.4, 0.7, 0.9, 1.0, 0.8, 1.0, 0.9, 0.7, 0.4];

  if (!isRecording && !isSpeaking) {
    return (
      <div className="flex items-center justify-center gap-1.5 h-8 opacity-40">
        {bars.map((_, i) => (
          <div key={i} className="w-1.5 h-2 bg-slate-400 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5 h-12 py-2">
      {bars.map((mult, i) => {
        // Calculate dynamic height based on audioLevel or simulated voice wave
        let heightPercent = 15;
        if (isRecording) {
          const boost = Math.sin((i / bars.length) * Math.PI) * (audioLevel * 0.9);
          heightPercent = Math.max(15, Math.min(100, Math.round(15 + boost * mult)));
        } else if (isSpeaking) {
          // Subtle rhythmic pulse when assistant is speaking
          const wave = (Math.sin(Date.now() / 150 + i) + 1) * 35;
          heightPercent = Math.max(20, Math.min(90, Math.round(wave * mult)));
        }

        const barColor = isRecording 
          ? 'bg-rose-500 shadow-rose-200' 
          : 'bg-emerald-500 shadow-emerald-200';

        return (
          <div
            key={i}
            className={`w-2 rounded-full transition-all duration-75 shadow-sm ${barColor}`}
            style={{ height: `${heightPercent}%` }}
          />
        );
      })}
    </div>
  );
}
