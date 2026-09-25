import { getSupabase } from '../lib/supabase.js';

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  // If guest or anonymous ID provided in header or cookie
  const guestId = req.headers['x-guest-user-id'] || 'guest-user-0001';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Attach default guest profile
    req.user = {
      id: guestId,
      full_name: 'Guest Applicant',
      is_guest: true
    };
    return next();
  }

  const token = authHeader.split(' ')[1];
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        req.user = { id: guestId, is_guest: true };
      } else {
        req.user = user;
      }
    } catch (e) {
      req.user = { id: guestId, is_guest: true };
    }
  } else {
    req.user = { id: guestId, is_guest: true };
  }

  next();
}
