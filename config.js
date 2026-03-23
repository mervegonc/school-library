// ============================================================
// CONFIGURATION — Fill in your keys before deploying
// ============================================================
const CONFIG = {
  // Google Books API Key
  // Get it from: https://console.cloud.google.com
  // Enable "Books API" then create an API key
  GOOGLE_BOOKS_API_KEY: 'YOUR_GOOGLE_BOOKS_API_KEY',

  // GitHub Personal Access Token
  // Get it from: GitHub → Settings → Developer settings → Fine-grained tokens
  // Permission needed: Contents → Read and Write (for this repo only)
  GITHUB_TOKEN: 'YOUR_GITHUB_TOKEN',

  // Your GitHub username and repo name
  GITHUB_OWNER: 'YOUR_GITHUB_USERNAME',
  GITHUB_REPO: 'school-library',

  // Active data file (changes each school year)
  DATA_FILE: 'data/2025-2026.json',

  // App settings
  MAX_LOANS_PER_STUDENT: 3,
  DEFAULT_LOAN_DAYS: 14,
  SCHOOL_NAME: 'Okul Kütüphanesi',
};
