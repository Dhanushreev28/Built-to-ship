import { useState, useEffect, useCallback, useRef } from 'react';

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const utteranceRef = useRef(null);

  // Stop any active speech
  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setCurrentText('');
  }, []);

  // Speak text aloud
  const speak = useCallback((text, onEndCallback) => {
    if (!text || isMuted || !synthRef.current) {
      if (onEndCallback) onEndCallback();
      return;
    }

    // Cancel prior speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92; // Slightly slower, calm cadence for non-literate/elder users
    utterance.pitch = 1.05; // Slightly warmer tone
    utterance.lang = 'en-US';

    // Select natural voice if available
    const voices = synthRef.current.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentText(text);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentText('');
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setIsPlaying(false);
      setCurrentText('');
      if (onEndCallback) onEndCallback();
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [isMuted]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const toggleMute = () => {
    if (!isMuted && isPlaying) {
      stop();
    }
    setIsMuted(prev => !prev);
  };

  return {
    isPlaying,
    currentText,
    isMuted,
    speak,
    stop,
    toggleMute
  };
}
