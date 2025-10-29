// auth.js - handles users, login/logout and simple persistence to localStorage
const Auth = (function(){
  const KEY_USERS = 'abu_users_v1';
  const KEY_SESSION = 'abu_session_v1';
  const KEY_ATT = 'abu_attendance_v1';
  const KEY_MARKS = 'abu_marks_v1';

  // initial users
  const initialUsers = [
    {username:'freedom', password:'freedom4498', role:'admin', name:'Admin User'},
    {username:'mrteacher', password:'teach123', role:'teacher', name:'Mr Teacher'},
    {username:'student1', password:'stud123', role:'Student One'}
  ];

  function loadUsers(){
    const raw = localStorage.getItem(KEY_USERS);
    if(!raw){
      localStorage.setItem(KEY_USERS, JSON.stringify(initialUsers));
      return initialUsers.slice();
    }
    try { return JSON.parse(raw); } catch(e){ localStorage.setItem(KEY_USERS, JSON.stringify(initialUsers)); return initialUsers.slice(); }
  }
  function saveUsers(users){ localStorage.setItem(KEY_USERS, JSON.stringify(users)); }

  function getAllUsers(){ return loadUsers(); }

  function findUser(username){ return loadUsers().find(u=>u.username===username); }

  function login(username,password){
    if(!username || !password) return {success:false, message:'Enter username and password'};
    const u = findUser(username);
    if(!u) return {success:false, message:'User not found'};
    if(u.password !== password) return {success:false, message:'Incorrect password'};
    // set session
    const session = {username:u.username, role:u.role, name:u.name || ''};
    localStorage.setItem(KEY_SESSION, JSON.stringify(session));
    return {success:true, role:u.role};
  }

  function logout(){ localStorage.removeItem(KEY_SESSION); }

  function current(){ 
    const s = localStorage.getItem(KEY_SESSION);
    return s ? JSON.parse(s) : null;
  }

  function protect(role){
    const cur = current();
    if(!cur){ window.location = 'login.html'; return; }
    if(role && cur.role !== role){ 
      // redirect based on role
      if(cur.role==='admin') window.location='admin.html';
      else if(cur.role==='teacher') window.location='teacher.html';
      else window.location='student.html';
    }
  }

  function register({name,username,password,role}){
    if(!username || !password) return {success:false, message:'username and password required'};
    const users = loadUsers();
    if(users.find(u=>u.username===username)) return {success:false, message:'username exists'};
    users.push({username, password, role, name});
    saveUsers(users);
    return {success:true};
  }

  function updateProfile(username, data){
    const users = loadUsers();
    const idx = users.findIndex(u=>u.username===username);
    if(idx===-1) return {success:false};
    users[idx] = {...users[idx], ...data};
    saveUsers(users);
    // if updating current session name, refresh it
    const cur = current();
    if(cur && cur.username===username){
      localStorage.setItem(KEY_SESSION, JSON.stringify({...cur, ...data}));
    }
    return {success:true};
  }

  // Attendance functions - stored as array of {student,date,status,by}
  function saveAttendance(student, date, status){
    const raw = localStorage.getItem(KEY_ATT);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({student, date, status, by: current() ? current().username : 'unknown'});
    localStorage.setItem(KEY_ATT, JSON.stringify(arr));
  }
  function getAttendanceForUser(student){
    const raw = localStorage.getItem(KEY_ATT);
    const arr = raw ? JSON.parse(raw) : [];
    return arr.filter(r=>r.student===student);
  }

  // Marks functions - stored as array of {student,subject,score,by}
  function saveMark(student, subject, score){
    const raw = localStorage.getItem(KEY_MARKS);
    const arr = raw ? JSON.parse(raw) : [];
    // replace existing
    const idx = arr.findIndex(a=>a.student===student && a.subject===subject);
    if(idx>=0) arr[idx] = {student, subject, score, by: current() ? current().username : 'unknown'};
    else arr.push({student, subject, score, by: current() ? current().username : 'unknown'});
    localStorage.setItem(KEY_MARKS, JSON.stringify(arr));
  }
  function getMarksForUser(student){
    const raw = localStorage.getItem(KEY_MARKS);
    const arr = raw ? JSON.parse(raw) : [];
    return arr.filter(r=>r.student===student);
  }

  return {
    login: function(u,p){ return login(u,p); },
    logout: function(){ logout(); },
    current: function(){ return current(); },
    protect: function(role){ protect(role); },
    register: function(obj){ return register(obj); },
    getAllUsers: function(){ return getAllUsers(); },
    saveAttendance: function(s,d,status){ saveAttendance(s,d,status); },
    getAttendanceForUser: function(s){ return getAttendanceForUser(s); },
    saveMark: function(s,sub,score){ saveMark(s,sub,score); },
    getMarksForUser: function(s){ return getMarksForUser(s); },
    updateProfile: function(username,data){ return updateProfile(username,data); }
  };
})();