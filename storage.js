// ============================================================
// STORAGE — GitHub JSON sync with LocalStorage buffer
// ============================================================
const Storage = (() => {
  const LS_KEY = 'kutuphane_data';
  const LS_PENDING = 'kutuphane_pending';
  let _data = null;
  let _syncTimer = null;

  // Load data: try LocalStorage first (fastest), then GitHub
  async function load() {
    const local = localStorage.getItem(LS_KEY);
    if (local) {
      try { _data = JSON.parse(local); } catch(e) { _data = null; }
    }
    try {
      const gh = await fetchFromGitHub();
      if (gh) {
        _data = gh;
        localStorage.setItem(LS_KEY, JSON.stringify(_data));
      }
    } catch(e) {
      console.warn('GitHub fetch failed, using local cache:', e.message);
    }
    if (!_data) _data = emptyData();
    return _data;
  }

  async function fetchFromGitHub() {
    if (!CONFIG.GITHUB_TOKEN || CONFIG.GITHUB_TOKEN === 'YOUR_GITHUB_TOKEN') return null;
    const url = `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/contents/${CONFIG.DATA_FILE}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const json = await res.json();
    const content = atob(json.content.replace(/\n/g, ''));
    const parsed = JSON.parse(content);
    parsed._sha = json.sha;
    return parsed;
  }

  // Save: write to LocalStorage immediately, schedule GitHub sync
  function save(newData) {
    _data = { ..._data, ...newData };
    localStorage.setItem(LS_KEY, JSON.stringify(_data));
    localStorage.setItem(LS_PENDING, 'true');
    scheduleSyncToGitHub();
  }

  function scheduleSyncToGitHub() {
    if (_syncTimer) clearTimeout(_syncTimer);
    _syncTimer = setTimeout(syncToGitHub, 2000);
  }

  async function syncToGitHub() {
    if (!CONFIG.GITHUB_TOKEN || CONFIG.GITHUB_TOKEN === 'YOUR_GITHUB_TOKEN') return;
    if (!localStorage.getItem(LS_PENDING)) return;
    try {
      const dataToSave = { ..._data };
      const sha = dataToSave._sha;
      delete dataToSave._sha;
      const content = btoa(unescape(encodeURIComponent(JSON.stringify(dataToSave, null, 2))));
      const url = `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/contents/${CONFIG.DATA_FILE}`;
      const body = {
        message: `Update library data - ${new Date().toISOString().split('T')[0]}`,
        content,
        ...(sha ? { sha } : {}),
      };
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`GitHub PUT ${res.status}`);
      const result = await res.json();
      _data._sha = result.content.sha;
      localStorage.setItem(LS_KEY, JSON.stringify(_data));
      localStorage.removeItem(LS_PENDING);
      UI.showSyncStatus('saved');
    } catch(e) {
      console.warn('GitHub sync failed:', e.message);
      UI.showSyncStatus('pending');
    }
  }

  function get() { return _data; }

  function emptyData() {
    return {
      meta: { year: '2025-2026', created: new Date().toISOString().split('T')[0], school: CONFIG.SCHOOL_NAME },
      books: [], students: [], loans: [],
      users: [
        { id: 1, username: 'kutuphane', password: 'kutuphane123', role: 'librarian', name: 'Kütüphaneci' },
        { id: 2, username: 'ogretmen', password: 'ogretmen123', role: 'teacher', name: 'Öğretmen' },
        { id: 3, username: 'yonetim', password: 'yonetim123', role: 'management', name: 'Yönetim' },
      ]
    };
  }

  // Archive current year and start fresh
  async function archiveYear(newYear) {
    if (!CONFIG.GITHUB_TOKEN || CONFIG.GITHUB_TOKEN === 'YOUR_GITHUB_TOKEN') {
      alert('GitHub token gerekli arşivleme için.'); return;
    }
    const archiveData = { ..._data };
    delete archiveData._sha;
    const archivePath = `data/archive/${CONFIG.DATA_FILE.split('/').pop()}`;
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(archiveData, null, 2))));
    const url = `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/contents/${archivePath}`;
    await fetch(url, {
      method: 'PUT',
      headers: { 'Authorization': `token ${CONFIG.GITHUB_TOKEN}`, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json' },
      body: JSON.stringify({ message: `Archive ${CONFIG.DATA_FILE}`, content }),
    });
    // Reset data for new year
    const fresh = emptyData();
    fresh.meta.year = newYear;
    fresh.users = _data.users;
    fresh.books = _data.books.map(b => ({ ...b })); // keep book catalog
    CONFIG.DATA_FILE = `data/${newYear}.json`;
    _data = fresh;
    localStorage.setItem(LS_KEY, JSON.stringify(_data));
    localStorage.setItem(LS_PENDING, 'true');
    await syncToGitHub();
  }

  // Sync on visibility change (tab comes back into focus)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && localStorage.getItem(LS_PENDING)) syncToGitHub();
  });

  return { load, save, get, syncToGitHub, archiveYear };
})();
