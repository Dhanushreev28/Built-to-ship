import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  console.error('API Error:', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'Audio file upload error',
      details: err.message
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
}
