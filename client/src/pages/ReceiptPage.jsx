import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import VoiceReceiptCard from '../components/VoiceReceiptCard';
import { Loader2 } from 'lucide-react';

export default function ReceiptPage({ speak, stop }) {
  const { submissionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [receipt, setReceipt] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);

  useEffect(() => {
    // Fire festive celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (_) {}

    async function loadReceipt() {
      if (location.state && location.state.receiptCode) {
        setReceipt(location.state);
        speak(location.state.spokenReceiptText);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await api.getSubmission(submissionId);
        const receiptPayload = {
          submissionId: data.submission.id,
          receiptCode: data.submission.receipt_code,
          formTitle: data.template.title,
          submittedAt: data.submission.updated_at,
          pdfDownloadUrl: api.getPdfDownloadUrl(data.submission.id),
          spokenReceiptText: `Your application has been successfully submitted! Your four digit reference code is: ${(data.submission.receipt_code || '').split('').join(' ')}.`
        };
        setReceipt(receiptPayload);
        speak(receiptPayload.spokenReceiptText);
      } catch (err) {
        console.error('Failed to load receipt:', err);
      } finally {
        setLoading(false);
      }
    }

    loadReceipt();

    return () => stop();
  }, [submissionId, location.state, speak, stop]);

  const handlePlayReceiptAudio = () => {
    if (receipt?.spokenReceiptText) {
      speak(receipt.spokenReceiptText);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-14 h-14 text-emerald-600 animate-spin" />
        <p className="text-xl font-black text-slate-800">Generating Your Official Voice Receipt...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
      <VoiceReceiptCard
        receiptCode={receipt?.receiptCode}
        submissionId={submissionId}
        formTitle={receipt?.formTitle || 'Welfare Application'}
        submittedAt={receipt?.submittedAt}
        pdfUrl={receipt?.pdfDownloadUrl || api.getPdfDownloadUrl(submissionId)}
        onPlayReceiptAudio={handlePlayReceiptAudio}
        onStartNew={() => navigate('/')}
      />
    </div>
  );
}
