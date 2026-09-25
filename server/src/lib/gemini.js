import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

export const GEMINI_MODEL = 'gemini-2.5-flash';

let genAIClient = null;

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
  try {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY.trim() });
    console.log('✅ Google GenAI SDK initialized with provided GEMINI_API_KEY.');
  } catch (err) {
    console.warn('⚠️ Failed to initialize Google GenAI SDK:', err.message);
  }
} else {
  console.log('ℹ️ No GEMINI_API_KEY provided in .env. Intelligent simulated NLP mode enabled for dev testing.');
}

/**
 * Format a buffer to inlineData for multimodal Gemini requests
 */
export function bufferToGenerativePart(buffer, mimeType = 'audio/webm') {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: mimeType
    }
  };
}

/**
 * Heuristic fallback parser when GEMINI_API_KEY is not set or rate-limited
 */
function simulateTurnExtraction(textOrTranscript, fieldLabel, fieldType, voicePrompt) {
  const cleaned = (textOrTranscript || '').trim();
  
  if (!cleaned) {
    return {
      transcription: "(No audio detected)",
      detected_language: "en-US",
      is_valid_value: false,
      extracted_value: "",
      confidence_score: 0.2,
      user_needs_help: true,
      spoken_response: `I didn't catch that. ${voicePrompt}`,
      next_action: "repeat_question"
    };
  }

  // Handle numbers
  let extracted = cleaned;
  if (fieldType === 'number') {
    const numMatch = cleaned.match(/\d+(\.\d+)?/);
    if (numMatch) {
      extracted = numMatch[0];
    } else {
      const wordsToNum = {
        'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
        'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
        'half': '0.5', 'two and half': '2.5', 'three and half': '3.5'
      };
      for (const [w, n] of Object.entries(wordsToNum)) {
        if (cleaned.toLowerCase().includes(w)) {
          extracted = n;
          break;
        }
      }
    }
  } else if (fieldType === 'phone') {
    const digitsOnly = cleaned.replace(/\D/g, '');
    if (digitsOnly.length >= 10) {
      extracted = digitsOnly.slice(-10);
    }
  } else {
    // Text: remove filler phrases
    extracted = cleaned
      .replace(/^(my name is|i am|i live in|we grow|we have|around|about)\s+/i, '')
      .replace(/[.!?,]$/, '')
      .trim();
  }

  return {
    transcription: cleaned,
    detected_language: "en-US",
    is_valid_value: true,
    extracted_value: extracted || cleaned,
    confidence_score: 0.95,
    user_needs_help: false,
    spoken_response: `Got it. I have noted ${fieldLabel} as ${extracted || cleaned}.`,
    next_action: "advance_field"
  };
}

/**
 * Process a voice or text turn using Gemini 2.5 Flash
 */
export async function executeVoiceTurn({
  audioBuffer,
  mimeType,
  textFallback,
  systemInstruction,
  promptText,
  fieldLabel,
  fieldType,
  voicePrompt
}) {
  if (genAIClient) {
    try {
      const contents = [];
      
      // If audio buffer is provided, attach as multimodal part
      if (audioBuffer && audioBuffer.length > 0) {
        contents.push(bufferToGenerativePart(audioBuffer, mimeType));
      }
      
      // Attach contextual prompt text
      if (textFallback) {
        contents.push(`User speech text: "${textFallback}". \n\n${promptText}`);
      } else {
        contents.push(promptText);
      }

      const response = await genAIClient.models.generateContent({
        model: GEMINI_MODEL,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
        }
      });

      const rawText = response.text || '';
      try {
        const parsed = JSON.parse(rawText);
        return parsed;
      } catch (jsonErr) {
        console.warn('JSON parsing error from Gemini, cleaning output...', jsonErr);
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          return JSON.parse(match[0]);
        }
        throw new Error('Could not parse Gemini JSON response: ' + rawText);
      }
    } catch (apiError) {
      console.error('Gemini API call failed, falling back to simulated extraction:', apiError.message);
    }
  }

  // Dev fallback
  return simulateTurnExtraction(textFallback || 'Voice submission', fieldLabel, fieldType, voicePrompt);
}

/**
 * Generate a spoken review summary using Gemini 2.5 Flash
 */
export async function executeReviewSummary({ formTitle, fieldsAndValues, promptText }) {
  if (genAIClient) {
    try {
      const response = await genAIClient.models.generateContent({
        model: GEMINI_MODEL,
        contents: [promptText],
        config: {
          responseMimeType: 'application/json',
        }
      });

      const rawText = response.text || '';
      return JSON.parse(rawText);
    } catch (err) {
      console.warn('Gemini Review generation error, using fallback template:', err.message);
    }
  }

  // Fallback itemized review
  const itemized = fieldsAndValues.map(fv => ({
    field_label: fv.label,
    spoken_line: `Your ${fv.label} is recorded as ${fv.value}.`
  }));

  const fullScript = `Here is your complete application for ${formTitle}. ` +
    itemized.map(i => i.spoken_line).join(' ') +
    ` If everything is correct, please say 'Yes, submit my application'. If you need to make changes, say 'Change' and the name of the item.`;

  return {
    spoken_script: fullScript,
    itemized_review: itemized,
    confirmation_prompt: "If this is all correct, say: Yes, submit my application."
  };
}
