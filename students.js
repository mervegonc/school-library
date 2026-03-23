// ============================================================
// STUDENTS — Student records management
// ============================================================
const Students = (() => {

  function getAll() {
    return (Storage.get().students || []).sort((a, b) =>
      (a.surname + a.name).localeCompare(b.surname + b.name, 'tr')
    );
  }

  function getById(id) {
    return (Storage.get().students || []).find(s => s.id === id);
  }

  function add(data) {
    const students = Storage.get().students || [];
    if (students.find(s => s.no === data.no)) {
      throw new Error(`${data.no} numaralı öğrenci zaten kayıtlı.`);
    }
    const student = {
      id: Date.now(),
      name: data.name.trim(),
      surname: data.surname.trim(),
      no: data.no.trim(),
      class: data.class || '',
      email: data.email || '',
      phone: data.phone || '',
      password: data.no, // default password = student number
      joinDate: new Date().toISOString().split('T')[0],
    };
    students.push(student);
    Storage.save({ students });
    return student;
  }

  function update(id, fields) {
    const students = Storage.get().students || [];
    const idx = students.findIndex(s => s.id === id);
    if (idx === -1) return null;
    students[idx] = { ...students[idx], ...fields };
    Storage.save({ students });
    return students[idx];
  }

  function remove(id) {
    const data = Storage.get();
    const hasActive = (data.loans || []).some(l => l.studentId === id && l.status === 'active');
    if (hasActive) throw new Error('Aktif ödüncü olan öğrenci silinemez.');
    const students = (data.students || []).filter(s => s.id !== id);
    Storage.save({ students });
  }

  function search(query) {
    const q = (query || '').toLowerCase().trim();
    return getAll().filter(s => {
      return !q ||
        (s.name + ' ' + s.surname).toLowerCase().includes(q) ||
        s.no.includes(q) ||
        (s.class || '').toLowerCase().includes(q);
    });
  }

  function getActiveLoans(studentId) {
    return (Storage.get().loans || []).filter(l => l.studentId === studentId && l.status === 'active');
  }

  function getTotalLoans(studentId) {
    return (Storage.get().loans || []).filter(l => l.studentId === studentId).length;
  }

  return { getAll, getById, add, update, remove, search, getActiveLoans, getTotalLoans };
})();
