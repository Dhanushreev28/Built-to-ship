import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { memoryStore, getSupabase } from '../lib/supabase.js';
import { StartSubmissionSchema, ConfirmFieldSchema, SignAndSubmitSchema } from '../schemas/validationSchemas.js';
import { executeReviewSummary } from '../lib/gemini.js';
import { buildReviewPrompt } from '../prompts/reviewPrompt.js';
import { generateApplicationPdf } from '../lib/pdfGenerator.js';

const router = Router();

// Helper to generate 4-digit numeric spoken receipt code (e.g. "5290")
function generateSpokenReceiptCode() {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return digits.toString();
}

// 1. Start a new form submission
router.post('/start', async (req, res, next) => {
  try {
    const { templateId } = StartSubmissionSchema.parse(req.body);
    const userId = req.user?.id || 'guest-user-0001';

    // Find template
    const template = memoryStore.templates.find(t => t.id === templateId || t.template_key === templateId);
    if (!template) {
      return res.status(404).json({ error: 'Application template not found' });
    }

    const firstField = template.fields && template.fields.length > 0 ? template.fields[0] : null;
    const submissionId = uuidv4();

    const newSubmission = {
      id: submissionId,
      user_id: userId,
      template_id: template.id,
      template_title: template.title,
      category_id: template.category_id,
      status: 'in_progress',
      current_field_id: firstField ? firstField.id : null,
      receipt_code: null,
      voice_signature_timestamp: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    memoryStore.submissions.set(submissionId, newSubmission);
    memoryStore.submissionFieldValues.set(submissionId, []);

    res.json({
      submissionId,
      template,
      currentField: firstField,
      spokenIntro: template.spoken_intro,
      status: 'in_progress'
    });
  } catch (err) {
    next(err);
  }
});

// 2. Get active submission state
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const submission = memoryStore.submissions.get(id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const template = memoryStore.templates.find(t => t.id === submission.template_id);
    const fieldValues = memoryStore.submissionFieldValues.get(id) || [];

    // Find current active field
    let currentField = null;
    if (template && template.fields) {
      if (submission.current_field_id) {
        currentField = template.fields.find(f => f.id === submission.current_field_id);
      } else {
        // Find first unfilled field
        const filledIds = new Set(fieldValues.map(v => v.field_id));
        currentField = template.fields.find(f => !filledIds.has(f.id)) || null;
      }
    }

    res.json({
      submission,
      template,
      fieldValues,
      currentField,
      isReviewReady: submission.status === 'review_ready' || submission.status === 'submitted'
    });
  } catch (err) {
    next(err);
  }
});

// 3. Confirm or manually override a field value
router.post('/:id/confirm-field', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fieldId, confirmedValue } = ConfirmFieldSchema.parse(req.body);

    const submission = memoryStore.submissions.get(id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const template = memoryStore.templates.find(t => t.id === submission.template_id);
    let values = memoryStore.submissionFieldValues.get(id) || [];

    // Update or insert field value
    const existingIndex = values.findIndex(v => v.field_id === fieldId);
    const updatedRecord = {
      id: uuidv4(),
      submission_id: id,
      field_id: fieldId,
      extracted_value: confirmedValue,
      confidence_score: 1.0,
      is_confirmed_by_user: true,
      updated_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      values[existingIndex] = { ...values[existingIndex], ...updatedRecord };
    } else {
      values.push(updatedRecord);
    }
    memoryStore.submissionFieldValues.set(id, values);

    // Determine next field
    let nextField = null;
    let isReviewReady = false;
    if (template && template.fields) {
      const currentIndex = template.fields.findIndex(f => f.id === fieldId);
      if (currentIndex >= 0 && currentIndex < template.fields.length - 1) {
        nextField = template.fields[currentIndex + 1];
        submission.current_field_id = nextField.id;
      } else {
        isReviewReady = true;
        submission.status = 'review_ready';
        submission.current_field_id = null;
      }
    }

    res.json({
      success: true,
      fieldValues: values,
      nextField,
      isReviewReady
    });
  } catch (err) {
    next(err);
  }
});

// 4. Get Review Summary with AI Spoken Script
router.get('/:id/review', async (req, res, next) => {
  try {
    const { id } = req.params;
    const submission = memoryStore.submissions.get(id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const template = memoryStore.templates.find(t => t.id === submission.template_id);
    const rawValues = memoryStore.submissionFieldValues.get(id) || [];

    // Map labels to values
    const fieldsWithValues = (template?.fields || []).map(f => {
      const match = rawValues.find(v => v.field_id === f.id);
      return {
        field_id: f.id,
        label: f.label,
        icon_name: f.icon_name,
        value: match ? match.extracted_value : 'Not provided'
      };
    });

    const promptText = buildReviewPrompt({
      formTitle: template.title,
      fieldsAndValues: fieldsWithValues
    });

    const reviewAiResult = await executeReviewSummary({
      formTitle: template.title,
      fieldsAndValues: fieldsWithValues,
      promptText
    });

    res.json({
      submission,
      template,
      fieldsWithValues,
      spokenSummary: reviewAiResult.spoken_script,
      itemizedReview: reviewAiResult.itemized_review,
      confirmationPrompt: reviewAiResult.confirmation_prompt
    });
  } catch (err) {
    next(err);
  }
});

// 5. Sign and Submit application with voice signature
router.post('/:id/sign-and-submit', async (req, res, next) => {
  try {
    const { id } = req.params;
    SignAndSubmitSchema.parse(req.body);

    const submission = memoryStore.submissions.get(id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const template = memoryStore.templates.find(t => t.id === submission.template_id);
    const receiptCode = generateSpokenReceiptCode();
    const submissionTime = new Date().toISOString();

    submission.status = 'submitted';
    submission.receipt_code = receiptCode;
    submission.voice_signature_timestamp = submissionTime;
    submission.updated_at = submissionTime;

    // Format spoken receipt text
    const digitsSpoken = receiptCode.split('').join(' ');
    const spokenReceiptText = `Congratulations! Your application for ${template.title} has been officially submitted. Your four-digit reference number is: ${digitsSpoken}. You can visit any local office with this number.`;

    res.json({
      success: true,
      submissionId: id,
      receiptCode,
      spokenReceiptText,
      submittedAt: submissionTime,
      pdfDownloadUrl: `/api/submissions/${id}/pdf`
    });
  } catch (err) {
    next(err);
  }
});

// 6. Generate and stream official PDF receipt
router.get('/:id/pdf', async (req, res, next) => {
  try {
    const { id } = req.params;
    const submission = memoryStore.submissions.get(id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const template = memoryStore.templates.find(t => t.id === submission.template_id);
    const category = memoryStore.categories.find(c => c.id === template?.category_id);
    const rawValues = memoryStore.submissionFieldValues.get(id) || [];

    const fieldValues = (template?.fields || []).map(f => {
      const match = rawValues.find(v => v.field_id === f.id);
      return {
        label: f.label,
        value: match ? match.extracted_value : 'N/A',
        confirmedAt: match ? match.updated_at : null
      };
    });

    const pdfBuffer = await generateApplicationPdf({
      submissionId: id,
      receiptCode: submission.receipt_code || 'PENDING',
      formTitle: template?.title || 'Public Application',
      categoryTitle: category?.title || 'Welfare Scheme',
      fieldValues,
      submittedAt: submission.voice_signature_timestamp || submission.created_at
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="BolVaani_Application_${submission.receipt_code || id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

// 7. List all submissions (Admin / Supervisor view)
router.get('/', async (req, res, next) => {
  try {
    const all = Array.from(memoryStore.submissions.values()).map(sub => {
      const template = memoryStore.templates.find(t => t.id === sub.template_id);
      const values = memoryStore.submissionFieldValues.get(sub.id) || [];
      return {
        ...sub,
        template_title: template?.title,
        fields_filled: values.length,
        total_fields: template?.fields?.length || 0
      };
    });
    res.json(all);
  } catch (err) {
    next(err);
  }
});

export default router;
