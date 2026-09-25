import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100 for visualizer
  const [interimTranscript, setInterimTranscript] = useState('');
  const [permissionError, setPermissionError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize SpeechRecognition if available in browser
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInterimTranscript(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition browser event:', event.error);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Update volume analyser loop
  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Compute average level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    // Normalize to 0 - 100
    const normalized = Math.min(100, Math.round((average / 128) * 100));
    setAudioLevel(normalized);

    animFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setPermissionError(null);
      setInterimTranscript('');
      audioChunksRef.current = [];

      // Request microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Set up AudioContext for reactive visualizer
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      // Determine mimeType supported by browser
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = ''; // Let browser pick default
        }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(100); // 100ms timeslices
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      // Start level animation
      updateAudioLevel();

      // Start speech recognition if present
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (_) {}
      }

      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch (err) {
      console.error('Microphone access denied:', err);
      setPermissionError('Microphone access was denied. Please allow microphone permissions to speak.');
      setIsRecording(false);
    }
  }, [updateAudioLevel]);

  // Stop recording and return Blob + transcript
  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        setIsRecording(false);
        resolve({ audioBlob: null, transcript: interimTranscript });
        return;
      }

      // Stop recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }

      // Cancel visualizer animation
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      setAudioLevel(0);

      // Close audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        
        // Stop audio tracks
        if (mediaRecorderRef.current?.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }

        setIsRecording(false);
        resolve({
          audioBlob: blob,
          transcript: interimTranscript.trim()
        });
      };

      mediaRecorderRef.current.stop();

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(40);
      }
    });
  }, [interimTranscript]);

  return {
    isRecording,
    audioLevel,
    interimTranscript,
    permissionError,
    startRecording,
    stopRecording
  };
}
