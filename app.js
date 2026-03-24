// ============================================================
// APP — Main UI orchestration
// ============================================================

// ── UI helpers ───────────────────────────────────────────
const UI = {
  showSyncStatus(state) {
    const el = document.getElementById('sync-status');
    if (!el) return;
    el.className = 'sync-indicator ' + state;
    el.textContent = state === 'saved' ? '✓ Kaydedildi' : '⏳ Senkronize ediliyor…';
    if (state === 'saved') setTimeout(() => { if (el.textContent === '✓ Kaydedildi') el.textContent = ''; }, 3000);
  },

  alert(msg, type = 'success') {
    const el = document.getElementById('global-alert');
    el.className = 'alert alert-' + type;
    el.textContent = msg;
    el.style.display = 'block';
    clearTimeout(UI._alertTimer);
    UI._alertTimer = setTimeout(() => { el.style.display = 'none'; }, 4000);
  },

  modal(id, open) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('open', open);
  },

  badge(loan) {
    if (loan.status === 'returned') return '<span class="badge badge-green">İade</span>';
    if (loan.status === 'lost') return '<span class="badge badge-red">Kayıp</span>';
    if (Loans.isOverdue(loan)) return `<span class="badge badge-red">Gecikti +${Loans.daysOverdue(loan)}g</span>`;
    return '<span class="badge badge-blue">Okumada</span>';
  },

  availBadge(avail, qty) {
    if (avail <= 0) return '<span class="badge badge-red">Tükendi</span>';
    if (avail === 1) return '<span class="badge badge-amber">Son 1</span>';
    return '<span class="badge badge-green">Mevcut</span>';
  },

  formatDate(s) {
    if (!s) return '—';
    const d = new Date(s);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  coverHtml(book, size = 'sm') {
    if (book && book.cover) {
      return `<div class="book-cover-${size}"><img src="${book.cover}" alt="" onerror="this.parentElement.innerHTML='📖'" loading="lazy"></div>`;
    }
    return `<div class="book-cover-${size}" style="font-size:${size==='sm'?'18':'36'}px">📖</div>`;
  },
};

// ── Routing ──────────────────────────────────────────────
function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const pg = document.getElementById('page-' + pageId);
  if (pg) pg.classList.add('active');
  document.querySelectorAll('.nav-tab[data-page]').forEach(t => {
    if (t.dataset.page === pageId) t.classList.add('active');
  });
  // Render page content
  const renderers = {
    dashboard: renderDashboard,
    books: renderBooks,
    loans: renderLoans,
    students: renderStudents,
    reports: renderReports,
    isbn: renderISBN,
    settings: renderSettings,
  };
  if (renderers[pageId]) renderers[pageId]();
}

// ── Nav setup ─────────────────────────────────────────────
function setupNav() {
  const role = Auth.role();
  const tabs = {
    librarian: [
      { id: 'dashboard', label: 'Genel Bakış', icon: '📊' },
      { id: 'books', label: 'Kitaplar', icon: '📚' },
      { id: 'isbn', label: 'ISBN Ekle', icon: '🔖' },
      { id: 'loans', label: 'Ödünç', icon: '📤' },
      { id: 'students', label: 'Öğrenciler', icon: '👥' },
      { id: 'reports', label: 'Raporlar', icon: '📈' },
      { id: 'settings', label: 'Ayarlar', icon: '⚙️' },
    ],
    teacher: [
      { id: 'dashboard', label: 'Genel Bakış', icon: '📊' },
      { id: 'books', label: 'Kitaplar', icon: '📚' },
      { id: 'reports', label: 'Raporlar', icon: '📈' },
    ],
    student: [
      { id: 'books', label: 'Kitaplar', icon: '📚' },
      { id: 'dashboard', label: 'İstatistik', icon: '📊' },
    ],
    management: [
      { id: 'dashboard', label: 'Genel Bakış', icon: '📊' },
      { id: 'reports', label: 'Raporlar', icon: '📈' },
    ],
  };
  const navTabs = document.getElementById('nav-tabs');
  navTabs.innerHTML = (tabs[role] || []).map(t =>
    `<button class="nav-tab" data-page="${t.id}" onclick="navigateTo('${t.id}')">
      <span class="ti">${t.icon}</span><span class="tab-label">${t.label}</span>
    </button>`
  ).join('');
  const user = Auth.current();
  document.getElementById('nav-avatar').textContent = (user.name || 'K')[0].toUpperCase();
  document.getElementById('nav-username').textContent = user.name || user.username;
}

// ── LOGIN ─────────────────────────────────────────────────
let _selectedRole = 'librarian';
function selectRole(role) {
  _selectedRole = role;
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('role-' + role).classList.add('selected');
  const hints = {
    librarian: 'Kullanıcı: kutuphane | Şifre: kutuphane123',
    teacher: 'Kullanıcı: ogretmen | Şifre: ogretmen123',
    student: 'Kullanıcı: öğrenci numarası | Şifre: öğrenci numarası',
    management: 'Kullanıcı: yonetim | Şifre: yonetim123',
  };
  document.getElementById('login-hint').textContent = hints[role] || '';
}

async function doLogin() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value;
  const err = document.getElementById('login-error');
  if (!u || !p) { err.textContent = 'Kullanıcı adı ve şifre giriniz.'; err.style.display = 'block'; return; }
  const user = Auth.login(u, p);
  if (!user) { err.textContent = 'Kullanıcı adı veya şifre hatalı.'; err.style.display = 'block'; return; }
  err.style.display = 'none';
  showApp();
}

function logout() {
  Auth.logout();
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
}

function showApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  setupNav();

  // Kütüphaneciye özel butonları her zaman göster
  if (Auth.isLibrarian()) {
    ['btn-add-book', 'btn-add-student', 'btn-add-teacher'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.style.display = 'inline-flex'; el.style.visibility = 'visible'; }
    });
  }

  const role = Auth.role();
  const firstPages = { librarian: 'dashboard', teacher: 'dashboard', student: 'books', management: 'dashboard' };
  navigateTo(firstPages[role] || 'dashboard');
}

// ── DASHBOARD ─────────────────────────────────────────────
function renderDashboard() {
  const s = Reports.summary();
  const overdue = Loans.getOverdue();
  document.getElementById('dash-metrics').innerHTML = `
    <div class="metric-card green">
      <div class="metric-label">Toplam Kitap</div>
      <div class="metric-value">${s.totalBooks}</div>
      <div class="metric-sub">${s.uniqueTitles} farklı eser</div>
    </div>
    <div class="metric-card blue">
      <div class="metric-label">Aktif Ödünç</div>
      <div class="metric-value">${s.activeLoans}</div>
      <div class="metric-sub">${s.totalStudents} kayıtlı öğrenci</div>
    </div>
    <div class="metric-card ${s.overdueLoans > 0 ? 'red' : 'green'}">
      <div class="metric-label">Geciken</div>
      <div class="metric-value">${s.overdueLoans}</div>
      <div class="metric-sub">iade tarihi geçmiş</div>
    </div>
    <div class="metric-card green">
      <div class="metric-label">Zamanında İade</div>
      <div class="metric-value">%${s.onTimeRate}</div>
      <div class="metric-sub">${s.totalReturned} toplam iade</div>
    </div>
  `;

  const topBooks = Reports.topBooks(5);
  const maxB = topBooks[0] ? topBooks[0].count : 1;
  document.getElementById('dash-top-books').innerHTML = topBooks.length ? topBooks.map(({ book, count }) => `
    <div class="bar-row">
      <div class="bar-meta"><span>${book.title}</span><span>${count}×</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round(count/maxB*100)}%;background:var(--accent)"></div></div>
    </div>`).join('') : '<p style="color:var(--text3);font-size:13px">Henüz ödünç verisi yok</p>';

  const recentLoans = Loans.getAll().slice(0, 6);
  document.getElementById('dash-recent').innerHTML = recentLoans.length ? recentLoans.map(l => {
    const st = Students.getById(l.studentId);
    const bk = Books.getById(l.bookId);
    if (!st || !bk) return '';
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);gap:8px">
      <div style="min-width:0">
        <div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${bk.title}</div>
        <div style="font-size:11px;color:var(--text3)">${st.name} ${st.surname} · ${st.class || ''}</div>
      </div>
      ${UI.badge(l)}
    </div>`;
  }).join('') : '<p style="color:var(--text3);font-size:13px;padding:12px 0">Henüz ödünç yok</p>';

  const overdueSection = document.getElementById('dash-overdue');
  if (overdue.length && Auth.role() !== 'student') {
    overdueSection.innerHTML = `
      <div class="overdue-banner">⚠️ <strong>${overdue.length} gecikmiş ödünç</strong> var</div>
      <div class="table-wrap">
        <table><thead><tr><th>Öğrenci</th><th>Kitap</th><th>Bitti</th><th>Gecikme</th></tr></thead>
        <tbody>${overdue.map(l => {
          const st = Students.getById(l.studentId);
          const bk = Books.getById(l.bookId);
          return `<tr>
            <td>${st ? st.name + ' ' + st.surname : '—'}<div class="sub">${st ? st.class : ''}</div></td>
            <td>${bk ? bk.title : '—'}</td>
            <td>${UI.formatDate(l.dueDate)}</td>
            <td><span class="badge badge-red">+${Loans.daysOverdue(l)} gün</span></td>
          </tr>`;
        }).join('')}</tbody></table>
      </div>`;
  } else { overdueSection.innerHTML = ''; }
}

// ── BOOKS ─────────────────────────────────────────────────
let _bookView = 'table';
function renderBooks() {
  const q = document.getElementById('book-search-input')?.value || '';
  const cat = document.getElementById('book-cat-filter')?.value || '';
  const books = Books.search(q, cat);
  const isLib = Auth.canEdit();

  if (_bookView === 'grid') {
    document.getElementById('books-content').innerHTML = books.length
      ? `<div class="book-grid">${books.map(b => {
          const avail = Books.getAvailable(b.id);
          return `<div class="book-card" onclick="openBookDetail(${b.id})">
            <div class="book-card-cover">
              ${b.cover
                ? `<img src="${b.cover}" alt="${b.title}" loading="lazy" onerror="this.style.display='none';this.parentElement.innerHTML='📖'">`
                : '📖'
              }
            </div>
            <div class="book-card-body">
              <div class="book-card-title">${b.title}</div>
              <div class="book-card-author">${b.author}</div>
              <div style="margin-top:6px">${UI.availBadge(avail, b.qty)}</div>
            </div>
          </div>`;
        }).join('')}</div>`
      : `<div class="empty-state"><div class="ei">📭</div><p>Kitap bulunamadı</p></div>`;
  } else {
    document.getElementById('books-content').innerHTML = `
      <div class="table-wrap">
        <table><thead><tr>
          <th>Kitap</th><th>Yazar</th><th>Kategori</th><th>Raf</th><th>Stok</th><th>Durum</th>
          ${isLib ? '<th></th>' : ''}
        </tr></thead>
        <tbody>${books.length ? books.map(b => {
          const avail = Books.getAvailable(b.id);
          return `<tr>
            <td><div class="book-row-info">
              ${UI.coverHtml(b, 'sm')}
              <div><strong onclick="openBookDetail(${b.id})" style="cursor:pointer;color:var(--accent)">${b.title}</strong>
              <div class="sub">${b.publisher || ''}${b.year ? ' · ' + b.year : ''}</div></div>
            </div></td>
            <td>${b.author}</td>
            <td><span class="chip">${b.category}</span></td>
            <td style="font-size:12px;color:var(--text3)">${b.shelf || '—'}</td>
            <td>${avail}/${b.qty}</td>
            <td>${UI.availBadge(avail, b.qty)}</td>
            ${isLib ? `<td style="display:flex;gap:6px;flex-wrap:wrap;padding:8px 14px">
              <button class="btn btn-sm" onclick="openEditBook(${b.id})">Düzenle</button>
              <button class="btn btn-sm btn-danger" onclick="deleteBook(${b.id})">Sil</button>
            </td>` : ''}
          </tr>`;
        }).join('') : `<tr><td colspan="7"><div class="empty-state"><div class="ei">📭</div><p>Kitap bulunamadı</p></div></td></tr>`}
        </tbody></table>
      </div>`;
  }
}

function openBookDetail(bookId) {
  const b = Books.getById(bookId);
  if (!b) return;
  const avail = Books.getAvailable(bookId);
  document.getElementById('book-detail-body').innerHTML = `
    <div style="display:flex;gap:18px;margin-bottom:18px">
      ${b.cover
        ? `<img src="${b.cover}" style="width:90px;height:120px;object-fit:cover;border-radius:6px;flex-shrink:0" onerror="this.style.display='none'">`
        : '<div style="width:90px;height:120px;background:var(--surface2);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:36px;flex-shrink:0">📖</div>'}
      <div>
        <h3 style="font-size:17px;margin-bottom:6px">${b.title}</h3>
        <p style="font-size:13px;color:var(--text2);margin-bottom:4px">${b.author}</p>
        <p style="font-size:12px;color:var(--text3)">${b.publisher || ''}${b.year ? ' · ' + b.year : ''}</p>
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
          <span class="chip">${b.category}</span>
          ${UI.availBadge(avail, b.qty)}
          ${b.isbn ? `<span class="chip">ISBN: ${b.isbn}</span>` : ''}
        </div>
      </div>
    </div>
    ${b.summary ? `<p style="font-size:13px;color:var(--text2);line-height:1.6;border-top:1px solid var(--border);padding-top:14px">${b.summary}</p>` : ''}
    <div style="font-size:12px;color:var(--text3);margin-top:12px">
      ${b.shelf ? `📍 Raf: ${b.shelf} · ` : ''}${avail} adet müsait / toplam ${b.qty} adet
    </div>
  `;
  UI.modal('modal-book-detail', true);
}

function openEditBook(bookId) {
  const b = bookId ? Books.getById(bookId) : null;
  document.getElementById('edit-book-id').value = bookId || '';
  document.getElementById('modal-book-title').textContent = b ? 'Kitabı Düzenle' : 'Kitap Ekle';
  ['title','author','publisher','year','isbn','shelf','qty'].forEach(f => {
    const el = document.getElementById('eb-' + f);
    if (el) el.value = b ? (b[f] || '') : (f === 'qty' ? '1' : '');
  });
  const catEl = document.getElementById('eb-category');
  if (catEl) catEl.value = b ? b.category : 'Diğer';
  UI.modal('modal-edit-book', true);
}

function saveBook() {
  const id = document.getElementById('edit-book-id').value;
  const title = document.getElementById('eb-title').value.trim();
  const author = document.getElementById('eb-author').value.trim();
  if (!title || !author) { UI.alert('Kitap adı ve yazar zorunludur.', 'danger'); return; }
  const data = {
    title, author,
    publisher: document.getElementById('eb-publisher').value,
    year: document.getElementById('eb-year').value,
    isbn: document.getElementById('eb-isbn').value,
    category: document.getElementById('eb-category').value,
    shelf: document.getElementById('eb-shelf').value,
    qty: parseInt(document.getElementById('eb-qty').value) || 1,
  };
  if (id) { Books.update(parseInt(id), data); UI.alert(`"${title}" güncellendi.`); }
  else { Books.add(data); UI.alert(`"${title}" eklendi.`); }
  UI.modal('modal-edit-book', false);
  renderBooks();
}

function deleteBook(bookId) {
  const b = Books.getById(bookId);
  if (!b) return;
  const active = (Storage.get().loans || []).filter(l => l.bookId === bookId && l.status === 'active').length;
  if (active > 0) { UI.alert(`"${b.title}" şu an ödünçte, silinemez.`, 'danger'); return; }
  if (!confirm(`"${b.title}" kitabını silmek istediğinize emin misiniz?`)) return;
  Books.remove(bookId);
  UI.alert(`"${b.title}" silindi.`);
  renderBooks();
  renderDashboard();
}

// ── ISBN ──────────────────────────────────────────────────
let _isbnResults = [];
function renderISBN() {}

async function doISBNSearch() {
  const val = document.getElementById('isbn-input').value.trim();
  if (!val) return;
  const btn = document.getElementById('isbn-search-btn');
  btn.textContent = '⏳ Aranıyor…'; btn.disabled = true;
  try {
    const isISBN = /^[\d-]{9,17}$/.test(val.replace(/\s/g, ''));
    _isbnResults = isISBN ? await Books.searchByISBN(val) : await Books.searchByTitle(val);
    renderISBNResults();
  } catch(e) {
    UI.alert('Arama başarısız: ' + e.message, 'danger');
  } finally { btn.textContent = '🔍 Ara'; btn.disabled = false; }
}

function renderISBNResults() {
  const el = document.getElementById('isbn-results');
  if (!_isbnResults.length) { el.innerHTML = '<div class="alert alert-info">Sonuç bulunamadı. Başka bir arama deneyin.</div>'; return; }
  el.innerHTML = `<div class="isbn-results">${_isbnResults.map((b, i) => `
    <div class="isbn-result-card" onclick="selectISBNResult(${i})">
      ${b.cover ? `<img src="${b.cover}" class="cover" onerror="this.style.display='none'">` : '<div class="cover" style="display:flex;align-items:center;justify-content:center;background:var(--surface2);font-size:24px">📖</div>'}
      <div class="info">
        <strong>${b.title}</strong>
        <span>${b.author}</span>
        <span>${b.publisher || ''}${b.year ? ' · ' + b.year : ''}</span>
        ${b.isbn ? `<span>ISBN: ${b.isbn}</span>` : ''}
      </div>
    </div>`).join('')}</div>`;
}

function selectISBNResult(idx) {
  const b = _isbnResults[idx];
  ['title','author','publisher','year','isbn'].forEach(f => {
    const el = document.getElementById('eb-' + f);
    if (el) el.value = b[f] || '';
  });
  document.getElementById('edit-book-id').value = '';
  document.getElementById('modal-book-title').textContent = 'Kitap Ekle';
  document.getElementById('eb-qty').value = '1';
  // Store cover + summary for saving
  window._pendingCover = b.cover || '';
  window._pendingSummary = b.summary || '';
  UI.modal('modal-edit-book', true);
}

// Override saveBook to include cover/summary from ISBN
const _origSaveBook = saveBook;
function saveBook() {
  const id = document.getElementById('edit-book-id').value;
  const title = document.getElementById('eb-title').value.trim();
  const author = document.getElementById('eb-author').value.trim();
  if (!title || !author) { UI.alert('Kitap adı ve yazar zorunludur.', 'danger'); return; }
  const data = {
    title, author,
    publisher: document.getElementById('eb-publisher').value,
    year: document.getElementById('eb-year').value,
    isbn: document.getElementById('eb-isbn').value,
    category: document.getElementById('eb-category').value,
    shelf: document.getElementById('eb-shelf').value,
    qty: parseInt(document.getElementById('eb-qty').value) || 1,
    cover: window._pendingCover || '',
    summary: window._pendingSummary || '',
  };
  window._pendingCover = '';
  window._pendingSummary = '';
  if (id) { Books.update(parseInt(id), data); UI.alert(`"${title}" güncellendi.`); }
  else { Books.add(data); UI.alert(`"${title}" eklendi.`); }
  UI.modal('modal-edit-book', false);
  renderBooks();
}

// ── LOANS ─────────────────────────────────────────────────
let _loanTab = 'borrow';
function renderLoans() { renderLoanTab(_loanTab); }

function renderLoanTab(tab) {
  _loanTab = tab;
  document.querySelectorAll('.loan-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.loan-panel').forEach(p => p.style.display = 'none');
  const panel = document.getElementById('loan-panel-' + tab);
  if (panel) panel.style.display = 'block';

  if (tab === 'borrow') renderBorrowForm();
  if (tab === 'active') renderActiveLoans();
  if (tab === 'history') renderLoanHistory();
}

function renderBorrowForm() {
  const students = Students.getAll();
  const books = Books.getAll().filter(b => Books.getAvailable(b.id) > 0);
  const today = new Date().toISOString().split('T')[0];
  const due = new Date(); due.setDate(due.getDate() + CONFIG.DEFAULT_LOAN_DAYS);
  document.getElementById('borrow-student').innerHTML = '<option value="">— Öğrenci seçin —</option>' +
    students.map(s => `<option value="${s.id}">${s.name} ${s.surname} (${s.no} · ${s.class})</option>`).join('');
  document.getElementById('borrow-book').innerHTML = '<option value="">— Kitap seçin —</option>' +
    books.map(b => `<option value="${b.id}">${b.title} (${Books.getAvailable(b.id)} müsait)</option>`).join('');
  document.getElementById('borrow-date').value = today;
  document.getElementById('borrow-due').value = due.toISOString().split('T')[0];
}

function doBorrow() {
  const sid = parseInt(document.getElementById('borrow-student').value);
  const bid = parseInt(document.getElementById('borrow-book').value);
  const due = document.getElementById('borrow-due').value;
  if (!sid || !bid) { UI.alert('Öğrenci ve kitap seçiniz.', 'danger'); return; }
  try {
    const loan = Loans.borrow(sid, bid, due);
    const st = Students.getById(sid), bk = Books.getById(bid);
    UI.alert(`"${bk.title}" → ${st.name} ${st.surname} (İade: ${UI.formatDate(due)})`);
    renderBorrowForm();
  } catch(e) { UI.alert(e.message, 'danger'); }
}

function renderActiveLoans() {
  const loans = Loans.getActive();
  document.getElementById('loan-panel-active').innerHTML = loans.length
    ? `<div class="table-wrap"><table><thead><tr>
        <th>Öğrenci</th><th>Kitap</th><th>Ödünç</th><th>İade</th><th>Durum</th><th></th>
      </tr></thead><tbody>${loans.map(l => {
        const st = Students.getById(l.studentId), bk = Books.getById(l.bookId);
        return `<tr>
          <td>${st ? st.name + ' ' + st.surname : '—'}<div class="sub">${st ? st.class : ''}</div></td>
          <td>${bk ? bk.title : '—'}</td>
          <td>${UI.formatDate(l.borrowDate)}</td>
          <td>${UI.formatDate(l.dueDate)}</td>
          <td>${UI.badge(l)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn btn-sm btn-primary" onclick="doReturn(${l.id})">İade Al</button>
            <button class="btn btn-sm btn-danger" onclick="doMarkLost(${l.id})">Kayıp</button>
          </td>
        </tr>`;
      }).join('')}</tbody></table></div>`
    : '<div class="empty-state"><div class="ei">✅</div><p>Aktif ödünç yok</p></div>';
}

function renderLoanHistory() {
  const loans = Loans.getAll().filter(l => l.status !== 'active').slice(0, 50);
  document.getElementById('loan-panel-history').innerHTML = loans.length
    ? `<div class="table-wrap"><table><thead><tr>
        <th>Öğrenci</th><th>Kitap</th><th>Ödünç</th><th>İade</th><th>Durum</th>
      </tr></thead><tbody>${loans.map(l => {
        const st = Students.getById(l.studentId), bk = Books.getById(l.bookId);
        return `<tr>
          <td>${st ? st.name + ' ' + st.surname : '—'}</td>
          <td>${bk ? bk.title : '—'}</td>
          <td>${UI.formatDate(l.borrowDate)}</td>
          <td>${UI.formatDate(l.returnDate)}</td>
          <td>${UI.badge(l)}</td>
        </tr>`;
      }).join('')}</tbody></table></div>`
    : '<div class="empty-state"><div class="ei">📋</div><p>Geçmiş kayıt yok</p></div>';
}

function doReturn(loanId) {
  try {
    const loan = Loans.returnBook(loanId);
    const bk = Books.getById(loan.bookId);
    UI.alert(`"${bk ? bk.title : 'Kitap'}" iade alındı.`);
    renderActiveLoans();
    renderDashboard();
  } catch(e) { UI.alert(e.message, 'danger'); }
}

function doMarkLost(loanId) {
  if (!confirm('Bu kitabı kayıp olarak işaretlemek istediğinize emin misiniz?')) return;
  try {
    Loans.markLost(loanId);
    UI.alert('Kitap kayıp olarak işaretlendi.', 'amber');
    renderActiveLoans();
  } catch(e) { UI.alert(e.message, 'danger'); }
}

// ── STUDENTS ──────────────────────────────────────────────
function renderStudents() {
  const q = document.getElementById('student-search-input')?.value || '';
  const students = Students.search(q);
  const isLib = Auth.canEdit();
  document.getElementById('students-content').innerHTML = students.length
    ? `<div class="table-wrap"><table><thead><tr>
        <th>Öğrenci</th><th>Sınıf</th><th>Aktif Ödünç</th><th>Toplam</th>
        ${isLib ? '<th></th>' : ''}
      </tr></thead><tbody>${students.map(s => {
        const active = Students.getActiveLoans(s.id).length;
        const total = Students.getTotalLoans(s.id);
        return `<tr>
          <td><strong>${s.name} ${s.surname}</strong><div class="sub">${s.no}${s.email ? ' · ' + s.email : ''}</div></td>
          <td><span class="chip">${s.class || '—'}</span></td>
          <td>${active > 0 ? `<span class="badge badge-blue">${active} kitap</span>` : '<span class="badge badge-gray">Yok</span>'}</td>
          <td>${total}</td>
          ${isLib ? `<td style="display:flex;gap:6px;flex-wrap:wrap;padding:8px 14px">
            <button class="btn btn-sm" onclick="openEditStudent(${s.id})">Düzenle</button>
            <button class="btn btn-sm btn-danger" onclick="deleteStudent(${s.id})">Sil</button>
          </td>` : ''}
        </tr>`;
      }).join('')}</tbody></table></div>`
    : '<div class="empty-state"><div class="ei">👤</div><p>Öğrenci bulunamadı</p></div>';
}

function deleteStudent(studentId) {
  const s = Students.getById(studentId);
  if (!s) return;
  const active = Students.getActiveLoans(studentId).length;
  if (active > 0) { UI.alert(`${s.name} ${s.surname} adlı öğrencinin aktif ödüncü var, silinemez.`, 'danger'); return; }
  if (!confirm(`${s.name} ${s.surname} adlı öğrenciyi silmek istediğinize emin misiniz?`)) return;
  try {
    Students.remove(studentId);
    UI.alert(`${s.name} ${s.surname} silindi.`);
    renderStudents();
  } catch(e) { UI.alert(e.message, 'danger'); }
}

function openEditStudent(studentId) {
  const s = studentId ? Students.getById(studentId) : null;
  document.getElementById('edit-student-id').value = studentId || '';
  document.getElementById('modal-student-title').textContent = s ? 'Öğrenciyi Düzenle' : 'Öğrenci Ekle';
  ['name','surname','no','class','email','phone'].forEach(f => {
    const el = document.getElementById('es-' + f);
    if (el) el.value = s ? (s[f] || '') : '';
  });
  UI.modal('modal-edit-student', true);
}

function saveStudent() {
  const id = document.getElementById('edit-student-id').value;
  const name = document.getElementById('es-name').value.trim();
  const surname = document.getElementById('es-surname').value.trim();
  const no = document.getElementById('es-no').value.trim();
  if (!name || !surname || !no) { UI.alert('Ad, soyad ve numara zorunludur.', 'danger'); return; }
  const data = { name, surname, no, class: document.getElementById('es-class').value, email: document.getElementById('es-email').value, phone: document.getElementById('es-phone').value };
  try {
    if (id) { Students.update(parseInt(id), data); UI.alert(`${name} ${surname} güncellendi.`); }
    else { Students.add(data); UI.alert(`${name} ${surname} eklendi.`); }
    UI.modal('modal-edit-student', false);
    renderStudents();
  } catch(e) { UI.alert(e.message, 'danger'); }
}

// ── USER TABS ──────────────────────────────────────────────
function userTab(tab, btn) {
  document.getElementById('user-panel-students').style.display = tab === 'students' ? 'block' : 'none';
  document.getElementById('user-panel-teachers').style.display = tab === 'teachers' ? 'block' : 'none';
  document.querySelectorAll('.user-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  if (tab === 'teachers') renderTeachers();
  if (tab === 'students') renderStudents();
}

// ── TEACHER MANAGEMENT ─────────────────────────────────────
function renderTeachers() {
  const q = (document.getElementById('teacher-search-input')?.value || '').toLowerCase();
  const data = Storage.get();
  const teachers = (data.users || []).filter(u => u.role === 'teacher').filter(u => {
    return !q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
  });
  const isLib = Auth.isLibrarian();
  document.getElementById('teachers-content').innerHTML = teachers.length
    ? `<div class="table-wrap"><table><thead><tr>
        <th>Ad Soyad</th><th>Kullanıcı Adı</th><th>Branş</th>
        ${isLib ? '<th></th>' : ''}
      </tr></thead><tbody>${teachers.map(t => `<tr>
        <td><strong>${t.name || ''}</strong></td>
        <td><span class="chip">${t.username}</span></td>
        <td style="font-size:12px;color:var(--text3)">${t.branch || '—'}</td>
        ${isLib ? `<td style="display:flex;gap:6px;padding:8px 14px">
          <button class="btn btn-sm" onclick="openEditTeacher('${t.username}')">Düzenle</button>
          <button class="btn btn-sm btn-danger" onclick="deleteTeacher('${t.username}')">Sil</button>
        </td>` : ''}
      </tr>`).join('')}</tbody></table></div>`
    : `<div class="empty-state"><div class="ei">👨‍🏫</div><p>Henüz öğretmen eklenmedi</p>
        ${isLib ? '<button class="btn btn-primary" onclick="openEditTeacher(null)">+ Öğretmen Ekle</button>' : ''}
      </div>`;
}

function openEditTeacher(username) {
  const data = Storage.get();
  const t = username ? (data.users || []).find(u => u.username === username) : null;
  document.getElementById('modal-teacher-title').textContent = t ? 'Öğretmeni Düzenle' : 'Öğretmen Ekle';
  document.getElementById('edit-teacher-id').value = username || '';
  document.getElementById('et-name').value = t ? (t.name || '') : '';
  document.getElementById('et-surname').value = t ? (t.surname || '') : '';
  document.getElementById('et-username').value = t ? t.username : '';
  document.getElementById('et-password').value = t ? (t.password || '') : '';
  document.getElementById('et-branch').value = t ? (t.branch || '') : '';
  UI.modal('modal-edit-teacher', true);
}

function saveTeacher() {
  const oldUsername = document.getElementById('edit-teacher-id').value;
  const name = document.getElementById('et-name').value.trim();
  const surname = document.getElementById('et-surname').value.trim();
  const username = document.getElementById('et-username').value.trim();
  const password = document.getElementById('et-password').value.trim();
  const branch = document.getElementById('et-branch').value.trim();
  if (!name || !username || !password) { UI.alert('Ad, kullanıcı adı ve şifre zorunludur.', 'danger'); return; }
  const data = Storage.get();
  const users = data.users || [];
  if (oldUsername) {
    const idx = users.findIndex(u => u.username === oldUsername);
    if (idx !== -1) users[idx] = { ...users[idx], name, surname, username, password, branch };
    UI.alert(`${name} ${surname} güncellendi.`);
  } else {
    if (users.find(u => u.username === username)) { UI.alert('Bu kullanıcı adı zaten kullanımda.', 'danger'); return; }
    users.push({ id: Date.now(), name, surname, username, password, role: 'teacher', branch });
    UI.alert(`${name} ${surname} eklendi.`);
  }
  Storage.save({ users });
  UI.modal('modal-edit-teacher', false);
  renderTeachers();
}

function deleteTeacher(username) {
  const data = Storage.get();
  const t = (data.users || []).find(u => u.username === username);
  if (!t) return;
  if (!confirm(`${t.name || username} adlı öğretmeni silmek istediğinize emin misiniz?`)) return;
  const users = (data.users || []).filter(u => u.username !== username);
  Storage.save({ users });
  UI.alert(`${t.name || username} silindi.`);
  renderTeachers();
}

// ── REPORTS ───────────────────────────────────────────────
function renderReports() {
  const s = Reports.summary();
  document.getElementById('report-metrics').innerHTML = `
    <div class="metric-card green"><div class="metric-label">Toplam İşlem</div><div class="metric-value">${s.totalLoans}</div><div class="metric-sub">tüm zamanlar</div></div>
    <div class="metric-card blue"><div class="metric-label">Zamanında İade</div><div class="metric-value">%${s.onTimeRate}</div><div class="metric-sub">${s.totalReturned} iadeden</div></div>
    <div class="metric-card amber"><div class="metric-label">Aktif Okuyucu</div><div class="metric-value">${Reports.topReaders().length}</div><div class="metric-sub">ödünç almış</div></div>
    <div class="metric-card green"><div class="metric-label">Benzersiz Eser</div><div class="metric-value">${s.uniqueTitles}</div><div class="metric-sub">katalogda</div></div>
  `;

  const topBooks = Reports.topBooks(8);
  const maxB = topBooks[0] ? topBooks[0].count : 1;
  document.getElementById('report-top-books').innerHTML = topBooks.length ? topBooks.map(({ book, count }) => `
    <div class="bar-row">
      <div class="bar-meta"><span>${book.title}</span><span>${count}×</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round(count/maxB*100)}%;background:var(--accent)"></div></div>
    </div>`).join('') : '<p style="color:var(--text3);font-size:13px">Henüz veri yok</p>';

  const byClass = Reports.byClass();
  const maxC = byClass[0] ? byClass[0][1] : 1;
  document.getElementById('report-by-class').innerHTML = byClass.length ? byClass.map(([cls, count]) => `
    <div class="bar-row">
      <div class="bar-meta"><span>${cls}</span><span>${count}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round(count/maxC*100)}%;background:var(--blue)"></div></div>
    </div>`).join('') : '<p style="color:var(--text3);font-size:13px">Henüz veri yok</p>';

  const topReaders = Reports.topReaders(5);
  document.getElementById('report-top-readers').innerHTML = topReaders.length
    ? `<table><thead><tr><th>#</th><th>Öğrenci</th><th>Sınıf</th><th>Kitap</th></tr></thead><tbody>
      ${topReaders.map(({ student: s, count }, i) =>
        `<tr><td style="font-weight:600;color:var(--accent)">${i+1}</td><td>${s.name} ${s.surname}</td><td>${s.class||'—'}</td><td><span class="badge badge-green">${count}</span></td></tr>`
      ).join('')}</tbody></table>`
    : '<p style="color:var(--text3);font-size:13px">Henüz veri yok</p>';

  const byCat = Reports.byCategory();
  const maxCat = byCat[0] ? byCat[0][1] : 1;
  document.getElementById('report-by-cat').innerHTML = byCat.length ? byCat.map(([cat, count]) => `
    <div class="bar-row">
      <div class="bar-meta"><span>${cat}</span><span>${count}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round(count/maxCat*100)}%;background:var(--amber)"></div></div>
    </div>`).join('') : '<p style="color:var(--text3);font-size:13px">Henüz veri yok</p>';
}

// ── SETTINGS ──────────────────────────────────────────────
function renderSettings() {
  const data = Storage.get();
  document.getElementById('settings-year').textContent = data.meta?.year || '—';
  document.getElementById('settings-school').value = data.meta?.school || '';
  document.getElementById('settings-github-owner').value = CONFIG.GITHUB_OWNER || '';
  document.getElementById('settings-github-repo').value = CONFIG.GITHUB_REPO || '';
}

function saveGitHubSettings() {
  const token = document.getElementById('settings-github-token').value.trim();
  if (token) {
    localStorage.setItem('gh_token', token);
    document.getElementById('settings-github-token').value = '';
    UI.alert('Token kaydedildi. Artık veriler GitHub\'a senkronize edilecek.');
  } else {
    UI.alert('Lütfen token giriniz.', 'danger');
  }
}

function saveSettings() {
  const data = Storage.get();
  data.meta.school = document.getElementById('settings-school').value;
  Storage.save({ meta: data.meta });
  UI.alert('Ayarlar kaydedildi.');
}

async function doArchive() {
  const newYear = document.getElementById('new-year-input').value.trim();
  if (!newYear) { UI.alert('Yeni yıl giriniz (örn: 2026-2027)', 'danger'); return; }
  if (!confirm(`${CONFIG.DATA_FILE} arşivlenecek ve ${newYear} başlayacak. Emin misiniz?`)) return;
  try {
    await Storage.archiveYear(newYear);
    UI.alert(`Yıl arşivlendi. ${newYear} başladı.`);
    UI.modal('modal-archive', false);
  } catch(e) { UI.alert('Arşivleme hatası: ' + e.message, 'danger'); }
}

// ── INIT ──────────────────────────────────────────────────
async function init() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }

  // Load data
  await Storage.load();

  // Check existing session
  const user = Auth.init();
  if (user) {
    showApp();
  }

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => {
      if (e.target === m) UI.modal(m.id, false);
    });
  });

  // ISBN Enter key
  document.getElementById('isbn-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') doISBNSearch();
  });

  // Search inputs
  document.getElementById('book-search-input')?.addEventListener('input', renderBooks);
  document.getElementById('book-cat-filter')?.addEventListener('change', renderBooks);
  document.getElementById('student-search-input')?.addEventListener('input', renderStudents);
}

document.addEventListener('DOMContentLoaded', init);
