import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

import categoriesRouter from './routes/categories.js';
import templatesRouter from './routes/templates.js';
import submissionsRouter from './routes/submissions.js';
import voiceRouter from './routes/voice.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Dev permissive
  },
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiting on Voice Processing
const voiceLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
  message: { error: 'Too many voice requests. Please pause for a moment before speaking again.' }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BolVaani / VocalBridge Assistive Voice Backend',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '')
  });
});

// Mount Routes
app.use('/api/categories', categoriesRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/submissions', authMiddleware, submissionsRouter);
app.use('/api/voice', authMiddleware, voiceLimiter, voiceRouter);

// Central Error Handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 BolVaani Assistive Backend running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});
