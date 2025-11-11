const PASSWORD = 'Vanny1234';

const loginDiv = document.getElementById('loginDiv');
const appDiv = document.getElementById('appDiv');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const loginMsg = document.getElementById('loginMsg');

const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const fileList = document.getElementById('fileList');
const logoutBtn = document.getElementById('logoutBtn');

let db;

// IndexedDB setup
const request = indexedDB.open('FileDB', 1);
request.onupgradeneeded = function(e) {
  db = e.target.result;
  db.createObjectStore('files', { keyPath: 'name' });
};
request.onsuccess = function(e) {
  db = e.target.result;
  if (localStorage.getItem('loggedIn') === 'true') {
    showApp();
  }
};
request.onerror = function(e) {
  console.error('DB error', e);
};

// Login
loginBtn.addEventListener('click', () => {
  if (passwordInput.value === PASSWORD) {
    localStorage.setItem('loggedIn', 'true');
    showApp();
  } else {
    loginMsg.textContent = 'Incorrect password';
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('loggedIn');
  loginDiv.style.display = 'block';
  appDiv.style.display = 'none';
});

// Show app
function showApp() {
  loginDiv.style.display = 'none';
  appDiv.style.display = 'block';
  loadFiles();
}

// Upload
uploadBtn.addEventListener('click', () => {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function() {
    const transaction = db.transaction(['files'], 'readwrite');
    const store = transaction.objectStore('files');
    store.put({ name: file.name, data: reader.result });
    transaction.oncomplete = loadFiles;
  };
  reader.readAsDataURL(file);
});

// Load files
function loadFiles() {
  fileList.innerHTML = '';
  const transaction = db.transaction(['files'], 'readonly');
  const store = transaction.objectStore('files');
  store.openCursor().onsuccess = function(e) {
    const cursor = e.target.result;
    if (cursor) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = cursor.value.data;
      a.download = cursor.value.name;
      a.textContent = cursor.value.name;
      li.appendChild(a);
      fileList.appendChild(li);
      cursor.continue();
    }
  };
}