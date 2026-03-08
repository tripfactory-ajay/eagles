// ============================================================
// EAGLES APP - Main Application
// Firebase Firestore + Cloudinary image uploads
// ============================================================

// ---- Cloudinary config ----
const CLOUDINARY_CLOUD = 'dmpb99wde';
const CLOUDINARY_PRESET = 'qrlcory1';

// ---- Firebase SDK (loaded via CDN in index.html) ----
let db, auth;
let currentUser = null;
let unsubscribeFeed = null;

// ---- Family members ----
const FAMILY = {
  "demo-raj-001":     { name: "Raj Kumar",     role: "Dad",      avatar: "R", color: "#1a3a5c" },
  "demo-fiona-002":   { name: "Fiona Kumar",   role: "Mum",      avatar: "F", color: "#c8763a" },
  "demo-natasha-003": { name: "Natasha Kumar", role: "Daughter", avatar: "N", color: "#2d7d5a" },
  "demo-tanya-004":   { name: "Tanya Kumar",   role: "Daughter", avatar: "T", color: "#7d2d6b" }
};

// ---- Activity icons & labels ----
const ACTIVITIES = [
  { id: "golf",      icon: "⛳", label: "Golf" },
  { id: "padel",     icon: "🎾", label: "Padel" },
  { id: "football",  icon: "⚽", label: "Football" },
  { id: "beach",     icon: "🏖️", label: "Beach" },
  { id: "travel",    icon: "✈️", label: "Travel" },
  { id: "food",      icon: "🍽️", label: "Food" },
  { id: "adventure", icon: "🧗", label: "Adventure" },
  { id: "family",    icon: "👨‍👩‍👧‍👧", label: "Family" }
];

const EMOTIONS = [
  { id: "happy",   icon: "😊", label: "Happy" },
  { id: "loved",   icon: "❤️", label: "Loved it" },
  { id: "fun",     icon: "🎉", label: "Fun" },
  { id: "amazing", icon: "🤩", label: "Amazing" },
  { id: "family",  icon: "🥰", label: "Family Moment" }
];

// Demo seed memories for fresh Firestore
const SEED_MEMORIES = [
  {
    uid: "demo-raj-001",
    photoURL: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    date: "2025-03-15", location: "Dubai, UAE",
    description: "Perfect round at Emirates Golf Club this morning. The course was immaculate and the weather just right! 🏌️",
    activity: "golf", emotion: "amazing",
    likes: ["demo-fiona-002","demo-natasha-003"],
    comments: [{ uid:"demo-fiona-002", text:"So proud! What was your score? 😍", timestamp: new Date("2025-03-15T11:30:00") }],
    timestamp: new Date("2025-03-15T09:00:00")
  },
  {
    uid: "demo-fiona-002",
    photoURL: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    date: "2025-03-10", location: "Dubai Marina, UAE",
    description: "Dubai skyline from the Marina – absolutely breathtaking at sunset. This city never stops amazing me 🌇",
    activity: "travel", emotion: "amazing",
    likes: ["demo-raj-001","demo-natasha-003","demo-tanya-004"],
    comments: [{ uid:"demo-tanya-004", text:"Miss this so much! 😭", timestamp: new Date("2025-03-10T20:00:00") }],
    timestamp: new Date("2025-03-10T19:00:00")
  },
  {
    uid: "demo-natasha-003",
    photoURL: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    date: "2025-02-22", location: "Jumeirah Beach, Dubai",
    description: "Beach day with the family – couldn't have asked for more perfect weather 🌊☀️ These are the days I live for.",
    activity: "beach", emotion: "loved",
    likes: ["demo-raj-001","demo-fiona-002"],
    comments: [],
    timestamp: new Date("2025-02-22T15:00:00")
  },
  {
    uid: "demo-raj-001",
    photoURL: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
    date: "2025-02-14", location: "Nad Al Sheba, Dubai",
    description: "Padel tournament today with the boys. Won the final in a tie-break – absolutely buzzing! 🎾🔥",
    activity: "padel", emotion: "amazing",
    likes: ["demo-fiona-002","demo-tanya-004"],
    comments: [{ uid:"demo-natasha-003", text:"Dad the champion! 🏆", timestamp: new Date("2025-02-14T18:00:00") }],
    timestamp: new Date("2025-02-14T16:00:00")
  },
  {
    uid: "demo-fiona-002",
    photoURL: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    date: "2025-02-08", location: "Nobu, Dubai",
    description: "Family dinner at Nobu – the black cod was incredible as always. So grateful for these precious moments together 🍽️",
    activity: "food", emotion: "family",
    likes: ["demo-raj-001","demo-natasha-003","demo-tanya-004"],
    comments: [{ uid:"demo-raj-001", text:"Best night of the year so far!", timestamp: new Date("2025-02-08T22:00:00") }],
    timestamp: new Date("2025-02-08T21:00:00")
  },
  {
    uid: "demo-tanya-004",
    photoURL: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&q=80",
    date: "2025-01-30", location: "Marbella, Spain",
    description: "Holiday breakfast in the sunshine – fresh pastries, coffee, and the whole family together. Life is good! ☀️🥐",
    activity: "travel", emotion: "happy",
    likes: ["demo-raj-001","demo-fiona-002","demo-natasha-003"],
    comments: [],
    timestamp: new Date("2025-01-30T09:30:00")
  },
  {
    uid: "demo-natasha-003",
    photoURL: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&q=80",
    date: "2025-01-20", location: "London, UK",
    description: "Weekend in London! Borough Market, the Thames, and amazing food everywhere. City life hits different 🇬🇧",
    activity: "travel", emotion: "fun",
    likes: ["demo-tanya-004"],
    comments: [{ uid:"demo-fiona-002", text:"Wish I was there! 😍", timestamp: new Date("2025-01-20T16:00:00") }],
    timestamp: new Date("2025-01-20T14:00:00")
  },
  {
    uid: "demo-tanya-004",
    photoURL: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    date: "2025-01-15", location: "Dubai, UAE",
    description: "Family movie night – popcorn, blankets, and all four of us on the sofa. These quiet nights are everything 🎬🍿",
    activity: "family", emotion: "family",
    likes: ["demo-raj-001","demo-fiona-002","demo-natasha-003"],
    comments: [{ uid:"demo-natasha-003", text:"The best! Do this every week! 😂", timestamp: new Date("2025-01-15T21:00:00") }],
    timestamp: new Date("2025-01-15T20:00:00")
  },
  {
    uid: "demo-raj-001",
    photoURL: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80",
    date: "2025-01-05", location: "Dubai Hills, UAE",
    description: "Early morning football with the lads. Legs are gone but the spirit is strong 💪⚽ Nothing like a Saturday kickabout.",
    activity: "football", emotion: "fun",
    likes: ["demo-fiona-002"],
    comments: [],
    timestamp: new Date("2025-01-05T08:00:00")
  },
  {
    uid: "demo-fiona-002",
    photoURL: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
    date: "2024-12-28", location: "Swiss Alps",
    description: "New Year trip to the Alps! The snow, the mountains, the crisp air – absolute magic. Family adventure mode ✅🏔️",
    activity: "adventure", emotion: "amazing",
    likes: ["demo-raj-001","demo-natasha-003","demo-tanya-004"],
    comments: [
      { uid:"demo-natasha-003", text:"Best trip EVER!", timestamp: new Date("2024-12-28T17:00:00") },
      { uid:"demo-tanya-004", text:"Can we go back?! ❄️", timestamp: new Date("2024-12-28T18:00:00") }
    ],
    timestamp: new Date("2024-12-28T16:00:00")
  }
];

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  setupSplash();
  setupLogin();
  setupNav();
  setupAddMemory();
  setupCalendar();
  setupActivities();
  setupInstallBanner();
  registerServiceWorker();
});

function initFirebase() {
  try {
    const app = firebase.initializeApp(firebaseConfig);
    db      = firebase.firestore();
    auth    = firebase.auth();


    auth.onAuthStateChanged(user => {
      if (user) {
        currentUser = user;
        onLoggedIn();
      }
    });
  } catch(e) {
    console.error('Firebase init error:', e);
    showToast('Firebase connection error');
  }
}

// ============================================================
// SPLASH
// ============================================================
function setupSplash() {
  showScreen('splash');
  document.getElementById('btn-enter').addEventListener('click', () => showScreen('login'));
}

// ============================================================
// LOGIN
// ============================================================
function setupLogin() {
  document.getElementById('btn-login').addEventListener('click', handleLogin);
  document.getElementById('btn-demo').addEventListener('click', handleDemoLogin);
  document.getElementById('login-email').addEventListener('keydown', e => { if(e.key==='Enter') handleLogin(); });
  document.getElementById('login-password').addEventListener('keydown', e => { if(e.key==='Enter') handleLogin(); });
}

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;
  if (!email || !pass) { showLoginError('Please enter email and password'); return; }
  showLoading(true);
  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch(e) {
    showLoading(false);
    showLoginError('Invalid credentials. Try demo login below.');
  }
}

async function handleDemoLogin() {
  showLoading(true);
  try {
    await auth.signInWithEmailAndPassword(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
  } catch(e) {
    // Create demo account if it doesn't exist
    try {
      await auth.createUserWithEmailAndPassword(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
      await auth.currentUser.updateProfile({ displayName: "Raj Kumar" });
    } catch(e2) {
      showLoading(false);
      showLoginError('Demo login failed. Check Firebase Auth settings.');
      return;
    }
  }
}

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg;
  el.style.display = 'block';
}

// ============================================================
// POST LOGIN
// ============================================================
async function onLoggedIn() {
  showLoading(false);
  showScreen('app');
  updateHeaderAvatar();

  // Seed demo data if collection is empty
  await ensureDemoData();

  // Load home feed
  showPage('home');
  loadFeed();
  loadCalendar();
}

async function ensureDemoData() {
  try {
    const snap = await db.collection('eagles_memories').limit(1).get();
    if (snap.empty) {
      showToast('Setting up family memories…');
      const batch = db.batch();
      SEED_MEMORIES.forEach(m => {
        const ref = db.collection('eagles_memories').doc();
        batch.set(ref, m);
      });
      await batch.commit();
      showToast('✅ Family memories loaded!');
    }
  } catch(e) {
    console.error('Seed error:', e);
  }
}

function updateHeaderAvatar() {
  const info = getFamilyInfo(currentUser?.uid);
  const el = document.getElementById('header-avatar');
  el.textContent = info.avatar;
  el.style.background = `linear-gradient(135deg, ${info.color}, #c9a84c)`;
}

function getFamilyInfo(uid) {
  return FAMILY[uid] || { name: currentUser?.displayName || "User", role: "Member", avatar: "U", color: "#1a3a5c" };
}

// ============================================================
// NAVIGATION
// ============================================================
function setupNav() {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      showPage(page);
    });
  });
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${name}`)?.classList.add('active');
  if (name === 'home') loadFeed();
  if (name === 'activities') renderActivities();
  if (name === 'profile') renderProfile();
  if (name === 'calendar') loadCalendar();
}

// ============================================================
// HOME FEED
// ============================================================
function loadFeed() {
  if (unsubscribeFeed) unsubscribeFeed();
  const container = document.getElementById('memory-feed');
  container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🦅</div><p>Loading memories…</p></div>';

  unsubscribeFeed = db.collection('eagles_memories')
    .orderBy('timestamp', 'desc')
    .onSnapshot(snap => {
      if (snap.empty) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📷</div><h3>No memories yet</h3><p>Add your first family memory!</p></div>';
        return;
      }
      container.innerHTML = '';
      snap.docs.forEach(doc => {
        container.appendChild(buildMemoryCard(doc.id, doc.data()));
      });
    }, err => console.error('Feed error:', err));
}

function buildMemoryCard(id, m) {
  const info = FAMILY[m.uid] || { name: m.uid, role:'Member', avatar:'U', color:'#1a3a5c' };
  const activity = ACTIVITIES.find(a => a.id === m.activity) || { icon:'📍', label: m.activity || '' };
  const emotion  = EMOTIONS.find(e => e.id === m.emotion) || { icon:'😊' };
  const likes    = m.likes || [];
  const comments = m.comments || [];
  const liked    = likes.includes(currentUser?.uid);
  const dateStr  = m.date ? new Date(m.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '';

  const card = document.createElement('div');
  card.className = 'memory-card';
  card.innerHTML = `
    <div class="card-header">
      <div class="card-avatar" style="background:${info.color}">${info.avatar}</div>
      <div class="card-user-info">
        <div class="card-user-name">${info.name}</div>
        <div class="card-meta">
          <span>${info.role}</span>
          <span>·</span>
          <span>${dateStr}</span>
          <span class="card-activity-badge">${activity.icon} ${activity.label}</span>
        </div>
      </div>
    </div>
    ${m.photoURL
      ? `<img class="card-photo" src="${m.photoURL}" alt="Memory photo" loading="lazy" onerror="this.style.display='none'">`
      : `<div class="card-photo-placeholder">${activity.icon}</div>`}
    <div class="card-body">
      <div class="card-emotion">${emotion.icon}</div>
      <div class="card-desc">${m.description || ''}</div>
      ${m.location ? `<div class="card-location">📍 ${m.location}</div>` : ''}
    </div>
    <div class="card-actions">
      <button class="card-action-btn like-btn ${liked?'liked':''}" data-id="${id}">
        <span>${liked?'❤️':'🤍'}</span> ${likes.length} Like${likes.length!==1?'s':''}
      </button>
      <button class="card-action-btn comment-toggle-btn" data-id="${id}">
        <span>💬</span> ${comments.length} Comment${comments.length!==1?'s':''}
      </button>
    </div>
    <div class="card-comments" id="comments-${id}" style="display:none">
      ${comments.map(c => {
        const ci = FAMILY[c.uid] || {name: c.uid};
        return `<div class="comment-item"><span class="comment-author">${ci.name}:</span><span class="comment-text"> ${c.text}</span></div>`;
      }).join('')}
      <div class="comment-input-row">
        <input class="comment-input" placeholder="Add a comment…" id="comment-input-${id}">
        <button class="comment-send" data-id="${id}">➤</button>
      </div>
    </div>`;

  // Like
  card.querySelector('.like-btn').addEventListener('click', () => toggleLike(id, likes));

  // Toggle comments
  card.querySelector('.comment-toggle-btn').addEventListener('click', () => {
    const el = document.getElementById(`comments-${id}`);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  });

  // Post comment
  card.querySelector('.comment-send').addEventListener('click', () => postComment(id));
  card.querySelector(`#comment-input-${id}`).addEventListener('keydown', e => { if(e.key==='Enter') postComment(id); });

  return card;
}

async function toggleLike(id, currentLikes) {
  if (!currentUser) return;
  const uid = currentUser.uid;
  const liked = currentLikes.includes(uid);
  const newLikes = liked ? currentLikes.filter(l => l !== uid) : [...currentLikes, uid];
  try {
    await db.collection('eagles_memories').doc(id).update({ likes: newLikes });
  } catch(e) { showToast('Could not update like'); }
}

async function postComment(id) {
  const input = document.getElementById(`comment-input-${id}`);
  const text = input?.value?.trim();
  if (!text || !currentUser) return;
  input.value = '';
  try {
    const doc = await db.collection('eagles_memories').doc(id).get();
    const comments = doc.data()?.comments || [];
    comments.push({ uid: currentUser.uid, text, timestamp: new Date() });
    await db.collection('eagles_memories').doc(id).update({ comments });
    showToast('💬 Comment posted!');
  } catch(e) { showToast('Could not post comment'); }
}

// ============================================================
// ADD MEMORY
// ============================================================
let selectedActivity = null;
let selectedEmotion  = null;
let uploadedPhotoURL = null;
let uploadedFile     = null;

function setupAddMemory() {
  // Activity chips
  const actGrid = document.getElementById('activity-chips');
  ACTIVITIES.forEach(a => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.innerHTML = `${a.icon} ${a.label}`;
    chip.addEventListener('click', () => {
      actGrid.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedActivity = a.id;
    });
    actGrid.appendChild(chip);
  });

  // Emotion chips
  const emoGrid = document.getElementById('emotion-chips');
  EMOTIONS.forEach(e => {
    const chip = document.createElement('div');
    chip.className = 'chip emotion-chip';
    chip.innerHTML = `${e.icon} ${e.label}`;
    chip.addEventListener('click', () => {
      emoGrid.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedEmotion = e.id;
    });
    emoGrid.appendChild(chip);
  });

  // Photo upload
  document.getElementById('photo-upload-area').addEventListener('click', () => {
    document.getElementById('photo-input').click();
  });
  document.getElementById('photo-input').addEventListener('change', handlePhotoSelect);

  // Submit
  document.getElementById('btn-submit-memory').addEventListener('click', submitMemory);

  // Set today's date
  document.getElementById('memory-date').value = new Date().toISOString().split('T')[0];
}

function handlePhotoSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  uploadedFile = file;
  const reader = new FileReader();
  reader.onload = ev => {
    const area = document.getElementById('photo-upload-area');
    area.innerHTML = `<img src="${ev.target.result}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit">`;
    uploadedPhotoURL = ev.target.result; // temp preview
  };
  reader.readAsDataURL(file);
}

async function submitMemory() {
  const date     = document.getElementById('memory-date').value;
  const location = document.getElementById('memory-location').value.trim();
  const desc     = document.getElementById('memory-desc').value.trim();

  if (!desc) { showToast('Please add a description'); return; }
  if (!selectedActivity) { showToast('Please choose an activity'); return; }
  if (!selectedEmotion)  { showToast('Please choose an emotion'); return; }

  const btn = document.getElementById('btn-submit-memory');
  btn.classList.add('loading');
  btn.textContent = 'Saving…';
  showLoading(true);

  let photoURL = null;

  // Upload photo to Cloudinary if selected
  if (uploadedFile) {
    try {
      showToast('📤 Uploading photo…');
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('upload_preset', CLOUDINARY_PRESET);
      formData.append('folder', 'eagles_app');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        photoURL = data.secure_url;
      } else {
        showToast('Photo upload failed – saving without photo');
      }
    } catch(e) {
      console.error('Cloudinary upload error:', e);
      showToast('Photo upload failed – saving without photo');
    }
  }

  const memory = {
    uid: currentUser.uid,
    photoURL,
    date,
    location,
    description: desc,
    activity: selectedActivity,
    emotion: selectedEmotion,
    likes: [],
    comments: [],
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection('eagles_memories').add(memory);
    showToast('🦅 Memory saved!');
    resetAddForm();
    // Nav back to home
    document.querySelector('.nav-item[data-page="home"]').click();
  } catch(e) {
    showToast('Error saving memory – try again');
    console.error(e);
  } finally {
    showLoading(false);
    btn.classList.remove('loading');
    btn.innerHTML = '🦅 Save Memory';
  }
}

function resetAddForm() {
  selectedActivity = null;
  selectedEmotion  = null;
  uploadedPhotoURL = null;
  uploadedFile     = null;
  document.getElementById('memory-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('memory-location').value = '';
  document.getElementById('memory-desc').value = '';
  document.getElementById('photo-input').value = '';
  document.getElementById('photo-upload-area').innerHTML = `
    <div class="photo-upload-icon">📷</div>
    <div class="photo-upload-text">Tap to add a photo</div>`;
  document.querySelectorAll('#activity-chips .chip, #emotion-chips .chip').forEach(c => c.classList.remove('selected'));
}

// ============================================================
// CALENDAR
// ============================================================
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth();
let memoryDates = new Set();

function setupCalendar() {
  document.getElementById('cal-prev').addEventListener('click', () => { calMonth--; if(calMonth<0){calMonth=11;calYear--;} renderCalendar(); });
  document.getElementById('cal-next').addEventListener('click', () => { calMonth++; if(calMonth>11){calMonth=0;calYear++;} renderCalendar(); });
}

async function loadCalendar() {
  try {
    const snap = await db.collection('eagles_memories').get();
    memoryDates = new Set(snap.docs.map(d => d.data().date));
    renderCalendar();
  } catch(e) { renderCalendar(); }
}

function renderCalendar() {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('cal-month-label').textContent = `${months[calMonth]} ${calYear}`;

  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => {
    const el = document.createElement('div');
    el.className = 'cal-day-label';
    el.textContent = d;
    grid.appendChild(el);
  });

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const today = new Date();

  for (let i=0; i<firstDay; i++) {
    const el = document.createElement('div'); el.className = 'cal-day empty'; grid.appendChild(el);
  }
  for (let d=1; d<=daysInMonth; d++) {
    const el = document.createElement('div');
    el.className = 'cal-day';
    el.textContent = d;
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if (today.getDate()===d && today.getMonth()===calMonth && today.getFullYear()===calYear) el.classList.add('today');
    if (memoryDates.has(dateStr)) el.classList.add('has-memory');
    el.addEventListener('click', () => {
      grid.querySelectorAll('.cal-day').forEach(x=>x.classList.remove('selected'));
      el.classList.add('selected');
      loadDayMemories(dateStr);
    });
    grid.appendChild(el);
  }
}

async function loadDayMemories(dateStr) {
  const container = document.getElementById('cal-memories-list');
  const title = document.getElementById('cal-memories-title');
  const formatted = new Date(dateStr+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
  title.textContent = formatted;

  try {
    const snap = await db.collection('eagles_memories').where('date','==',dateStr).get();
    container.innerHTML = '';
    if (snap.empty) {
      container.innerHTML = '<p style="color:var(--grey);font-size:14px;text-align:center;padding:20px 0">No memories on this day</p>';
      return;
    }
    snap.docs.forEach(doc => {
      const m = doc.data();
      const info = FAMILY[m.uid] || {name:'Family',avatar:'🦅',color:'#1a3a5c'};
      const act  = ACTIVITIES.find(a=>a.id===m.activity)||{icon:'📍'};
      const mini = document.createElement('div');
      mini.className = 'mini-card';
      mini.innerHTML = `
        ${m.photoURL
          ? `<img class="mini-card-photo" src="${m.photoURL}" loading="lazy">`
          : `<div class="mini-card-photo">${act.icon}</div>`}
        <div class="mini-card-info">
          <div class="mini-card-title">${info.name}</div>
          <div class="mini-card-sub">${m.location||''} ${m.location&&m.description?'·':''} ${(m.description||'').substring(0,50)}${m.description?.length>50?'…':''}</div>
        </div>`;
      container.appendChild(mini);
    });
  } catch(e) { container.innerHTML = '<p style="color:var(--grey);text-align:center">Could not load memories</p>'; }
}

// ============================================================
// ACTIVITIES
// ============================================================
let activeFilter = 'all';

function setupActivities() {
  // Filters rendered when page opens
}

async function renderActivities() {
  const filterRow = document.getElementById('activity-filter-row');
  filterRow.innerHTML = '';

  const all = document.createElement('div');
  all.className = `filter-chip ${activeFilter==='all'?'active':''}`;
  all.innerHTML = '🌟 All';
  all.addEventListener('click', () => { activeFilter='all'; renderActivities(); });
  filterRow.appendChild(all);

  ACTIVITIES.forEach(a => {
    const chip = document.createElement('div');
    chip.className = `filter-chip ${activeFilter===a.id?'active':''}`;
    chip.innerHTML = `${a.icon} ${a.label}`;
    chip.addEventListener('click', () => { activeFilter=a.id; renderActivities(); });
    filterRow.appendChild(chip);
  });

  const grid = document.getElementById('activities-grid');
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--grey)">Loading…</div>';

  try {
    let query = db.collection('eagles_memories').orderBy('timestamp','desc');
    if (activeFilter !== 'all') query = query.where('activity','==',activeFilter);
    const snap = await query.get();

    grid.innerHTML = '';
    if (snap.empty) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">📷</div><p>No memories for this activity yet</p></div>';
      return;
    }
    snap.docs.forEach(doc => {
      const m = doc.data();
      const info = FAMILY[m.uid]||{name:'Family',color:'#1a3a5c'};
      const act  = ACTIVITIES.find(a=>a.id===m.activity)||{icon:'📍',label:m.activity};
      const card = document.createElement('div');
      card.className = 'activity-card';
      card.innerHTML = `
        ${m.photoURL
          ? `<img class="activity-card-photo" src="${m.photoURL}" loading="lazy" style="object-fit:cover">`
          : `<div class="activity-card-photo">${act.icon}</div>`}
        <div class="activity-card-body">
          <div class="activity-card-title">${info.name}</div>
          <div class="activity-card-sub">${act.icon} ${act.label} · ${m.date||''}</div>
        </div>`;
      grid.appendChild(card);
    });
  } catch(e) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--grey)">Could not load activities</div>';
  }
}

// ============================================================
// PROFILE
// ============================================================
async function renderProfile() {
  if (!currentUser) return;
  const info = getFamilyInfo(currentUser.uid);

  document.getElementById('profile-avatar').textContent = info.avatar;
  document.getElementById('profile-avatar').style.background = `linear-gradient(135deg, ${info.color}, #c9a84c)`;
  document.getElementById('profile-name').textContent = info.name;
  document.getElementById('profile-role').textContent = info.role;

  try {
    const snap = await db.collection('eagles_memories').get();
    const all = snap.docs.map(d=>({id:d.id,...d.data()}));
    const mine = all.filter(m=>m.uid===currentUser.uid);
    const myLikes = all.reduce((sum,m)=>sum+((m.likes||[]).filter(l=>l===currentUser.uid).length),0);
    const totalLikesReceived = mine.reduce((sum,m)=>sum+(m.likes||[]).length,0);

    document.getElementById('stat-memories').textContent = mine.length;
    document.getElementById('stat-likes').textContent = totalLikesReceived;
    document.getElementById('stat-liked').textContent = myLikes;

    // Family roster
    const fam = document.getElementById('family-roster');
    fam.innerHTML = '';
    Object.entries(FAMILY).forEach(([uid, f]) => {
      const memberMems = all.filter(m=>m.uid===uid);
      const row = document.createElement('div');
      row.className = 'family-member-row';
      row.innerHTML = `
        <div class="fam-avatar" style="background:${f.color}">${f.avatar}</div>
        <div class="fam-info">
          <div class="fam-name">${f.name}</div>
          <div class="fam-role">${f.role}</div>
        </div>
        <div class="fam-count">${memberMems.length} memories</div>`;
      fam.appendChild(row);
    });
  } catch(e) { console.error('Profile load error:', e); }
}

// ============================================================
// HELPERS
// ============================================================
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(name)?.classList.add('active');
}

function showLoading(show) {
  document.getElementById('loading-overlay').classList.toggle('show', show);
}

function showToast(msg, duration=2500) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ============================================================
// PWA INSTALL
// ============================================================
let deferredInstall = null;

function setupInstallBanner() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstall = e;
    const banner = document.getElementById('install-banner');
    banner.classList.add('show');
    document.getElementById('btn-install').addEventListener('click', () => {
      deferredInstall.prompt();
      banner.classList.remove('show');
    });
    document.getElementById('btn-dismiss-install').addEventListener('click', () => {
      banner.classList.remove('show');
    });
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(e => console.log('SW:', e));
  }
}

// Logout
function logout() {
  auth.signOut().then(() => {
    currentUser = null;
    if (unsubscribeFeed) unsubscribeFeed();
    showScreen('splash');
    showToast('Signed out 👋');
  });
}
