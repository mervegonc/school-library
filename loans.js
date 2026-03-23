// ============================================================
// LOANS — Borrow and return management
// ============================================================
const Loans = (() => {
  const fmt = d => d instanceof Date ? d.toISOString().split('T')[0] : d;
  const today = () => fmt(new Date());
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return fmt(x); };

  function getAll() {
    return (Storage.get().loans || []).slice().reverse();
  }

  function getActive() {
    return (Storage.get().loans || []).filter(l => l.status === 'active');
  }

  function getOverdue() {
    const t = today();
    return getActive().filter(l => l.dueDate < t);
  }

  function getById(id) {
    return (Storage.get().loans || []).find(l => l.id === id);
  }

  function borrow(studentId, bookId, dueDateOverride) {
    const data = Storage.get();
    const student = (data.students || []).find(s => s.id === studentId);
    const book = (data.books || []).find(b => b.id === bookId);
    if (!student) throw new Error('Öğrenci bulunamadı.');
    if (!book) throw new Error('Kitap bulunamadı.');

    const active = (data.loans || []).filter(l => l.studentId === studentId && l.status === 'active');
    if (active.length >= CONFIG.MAX_LOANS_PER_STUDENT) {
      throw new Error(`${student.name} ${student.surname} zaten ${active.length} kitap ödünçte (maksimum ${CONFIG.MAX_LOANS_PER_STUDENT}).`);
    }

    const available = Books.getAvailable(bookId);
    if (available <= 0) throw new Error(`"${book.title}" şu an müsait değil.`);

    const alreadyHas = active.find(l => l.bookId === bookId);
    if (alreadyHas) throw new Error(`${student.name} ${student.surname} bu kitabı zaten ödünçte.`);

    const loan = {
      id: Date.now(),
      studentId,
      bookId,
      borrowDate: today(),
      dueDate: dueDateOverride || addDays(new Date(), CONFIG.DEFAULT_LOAN_DAYS),
      returnDate: null,
      status: 'active',
    };
    const loans = data.loans || [];
    loans.push(loan);
    Storage.save({ loans });
    return loan;
  }

  function returnBook(loanId) {
    const loans = Storage.get().loans || [];
    const loan = loans.find(l => l.id === loanId);
    if (!loan) throw new Error('Ödünç kaydı bulunamadı.');
    if (loan.status !== 'active') throw new Error('Bu kitap zaten iade edilmiş.');
    loan.returnDate = today();
    loan.status = 'returned';
    Storage.save({ loans });
    return loan;
  }

  function markLost(loanId) {
    const loans = Storage.get().loans || [];
    const loan = loans.find(l => l.id === loanId);
    if (!loan) throw new Error('Ödünç kaydı bulunamadı.');
    loan.returnDate = today();
    loan.status = 'lost';
    Storage.save({ loans });
    return loan;
  }

  function isOverdue(loan) {
    return loan.status === 'active' && loan.dueDate < today();
  }

  function daysOverdue(loan) {
    if (!isOverdue(loan)) return 0;
    const a = new Date(loan.dueDate), b = new Date();
    return Math.round((b - a) / (1000 * 60 * 60 * 24));
  }

  return { getAll, getActive, getOverdue, getById, borrow, returnBook, markLost, isOverdue, daysOverdue };
})();
