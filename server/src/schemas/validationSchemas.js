import { z } from 'zod';

export const StartSubmissionSchema = z.object({
  templateId: z.string().min(1, "Template ID is required")
});

export const ProcessVoiceTurnSchema = z.object({
  submissionId: z.string().min(1, "Submission ID is required"),
  fieldId: z.string().min(1, "Field ID is required")
});

export const TextTurnSchema = z.object({
  submissionId: z.string().min(1, "Submission ID is required"),
  fieldId: z.string().min(1, "Field ID is required"),
  text: z.string().min(1, "Spoken text is required")
});

export const ConfirmFieldSchema = z.object({
  fieldId: z.string().min(1, "Field ID is required"),
  confirmedValue: z.string().min(1, "Value cannot be empty")
});

export const SignAndSubmitSchema = z.object({
  confirmed: z.boolean().refine(val => val === true, {
    message: "Must provide voice confirmation to sign and submit"
  })
});

export const TtsRequestSchema = z.object({
  text: z.string().min(1, "Text is required for TTS synthesis"),
  voiceType: z.string().optional()
});

export const ExtractedTurnOutputSchema = z.object({
  transcription: z.string(),
  detected_language: z.string().default('en-US'),
  is_valid_value: z.boolean(),
  extracted_value: z.string(),
  confidence_score: z.number().min(0).max(1),
  user_needs_help: z.boolean().default(false),
  spoken_response: z.string().min(1),
  next_action: z.enum(['advance_field', 'repeat_question', 'ask_clarification', 'complete_form'])
});
