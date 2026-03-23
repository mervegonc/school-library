// ============================================================
// CONFIGURATION
// ⚠️  GITHUB_TOKEN buraya YAZMAYIN — sistem ilk kurulumda sorar
// ============================================================
const CONFIG = {
  // Google Books API Key — bu public olabilir, sadece kitap arama için
  GOOGLE_BOOKS_API_KEY: 'AIzaSyCFiNfS-QxgPAMplDiXe2Zi-o_U-p4JLrk',

  // GitHub bilgileri — token YOK, LocalStorage'dan okunur
  GITHUB_OWNER: 'mervegonc',
  GITHUB_REPO:  'school-library',
  DATA_FILE:    'data/2025-2026.json',

  // Token LocalStorage'dan okunur (kullanıcı ilk girişte ayarlardan girer)
  get GITHUB_TOKEN() {
    return localStorage.getItem('gh_token') || '';
  },

  // Uygulama ayarları
  MAX_LOANS_PER_STUDENT: 3,
  DEFAULT_LOAN_DAYS:     14,
  SCHOOL_NAME:           'Okul Kütüphanesi',
};
