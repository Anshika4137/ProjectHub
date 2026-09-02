const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, '');

// VITE_API_URL is set in Vercel; the fallback keeps the existing local workflow working.
export const API_URL = configuredApiUrl || 'http://localhost:5000';
