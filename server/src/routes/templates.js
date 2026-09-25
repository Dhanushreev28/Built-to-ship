import { Router } from 'express';
import { memoryStore, getSupabase } from '../lib/supabase.js';

const router = Router();

// Get all active templates or filter by category
router.get('/', async (req, res, next) => {
  try {
    const { categoryId } = req.query;
    const supabase = getSupabase();

    if (supabase) {
      let query = supabase.from('application_templates').select('*, template_fields(*)').eq('is_active', true);
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return res.json(data);
      }
    }

    // In-memory fallback
    let templates = memoryStore.templates;
    if (categoryId) {
      templates = templates.filter(t => t.category_id === categoryId);
    }
    res.json(templates);
  } catch (err) {
    next(err);
  }
});

// Get single template with ordered fields
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('application_templates')
        .select('*, template_fields(*)')
        .eq('id', id)
        .single();

      if (!error && data) {
        // Sort fields by step_order
        if (data.template_fields) {
          data.fields = data.template_fields.sort((a, b) => a.step_order - b.step_order);
        }
        return res.json(data);
      }
    }

    // In-memory fallback
    const tmpl = memoryStore.templates.find(t => t.id === id || t.template_key === id);
    if (!tmpl) {
      return res.status(404).json({ error: 'Form template not found' });
    }

    res.json(tmpl);
  } catch (err) {
    next(err);
  }
});

export default router;
