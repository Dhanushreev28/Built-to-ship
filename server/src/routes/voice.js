import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { uploadAudio } from '../middleware/upload.js';
import { ProcessVoiceTurnSchema, TextTurnSchema, TtsRequestSchema } from '../schemas/validationSchemas.js';
import { memoryStore } from '../lib/supabase.js';
import { executeVoiceTurn } from '../lib/gemini.js';
import { VOICE_SYSTEM_INSTRUCTION, buildVoiceTurnPrompt } from '../prompts/voiceTurnPrompt.js';

const router = Router();

/**
 * 1. Process Voice Turn (Uploads user audio and runs extraction)
 */
router.post('/process-turn', uploadAudio.single('audio'), async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { submissionId, fieldId } = req.body;
    
    if (!submissionId || !fieldId) {
      return res.status(400).json({ error: 'submissionId and fieldId are required' });
    }

    const submission = memoryStore.submissions.get(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Active submission session not found' });
    }

    const template = memoryStore.templates.find(t => t.id === submission.template_id);
    const targetField = template?.fields?.find(f => f.id === fieldId);
    if (!targetField) {
      return res.status(404).json({ error: 'Target field not found on template' });
    }

    const audioFile = req.file;
    const clientFallbackTranscript = req.body.transcript || '';

    // Gather previous confirmed fields for conversational context
    const existingValues = memoryStore.submissionFieldValues.get(submissionId) || [];
    const previousContext = {};
    for (const val of existingValues) {
      const f = template.fields.find(tf => tf.id === val.field_id);
      if (f) previousContext[f.label] = val.extracted_value;
    }

    const promptText = buildVoiceTurnPrompt({
      formTitle: template.title,
      fieldLabel: targetField.label,
      fieldType: targetField.field_type,
      voicePrompt: targetField.voice_prompt,
      previousFields: previousContext
    });

    const aiResult = await executeVoiceTurn({
      audioBuffer: audioFile ? audioFile.buffer : null,
      mimeType: audioFile ? audioFile.mimetype : 'audio/webm',
      textFallback: clientFallbackTranscript,
      systemInstruction: VOICE_SYSTEM_INSTRUCTION,
      promptText,
      fieldLabel: targetField.label,
      fieldType: targetField.field_type,
      voicePrompt: targetField.voice_prompt
    });

    let nextField = null;
    let isReviewReady = false;

    // If valid extracted value, store it
    if (aiResult.is_valid_value && aiResult.extracted_value) {
      const updatedValues = memoryStore.submissionFieldValues.get(submissionId) || [];
      const existingIdx = updatedValues.findIndex(v => v.field_id === fieldId);
      
      const record = {
        id: uuidv4(),
        submission_id: submissionId,
        field_id: fieldId,
        raw_audio_url: null,
        transcription: aiResult.transcription,
        extracted_value: aiResult.extracted_value,
        confidence_score: aiResult.confidence_score,
        is_confirmed_by_user: true,
        updated_at: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        updatedValues[existingIdx] = record;
      } else {
        updatedValues.push(record);
      }
      memoryStore.submissionFieldValues.set(submissionId, updatedValues);

      // Advance to next field
      const currentIdx = template.fields.findIndex(f => f.id === fieldId);
      if (currentIdx >= 0 && currentIdx < template.fields.length - 1) {
        nextField = template.fields[currentIdx + 1];
        submission.current_field_id = nextField.id;
        // Append next question to spoken response
        aiResult.spoken_response = `${aiResult.spoken_response} Next: ${nextField.voice_prompt}`;
      } else {
        isReviewReady = true;
        submission.status = 'review_ready';
        submission.current_field_id = null;
        aiResult.spoken_response = `${aiResult.spoken_response} We have answered all questions! Let us review your complete application together.`;
      }
    }

    // Log the voice turn
    const turnNumber = (memoryStore.voiceLogs.filter(l => l.submission_id === submissionId).length || 0) + 1;
    memoryStore.voiceLogs.push({
      id: uuidv4(),
      submission_id: submissionId,
      turn_number: turnNumber,
      user_transcript: aiResult.transcription,
      ai_response_text: aiResult.spoken_response,
      intent_detected: aiResult.next_action,
      latency_ms: Date.now() - startTime,
      created_at: new Date().toISOString()
    });

    res.json({
      transcription: aiResult.transcription,
      extractedValue: aiResult.extracted_value,
      isValidValue: aiResult.is_valid_value,
      confidenceScore: aiResult.confidence_score,
      userNeedsHelp: aiResult.user_needs_help,
      aiSpeechText: aiResult.spoken_response,
      nextField,
      isReviewReady,
      fieldValues: memoryStore.submissionFieldValues.get(submissionId) || []
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 2. Process Text Turn (Fallback / Assisted input)
 */
router.post('/text-turn', async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { submissionId, fieldId, text } = TextTurnSchema.parse(req.body);

    const submission = memoryStore.submissions.get(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Active submission session not found' });
    }

    const template = memoryStore.templates.find(t => t.id === submission.template_id);
    const targetField = template?.fields?.find(f => f.id === fieldId);
    if (!targetField) {
      return res.status(404).json({ error: 'Target field not found' });
    }

    const promptText = buildVoiceTurnPrompt({
      formTitle: template.title,
      fieldLabel: targetField.label,
      fieldType: targetField.field_type,
      voicePrompt: targetField.voice_prompt,
      previousFields: {}
    });

    const aiResult = await executeVoiceTurn({
      audioBuffer: null,
      mimeType: null,
      textFallback: text,
      systemInstruction: VOICE_SYSTEM_INSTRUCTION,
      promptText,
      fieldLabel: targetField.label,
      fieldType: targetField.field_type,
      voicePrompt: targetField.voice_prompt
    });

    let nextField = null;
    let isReviewReady = false;

    if (aiResult.is_valid_value && aiResult.extracted_value) {
      const updatedValues = memoryStore.submissionFieldValues.get(submissionId) || [];
      const existingIdx = updatedValues.findIndex(v => v.field_id === fieldId);
      
      const record = {
        id: uuidv4(),
        submission_id: submissionId,
        field_id: fieldId,
        raw_audio_url: null,
        transcription: text,
        extracted_value: aiResult.extracted_value,
        confidence_score: aiResult.confidence_score,
        is_confirmed_by_user: true,
        updated_at: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        updatedValues[existingIdx] = record;
      } else {
        updatedValues.push(record);
      }
      memoryStore.submissionFieldValues.set(submissionId, updatedValues);

      const currentIdx = template.fields.findIndex(f => f.id === fieldId);
      if (currentIdx >= 0 && currentIdx < template.fields.length - 1) {
        nextField = template.fields[currentIdx + 1];
        submission.current_field_id = nextField.id;
        aiResult.spoken_response = `${aiResult.spoken_response} Next: ${nextField.voice_prompt}`;
      } else {
        isReviewReady = true;
        submission.status = 'review_ready';
        submission.current_field_id = null;
        aiResult.spoken_response = `${aiResult.spoken_response} We have answered all questions! Let us review your complete application together.`;
      }
    }

    res.json({
      transcription: text,
      extractedValue: aiResult.extracted_value,
      isValidValue: aiResult.is_valid_value,
      confidenceScore: aiResult.confidence_score,
      aiSpeechText: aiResult.spoken_response,
      nextField,
      isReviewReady,
      fieldValues: memoryStore.submissionFieldValues.get(submissionId) || []
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 3. Text to Speech endpoint metadata
 */
router.post('/tts', async (req, res, next) => {
  try {
    const { text } = TtsRequestSchema.parse(req.body);
    // Return speech metadata; Web Speech API handles client-side speech directly with high speed and zero latency
    res.json({
      text,
      language: 'en-US',
      rate: 0.9,
      pitch: 1.0
    });
  } catch (err) {
    next(err);
  }
});

export default router;
