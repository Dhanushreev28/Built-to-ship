import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import VoiceMicButton from '../components/VoiceMicButton';
import SpokenFieldCard from '../components/SpokenFieldCard';
import ProgressStepBar from '../components/ProgressStepBar';

export default function AssistantWorkspacePage({ speak, stop, isPlaying, currentSpeakingText }) {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [template, setTemplate] = useState(null);
  const [currentField, setCurrentField] = useState(null);
  const [fieldValues, setFieldValues] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Audio Recorder Hook
  const {
    isRecording,
    audioLevel,
    interimTranscript,
    permissionError,
    startRecording,
    stopRecording
  } = useAudioRecorder();

  // Initialize submission session
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        setLoading(true);
        const data = await api.startSubmission(templateId);
        
        if (!isMounted) return;
        setSubmission({ id: data.submissionId });
        setTemplate(data.template);
        setCurrentField(data.currentField);

        const initialSpeech = `${data.spokenIntro} First question: ${data.currentField?.voice_prompt || ''}`;
        setAssistantMessage(initialSpeech);

        // Speak introduction aloud
        speak(initialSpeech);
      } catch (err) {
        console.error('Failed to initialize session:', err);
        setErrorMessage(err.message || 'Could not start voice session');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initSession();

    return () => {
      isMounted = false;
      stop();
    };
  }, [templateId, speak, stop]);

  // Handle Voice Submission turn
  const handleStopRecordingAndProcess = async () => {
    const { audioBlob, transcript } = await stopRecording();
    if (!submission?.id || !currentField?.id) return;

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const result = await api.processVoiceTurn(
        submission.id,
        currentField.id,
        audioBlob,
        transcript
      );

      // Update state
      setFieldValues(result.fieldValues || []);
      setAssistantMessage(result.aiSpeechText);

      // Play AI spoken response aloud
      speak(result.aiSpeechText, () => {
        // If all fields completed, navigate to review
        if (result.isReviewReady) {
          navigate(`/review/${submission.id}`);
        }
      });

      // Advance field if valid
      if (result.nextField) {
        setCurrentField(result.nextField);
      } else if (result.isReviewReady) {
        navigate(`/review/${submission.id}`);
      }
    } catch (err) {
      console.error('Turn processing error:', err);
      const fallbackSpeech = "I had a little trouble understanding. Please tap the green microphone and speak again.";
      setAssistantMessage(fallbackSpeech);
      speak(fallbackSpeech);
    } finally {
      setIsProcessing(false);
    }
  };

  // Replay question audio
  const handleReplayAudio = useCallback((text) => {
    speak(text);
  }, [speak]);

  // Manual fallback field edit
  const handleManualEditSubmit = async (fieldId, confirmedValue) => {
    if (!submission?.id) return;
    try {
      const result = await api.confirmField(submission.id, fieldId, confirmedValue);
      setFieldValues(result.fieldValues || []);
      if (result.nextField) {
        setCurrentField(result.nextField);
        const nextSpeech = `Saved ${confirmedValue}. Next: ${result.nextField.voice_prompt}`;
        setAssistantMessage(nextSpeech);
        speak(nextSpeech);
      } else if (result.isReviewReady) {
        navigate(`/review/${submission.id}`);
      }
    } catch (err) {
      console.error('Error confirming field:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-14 h-14 text-emerald-600 animate-spin" />
        <p className="text-xl font-black text-slate-800">Preparing Your Voice Assistant...</p>
      </div>
    );
  }

  const completedIds = fieldValues.map(v => v.field_id);
  const currentVal = fieldValues.find(v => v.field_id === currentField?.id)?.extracted_value || '';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 font-extrabold text-slate-700 bg-white hover:bg-slate-100 px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm touch-target-large"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Exit Form</span>
        </button>

        <span className="text-sm sm:text-base font-extrabold text-emerald-800 bg-emerald-100 px-4 py-1.5 rounded-full">
          {template?.title}
        </span>
      </div>

      {/* Pictorial Progress Milestones */}
      <ProgressStepBar
        fields={template?.fields || []}
        currentFieldId={currentField?.id}
        completedFieldIds={completedIds}
        onStepClick={(f) => {
          setCurrentField(f);
          speak(f.voice_prompt);
        }}
      />

      {/* Active AI Conversational Bubble */}
      {assistantMessage && (
        <div className="bg-emerald-700 text-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-emerald-600 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-inner">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-200">
              BolVaani Assistant
            </span>
            <p className="text-lg sm:text-xl font-bold leading-relaxed mt-1">
              "{assistantMessage}"
            </p>
          </div>
        </div>
      )}

      {/* Permission or Connection Alert */}
      {permissionError && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-4 flex items-center gap-3 text-rose-800 font-bold">
          <AlertCircle className="w-6 h-6 flex-shrink-0 text-rose-600" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Active Field Question Card */}
      {currentField && (
        <SpokenFieldCard
          field={currentField}
          currentValue={currentVal}
          isActive={true}
          isAudioPlaying={isPlaying}
          onReplayAudio={handleReplayAudio}
          onManualEditSubmit={handleManualEditSubmit}
        />
      )}

      {/* Live Interim Transcript Display */}
      {interimTranscript && isRecording && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 text-center font-bold text-lg animate-pulse">
          <span className="text-xs text-emerald-400 block mb-1">Live Speech Recognition:</span>
          "{interimTranscript}"
        </div>
      )}

      {/* Centerpiece Voice Microphone Control */}
      <div className="pt-4 pb-8 flex flex-col items-center justify-center">
        <VoiceMicButton
          isRecording={isRecording}
          isProcessing={isProcessing}
          isSpeaking={isPlaying}
          audioLevel={audioLevel}
          onStartRecord={startRecording}
          onStopRecord={handleStopRecordingAndProcess}
          onInterruptSpeech={stop}
        />
      </div>

      {/* Completed Fields Overview */}
      {fieldValues.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider">
            Confirmed Answers ({fieldValues.length}/{template?.fields?.length || 0})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fieldValues.map((v) => {
              const f = template?.fields?.find(tf => tf.id === v.field_id);
              return (
                <div key={v.field_id} className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500">{f?.label || 'Field'}</span>
                    <p className="text-base font-extrabold text-slate-900">{v.extracted_value}</p>
                  </div>
                  <button
                    onClick={() => speak(`Your ${f?.label} is recorded as ${v.extracted_value}`)}
                    className="p-2 rounded-xl text-emerald-700 hover:bg-emerald-100"
                  >
                    🔊
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
