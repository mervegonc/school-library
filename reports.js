// ============================================================
// REPORTS — Statistics and analytics
// ============================================================
const Reports = (() => {

  function summary() {
    const data = Storage.get();
    const loans = data.loans || [];
    const books = data.books || [];
    const students = data.students || [];
    const active = loans.filter(l => l.status === 'active');
    const returned = loans.filter(l => l.status === 'returned');
    const overdue = active.filter(l => Loans.isOverdue(l));
    const onTime = returned.filter(l => l.returnDate <= l.dueDate).length;
    return {
      totalBooks: books.reduce((s, b) => s + (b.qty || 1), 0),
      uniqueTitles: books.length,
      totalStudents: students.length,
      activeLoans: active.length,
      overdueLoans: overdue.length,
      totalReturned: returned.length,
      onTimeRate: returned.length ? Math.round(onTime / returned.length * 100) : 100,
      totalLoans: loans.length,
    };
  }

  function topBooks(limit = 10) {
    const loans = Storage.get().loans || [];
    const counts = {};
    loans.forEach(l => { counts[l.bookId] = (counts[l.bookId] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id, count]) => ({ book: Books.getById(parseInt(id)), count }))
      .filter(x => x.book);
  }

  function topReaders(limit = 10) {
    const loans = Storage.get().loans || [];
    const counts = {};
    loans.forEach(l => { counts[l.studentId] = (counts[l.studentId] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id, count]) => ({ student: Students.getById(parseInt(id)), count }))
      .filter(x => x.student);
  }

  function byClass() {
    const loans = Storage.get().loans || [];
    const students = Storage.get().students || [];
    const counts = {};
    loans.forEach(l => {
      const s = students.find(st => st.id === l.studentId);
      if (s && s.class) counts[s.class] = (counts[s.class] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }

  function byCategory() {
    const loans = Storage.get().loans || [];
    const counts = {};
    loans.forEach(l => {
      const b = Books.getById(l.bookId);
      if (b) counts[b.category] = (counts[b.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }

  function monthlyActivity() {
    const loans = Storage.get().loans || [];
    const counts = {};
    loans.forEach(l => {
      const month = l.borrowDate.substring(0, 7);
      counts[month] = (counts[month] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
  }

  return { summary, topBooks, topReaders, byClass, byCategory, monthlyActivity };
})();
