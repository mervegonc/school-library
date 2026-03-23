// ============================================================
// AUTH — Login, logout, role management
// ============================================================
const Auth = (() => {
  const LS_USER = 'kutuphane_user';
  let _current = null;

  function init() {
    const saved = localStorage.getItem(LS_USER);
    if (saved) {
      try { _current = JSON.parse(saved); } catch(e) {}
    }
    return _current;
  }

  function login(username, password) {
    const data = Storage.get();
    const users = data.users || [];
    // Also allow student login by student number
    const student = (data.students || []).find(s => s.no === username && s.password === password);
    if (student) {
      _current = { id: student.id, username: student.no, name: student.name + ' ' + student.surname, role: 'student' };
      localStorage.setItem(LS_USER, JSON.stringify(_current));
      return _current;
    }
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      _current = user;
      localStorage.setItem(LS_USER, JSON.stringify(_current));
      return user;
    }
    return null;
  }

  function logout() {
    _current = null;
    localStorage.removeItem(LS_USER);
  }

  function current() { return _current; }
  function role() { return _current ? _current.role : null; }
  function is(r) { return _current && _current.role === r; }
  function isLibrarian() { return is('librarian'); }
  function canEdit() { return is('librarian'); }

  return { init, login, logout, current, role, is, isLibrarian, canEdit };
})();
