export function buildReviewPrompt({ formTitle, fieldsAndValues }) {
  return `You are BolVaani, reading back a completed official application for a low-literacy applicant.
Form Title: ${formTitle}
Completed Fields:
${JSON.stringify(fieldsAndValues, null, 2)}

Instructions:
1. Write a clear, calm, rhythmic spoken script where you read each item line by line.
2. In "itemized_review", break down each field with a spoken sentence suitable for TTS playback. For example: "Your name is recorded as Ramesh Kumar." or "Your total cultivated land is recorded as three acres."
3. In "confirmation_prompt", provide a short closing instruction asking the user to say "Yes, submit" to seal the application, or "Change" to correct an answer.
4. Output STRICT JSON only.`;
}

export const REVIEW_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    spoken_script: { type: "STRING", description: "Complete voice review script to read aloud" },
    itemized_review: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          field_label: { type: "STRING" },
          spoken_line: { type: "STRING", description: "Spoken sentence for this specific item" }
        },
        required: ["field_label", "spoken_line"]
      }
    },
    confirmation_prompt: { type: "STRING", description: "e.g., 'If this is all correct, say: Yes, submit my application.'" }
  },
  required: ["spoken_script", "itemized_review", "confirmation_prompt"]
};
