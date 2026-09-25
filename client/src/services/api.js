const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Common fetch wrapper with error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Attach guest session ID if stored
  let guestId = localStorage.getItem('bolvaani_guest_id');
  if (!guestId) {
    guestId = 'guest-' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('bolvaani_guest_id', guestId);
  }

  const headers = {
    'x-guest-user-id': guestId,
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errMessage = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errMessage = errJson.error;
    } catch (_) {}
    throw new Error(errMessage);
  }

  return response.json();
}

export const api = {
  // Categories
  getCategories: () => request('/categories'),

  // Templates
  getTemplates: (categoryId) => {
    const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
    return request(`/templates${query}`);
  },
  getTemplateById: (id) => request(`/templates/${id}`),

  // Submissions
  startSubmission: (templateId) => request('/submissions/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ templateId })
  }),

  getSubmission: (id) => request(`/submissions/${id}`),

  confirmField: (submissionId, fieldId, confirmedValue) => request(`/submissions/${submissionId}/confirm-field`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fieldId, confirmedValue })
  }),

  getSubmissionReview: (submissionId) => request(`/submissions/${submissionId}/review`),

  signAndSubmit: (submissionId) => request(`/submissions/${submissionId}/sign-and-submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmed: true })
  }),

  getPdfDownloadUrl: (submissionId) => `${API_BASE_URL}/submissions/${submissionId}/pdf`,

  getAllSubmissions: () => request('/submissions'),

  // Voice Processing
  processVoiceTurn: async (submissionId, fieldId, audioBlob, transcript = '') => {
    const formData = new FormData();
    formData.append('submissionId', submissionId);
    formData.append('fieldId', fieldId);
    if (audioBlob) {
      formData.append('audio', audioBlob, 'recording.webm');
    }
    if (transcript) {
      formData.append('transcript', transcript);
    }

    const guestId = localStorage.getItem('bolvaani_guest_id') || 'guest-user';
    const response = await fetch(`${API_BASE_URL}/voice/process-turn`, {
      method: 'POST',
      headers: {
        'x-guest-user-id': guestId
      },
      body: formData
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Voice turn failed' }));
      throw new Error(err.error || 'Voice turn processing failed');
    }

    return response.json();
  },

  processTextTurn: (submissionId, fieldId, text) => request('/voice/text-turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ submissionId, fieldId, text })
  })
};
