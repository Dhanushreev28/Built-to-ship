import { Router } from 'express';
import { memoryStore, getSupabase } from '../lib/supabase.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return res.json(data);
      }
    }

    // In-memory fallback
    res.json(memoryStore.categories);
  } catch (err) {
    next(err);
  }
});

export default router;
