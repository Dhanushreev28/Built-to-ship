import multer from 'multer';

// Memory storage to process audio buffers directly in-memory
const storage = multer.memoryStorage();

export const uploadAudio = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25 MB max audio size
  },
  fileFilter: (req, file, cb) => {
    // Accept standard audio formats
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream' || file.mimetype === 'video/webm') {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported audio format: ${file.mimetype}`), false);
    }
  }
});
