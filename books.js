// ============================================================
// BOOKS — Catalog management + Google Books API lookup
// ============================================================
const Books = (() => {

  // ── Google Books API ──────────────────────────────────────
  async function searchByISBN(isbn) {
    const clean = isbn.replace(/[-\s]/g, '');
    return searchGoogleBooks(`isbn:${clean}`);
  }

  async function searchByTitle(query) {
    return searchGoogleBooks(encodeURIComponent(query));
  }

  async function searchGoogleBooks(query) {
    const key = CONFIG.GOOGLE_BOOKS_API_KEY;
    const base = 'https://www.googleapis.com/books/v1/volumes';
    const url = key && key !== 'YOUR_GOOGLE_BOOKS_API_KEY'
      ? `${base}?q=${query}&key=${key}&maxResults=5&langRestrict=tr`
      : `${base}?q=${query}&maxResults=5`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Google Books API hatası');
    const json = await res.json();
    if (!json.items || json.items.length === 0) return [];
    return json.items.map(item => {
      const info = item.volumeInfo || {};
      return {
        googleId: item.id,
        title: info.title || '',
        author: (info.authors || []).join(', '),
        publisher: info.publisher || '',
        year: info.publishedDate ? info.publishedDate.substring(0, 4) : '',
        isbn: extractISBN(info.industryIdentifiers),
        cover: info.imageLinks ? (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || '') : '',
        summary: info.description ? info.description.substring(0, 300) + (info.description.length > 300 ? '...' : '') : '',
        pageCount: info.pageCount || '',
        categories: (info.categories || []).join(', '),
        language: info.language || '',
      };
    });
  }

  function extractISBN(identifiers) {
    if (!identifiers) return '';
    const isbn13 = identifiers.find(i => i.type === 'ISBN_13');
    if (isbn13) return isbn13.identifier;
    const isbn10 = identifiers.find(i => i.type === 'ISBN_10');
    return isbn10 ? isbn10.identifier : '';
  }

  // ── CRUD ─────────────────────────────────────────────────
  function getAll() {
    return (Storage.get().books || []).sort((a, b) => a.title.localeCompare(b.title, 'tr'));
  }

  function getById(id) {
    return (Storage.get().books || []).find(b => b.id === id);
  }

  function add(bookData) {
    const data = Storage.get();
    const books = data.books || [];
    const existing = books.find(b => b.isbn && b.isbn === bookData.isbn);
    if (existing) {
      existing.qty += (bookData.qty || 1);
      Storage.save({ books });
      return existing;
    }
    const newBook = {
      id: Date.now(),
      title: bookData.title || '',
      author: bookData.author || '',
      publisher: bookData.publisher || '',
      year: bookData.year || '',
      isbn: bookData.isbn || '',
      category: bookData.category || 'Diğer',
      shelf: bookData.shelf || '',
      qty: parseInt(bookData.qty) || 1,
      cover: bookData.cover || '',
      summary: bookData.summary || '',
      addedAt: new Date().toISOString().split('T')[0],
    };
    books.push(newBook);
    Storage.save({ books });
    return newBook;
  }

  function update(id, fields) {
    const data = Storage.get();
    const books = data.books || [];
    const idx = books.findIndex(b => b.id === id);
    if (idx === -1) return null;
    books[idx] = { ...books[idx], ...fields };
    Storage.save({ books });
    return books[idx];
  }

  function remove(id) {
    const data = Storage.get();
    const books = (data.books || []).filter(b => b.id !== id);
    Storage.save({ books });
  }

  function getAvailable(bookId) {
    const data = Storage.get();
    const book = getById(bookId);
    if (!book) return 0;
    const active = (data.loans || []).filter(l => l.bookId === bookId && l.status === 'active').length;
    return book.qty - active;
  }

  function search(query, category) {
    const q = (query || '').toLowerCase().trim();
    return getAll().filter(b => {
      const matchQ = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || (b.isbn || '').includes(q);
      const matchCat = !category || b.category === category;
      return matchQ && matchCat;
    });
  }

  return { searchByISBN, searchByTitle, getAll, getById, add, update, remove, getAvailable, search };
})();
