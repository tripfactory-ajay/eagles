// ============================================================
// EAGLES V7 — Kumar Family Memory App
// Fixes: demo-only login, camera/gallery split, avatar photo fill,
//        spinner stuck on upload, install dialog + permissions flow
// ============================================================

const CLOUDINARY_CLOUD  = 'dmpb99wde';
const CLOUDINARY_PRESET = 'qrlcory1';
const MAX_VIDEO_SECS    = 20;

let db, auth, currentUser = null, feedUnsub = null, deferredInstall = null;

const AVATAR_CHARS = ['🦅','🦁','🐯','🦊','🐻','🐼','🦋','🌟','🏄','⛷️','🎸','📸','🌍','🏆','🎯','🦸','🧳','🌴','🎭','🐬','🌊','🎨'];

const FAMILY = {
  'demo-raj-001':     { name:'Raj Kumar',     short:'Raj',     role:'Dad',      av:'R', color:'#1a3a5c' },
  'demo-fiona-002':   { name:'Fiona Kumar',   short:'Fiona',   role:'Mum',      av:'F', color:'#c8763a' },
  'demo-natasha-003': { name:'Natasha Kumar', short:'Natasha', role:'Daughter', av:'N', color:'#2d7d5a' },
  'demo-tanya-004':   { name:'Tanya Kumar',   short:'Tanya',   role:'Daughter', av:'T', color:'#7d2d6b' }
};

const DEMO_EMAIL    = 'demo@eagles.app';
const DEMO_PASSWORD = 'Eagles2025!';
const DEMO_UID      = 'demo-raj-001'; // demo user maps to Raj's family profile

const ACTIVITIES = [
  {id:'golf',     icon:'⛳', label:'Golf'},
  {id:'padel',    icon:'🎾', label:'Padel'},
  {id:'football', icon:'⚽', label:'Football'},
  {id:'beach',    icon:'🏖️', label:'Beach'},
  {id:'travel',   icon:'✈️', label:'Travel'},
  {id:'food',     icon:'🍽️', label:'Food'},
  {id:'adventure',icon:'🧗', label:'Adventure'},
  {id:'family',   icon:'👨‍👩‍👧‍👧',label:'Family'}
];

const EMOTIONS = [
  {id:'happy',  icon:'😊', label:'Happy'},
  {id:'loved',  icon:'❤️', label:'Loved it'},
  {id:'fun',    icon:'🎉', label:'Fun'},
  {id:'amazing',icon:'🤩', label:'Amazing'},
  {id:'family', icon:'🥰', label:'Family Moment'}
];

const REACTIONS = ['❤️','🤩','😂','🥰','🔥','👏'];

const SEED = [
  {uid:'demo-raj-001',    photoURL:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', mediaType:'image', date:'2025-03-15', location:'Dubai, UAE',        description:'Perfect round at Emirates Golf Club! 🏌️',             activity:'golf',     emotion:'amazing', taggedMembers:['demo-raj-001'],                                              likes:['demo-fiona-002','demo-natasha-003'], comments:[{uid:'demo-fiona-002',text:'So proud! What was your score? 😍',timestamp:'2025-03-15T11:30:00'}], reactions:{}, timestamp:new Date('2025-03-15T09:00:00')},
  {uid:'demo-fiona-002',  photoURL:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80', mediaType:'image', date:'2025-03-10', location:'Dubai Marina',      description:'Dubai skyline at sunset – breathtaking 🌇',            activity:'travel',   emotion:'amazing', taggedMembers:['demo-fiona-002','demo-raj-001'],                             likes:['demo-raj-001','demo-natasha-003','demo-tanya-004'], comments:[{uid:'demo-tanya-004',text:'Miss this so much! 😭',timestamp:'2025-03-10T20:00:00'}], reactions:{}, timestamp:new Date('2025-03-10T19:00:00')},
  {uid:'demo-natasha-003',photoURL:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', mediaType:'image', date:'2025-02-22', location:'Jumeirah Beach',    description:'Beach day with the whole family 🌊☀️',                 activity:'beach',    emotion:'loved',   taggedMembers:['demo-natasha-003','demo-tanya-004','demo-fiona-002','demo-raj-001'], likes:['demo-raj-001','demo-fiona-002'], comments:[], reactions:{}, timestamp:new Date('2025-02-22T15:00:00')},
  {uid:'demo-raj-001',    photoURL:'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80', mediaType:'image', date:'2025-02-14', location:'Nad Al Sheba',      description:'Padel tournament – won the final in a tie-break! 🎾🔥', activity:'padel',    emotion:'amazing', taggedMembers:['demo-raj-001'],                                              likes:['demo-fiona-002','demo-tanya-004'], comments:[{uid:'demo-natasha-003',text:'Dad the champion! 🏆',timestamp:'2025-02-14T18:00:00'}], reactions:{}, timestamp:new Date('2025-02-14T16:00:00')},
  {uid:'demo-fiona-002',  photoURL:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', mediaType:'image', date:'2025-02-08', location:'Nobu, Dubai',       description:'Family dinner at Nobu – the black cod was incredible 🍽️', activity:'food',   emotion:'family',  taggedMembers:['demo-raj-001','demo-fiona-002','demo-natasha-003','demo-tanya-004'], likes:['demo-raj-001','demo-natasha-003','demo-tanya-004'], comments:[{uid:'demo-raj-001',text:'Best night of the year!',timestamp:'2025-02-08T22:00:00'}], reactions:{}, timestamp:new Date('2025-02-08T21:00:00')},
  {uid:'demo-tanya-004',  photoURL:'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&q=80', mediaType:'image', date:'2025-01-30', location:'Marbella, Spain',   description:'Holiday breakfast in the sunshine ☀️🥐',               activity:'travel',   emotion:'happy',   taggedMembers:['demo-tanya-004','demo-fiona-002'],                           likes:['demo-raj-001','demo-fiona-002','demo-natasha-003'], comments:[], reactions:{}, timestamp:new Date('2025-01-30T09:30:00')},
  {uid:'demo-natasha-003',photoURL:'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&q=80', mediaType:'image', date:'2025-01-20', location:'London, UK',         description:'Weekend in London! Borough Market and the Thames 🇬🇧',  activity:'travel',   emotion:'fun',     taggedMembers:['demo-natasha-003'],                                          likes:['demo-tanya-004'], comments:[{uid:'demo-fiona-002',text:'Wish I was there! 😍',timestamp:'2025-01-20T16:00:00'}], reactions:{}, timestamp:new Date('2025-01-20T14:00:00')},
  {uid:'demo-tanya-004',  photoURL:'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80', mediaType:'image', date:'2025-01-15', location:'Dubai, UAE',         description:'Family movie night – popcorn and blankets 🎬🍿',        activity:'family',   emotion:'family',  taggedMembers:['demo-raj-001','demo-fiona-002','demo-natasha-003','demo-tanya-004'], likes:['demo-raj-001','demo-fiona-002','demo-natasha-003'], comments:[{uid:'demo-natasha-003',text:'The best! Every week! 😂',timestamp:'2025-01-15T21:00:00'}], reactions:{}, timestamp:new Date('2025-01-15T20:00:00')},
  {uid:'demo-raj-001',    photoURL:'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80', mediaType:'image', date:'2025-01-05', location:'Dubai Hills, UAE',   description:'Saturday morning football ⚽💪 Nothing like a kickabout!', activity:'football', emotion:'fun',   taggedMembers:['demo-raj-001'],                                              likes:['demo-fiona-002'], comments:[], reactions:{}, timestamp:new Date('2025-01-05T08:00:00')},
  {uid:'demo-fiona-002',  photoURL:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80', mediaType:'image', date:'2024-12-28', location:'Swiss Alps',         description:'New Year trip to the Alps – absolute magic 🏔️❄️',      activity:'adventure',emotion:'amazing', taggedMembers:['demo-raj-001','demo-fiona-002','demo-natasha-003','demo-tanya-004'], likes:['demo-raj-001','demo-natasha-003','demo-tanya-004'], comments:[{uid:'demo-natasha-003',text:'Best trip EVER!',timestamp:'2024-12-28T17:00:00'},{uid:'demo-tanya-004',text:'Can we go back?! ❄️',timestamp:'2024-12-28T18:00:00'}], reactions:{}, timestamp:new Date('2024-12-28T16:00:00')}
];

// ============================================================
// BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  setupEmailLogin();
  setupNav();
  setupAddMemory();
  setupCalendar();
  setupInstall();
  registerSW();
  // Advance from splash to login after 1.8s
  setTimeout(() => showScreen('login'), 1800);
});

function initFirebase() {
  firebase.initializeApp(firebaseConfig);
  db   = firebase.firestore();
  auth = firebase.auth();
  // FIX: auth state observer — if already signed in, skip login
  auth.onAuthStateChanged(user => {
    if (user) { currentUser = user; onLoggedIn(); }
  });
}

// ============================================================
// SCREEN SWITCHING — display flex/none, completely reliable
// ============================================================
function showScreen(name) {
  ['splash','login','app'].forEach(id => {
    const el = document.getElementById('screen-' + id);
    if (el) el.style.display = 'none';
  });
  const target = document.getElementById('screen-' + name);
  if (target) target.style.display = 'flex';
}

// ============================================================
// PWA INSTALL FLOW
// ============================================================
function setupInstall() {
  // Silently capture — NEVER auto-trigger
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstall = e;
  });
  window.addEventListener('appinstalled', () => {
    showToast('🦅 Eagles installed on your home screen!');
    deferredInstall = null;
  });
}

// Called only by "Install Eagles App" profile button
function triggerInstall() {
  const isStandalone = window.matchMedia('(display-mode:standalone)').matches || navigator.standalone;
  if (isStandalone) { showToast('✅ Eagles is already installed!'); return; }

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIOS) {
    // Show iOS step-by-step guide above nav
    const tip = document.getElementById('ios-tip');
    if (tip) { tip.classList.add('show'); setTimeout(() => tip.classList.remove('show'), 14000); }
    return;
  }

  // Android/Chrome: show confirm dialog
  const d = document.getElementById('install-dialog');
  if (d) d.style.display = 'flex';
}

async function confirmInstall() {
  closeInstallDialog();
  if (deferredInstall) {
    await deferredInstall.prompt();
    deferredInstall = null;
  } else {
    showToast('In Chrome: tap ⋮ → "Add to Home screen"');
  }
}
function closeInstallDialog() {
  const d = document.getElementById('install-dialog');
  if (d) d.style.display = 'none';
}

// ============================================================
// PERMISSIONS WELCOME DIALOG
// Shown once per device after first login
// ============================================================
function maybeShowPermissionsDialog() {
  if (localStorage.getItem('eagles_perms_asked')) return;
  localStorage.setItem('eagles_perms_asked', '1');
  const d = document.getElementById('permissions-dialog');
  if (d) d.style.display = 'flex';
}

async function grantPermissions() {
  closePermissionsDialog();
  // Notifications
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  // Camera / media access is triggered at point-of-use (file inputs) — no pre-request needed
  showToast('🔔 Notifications enabled!');
}
function closePermissionsDialog() {
  const d = document.getElementById('permissions-dialog');
  if (d) d.style.display = 'none';
}

// Also used from profile button
async function requestNotifications() {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') { showToast('🔔 Notifications already on!'); return; }
    const r = await Notification.requestPermission();
    showToast(r === 'granted' ? '🔔 Notifications enabled!' : 'Notifications blocked in browser settings');
  }
}

// ============================================================
// LOGIN
// ============================================================
async function demoLogin() {
  const btn = document.getElementById('btn-demo');
  if (btn) btn.textContent = 'Signing in…';
  showLoading(true); hideLoginError();
  try {
    await auth.signInWithEmailAndPassword(DEMO_EMAIL, DEMO_PASSWORD);
  } catch (e) {
    // First time — create the demo account
    try {
      await auth.createUserWithEmailAndPassword(DEMO_EMAIL, DEMO_PASSWORD);
    } catch (e2) {
      showLoading(false);
      if (btn) btn.innerHTML = '<span class="demo-btn-icon">🦅</span><span>Enter as Demo User</span>';
      showLoginError('Could not sign in. Check your internet connection.');
    }
  }
}

function setupEmailLogin() {
  document.getElementById('inp-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleEmailLogin();
  });
}

async function handleEmailLogin() {
  const email = document.getElementById('inp-email')?.value.trim();
  const pass  = document.getElementById('inp-password')?.value;
  if (!email || !pass) { showLoginError('Please enter email and password.'); return; }
  showLoading(true); hideLoginError();
  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch (e) {
    showLoading(false);
    showLoginError('Incorrect email or password.');
  }
}

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function hideLoginError() {
  const el = document.getElementById('login-error');
  if (el) el.style.display = 'none';
}

// ============================================================
// POST-LOGIN
// ============================================================
async function onLoggedIn() {
  showLoading(false);
  showScreen('app');
  updateHeaderAv();
  buildStoryRow();
  startFeed();
  navTo('home');
  seedIfEmpty();
  // Show permissions dialog once
  setTimeout(maybeShowPermissionsDialog, 2000);
}

async function seedIfEmpty() {
  try {
    const snap = await db.collection('eagles_memories').limit(1).get();
    if (snap.empty) {
      const batch = db.batch();
      SEED.forEach(m => batch.set(db.collection('eagles_memories').doc(), m));
      await batch.commit();
      showToast('🦅 Family memories loaded!');
    }
  } catch (e) { console.error('Seed:', e); }
}

// ============================================================
// AVATAR HELPERS
// FIX: photo avatars now use background-image + clear textContent
// ============================================================
function getSavedAv(uid) {
  try { const s = localStorage.getItem('eagles_av_' + uid); return s ? JSON.parse(s) : null; } catch { return null; }
}

function applyAvToEl(el, data, fallbackColor, fallbackInitial) {
  if (!el) return;
  // Reset everything first
  el.style.backgroundImage = '';
  el.style.backgroundSize  = '';
  el.style.backgroundPosition = '';
  el.textContent = '';
  el.style.fontSize = '';

  if (data && data.type === 'photo') {
    // Photo: fill with background-image, no text
    el.style.backgroundImage    = `url(${data.value})`;
    el.style.backgroundSize     = 'cover';
    el.style.backgroundPosition = 'center';
    // Don't set background colour — keep gradient as fallback while loading
  } else if (data && data.type === 'emoji') {
    el.textContent = data.value;
    el.style.fontSize = '22px';
    if (fallbackColor) el.style.background = `linear-gradient(135deg,${fallbackColor},#c9a84c)`;
  } else {
    // Default initial letter
    el.textContent = fallbackInitial || '?';
    el.style.fontSize = '16px';
    if (fallbackColor) el.style.background = `linear-gradient(135deg,${fallbackColor},#c9a84c)`;
  }
}

function getFamilyForUser() {
  // Map Firebase UID to a FAMILY entry by checking email
  if (!currentUser) return null;
  // Demo user → Raj profile
  const email = currentUser.email || '';
  for (const [uid, f] of Object.entries(FAMILY)) {
    if (email.toLowerCase().includes(f.short.toLowerCase()) ||
        email.toLowerCase().includes(uid.replace('demo-','').replace(/-\d+/,''))) {
      return { uid, ...f };
    }
  }
  return { uid: 'demo-raj-001', ...FAMILY['demo-raj-001'] };
}

function updateHeaderAv() {
  const f = getFamilyForUser() || FAMILY['demo-raj-001'];
  const el = document.getElementById('header-avatar');
  const saved = getSavedAv(f.uid);
  applyAvToEl(el, saved, f.color, f.av);
}

function buildStoryRow() {
  const row = document.getElementById('story-row');
  if (!row) return;
  row.innerHTML = `
    <div class="story-item" onclick="navTo('add')">
      <div class="story-ring add-ring">
        <div class="story-av" style="background:linear-gradient(135deg,#c9a84c,#e07b4a);font-size:26px">+</div>
      </div>
      <div class="story-name">Add</div>
    </div>`;
  Object.entries(FAMILY).forEach(([uid, f]) => {
    const saved = getSavedAv(uid);
    const item = document.createElement('div');
    item.className = 'story-item';
    const avDiv = document.createElement('div');
    avDiv.className = 'story-av';
    applyAvToEl(avDiv, saved, f.color, f.av);
    const ring = document.createElement('div'); ring.className = 'story-ring';
    ring.appendChild(avDiv);
    const name = document.createElement('div'); name.className = 'story-name'; name.textContent = f.short;
    item.appendChild(ring); item.appendChild(name);
    row.appendChild(item);
  });
}

// ============================================================
// NAVIGATION
// ============================================================
function setupNav() {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => navTo(item.dataset.page));
  });
}
function navTo(name) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navEl = document.querySelector(`.nav-item[data-page="${name}"]`);
  if (navEl) navEl.classList.add('active');
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const page = document.getElementById('page-' + name);
  if (page) page.style.display = 'block';
  if (name === 'activities') loadActivities();
  if (name === 'profile')    loadProfile();
  if (name === 'calendar')   loadCalendar();
}

// ============================================================
// FEED — real-time Firestore listener
// FIX: showLoading(false) called before listener, not after
// ============================================================
function startFeed() {
  if (feedUnsub) feedUnsub();
  const container = document.getElementById('memory-feed');
  if (!container) return;
  container.innerHTML = '<div class="skel-wrap"><div class="skel"></div><div class="skel"></div></div>';

  feedUnsub = db.collection('eagles_memories')
    .orderBy('timestamp', 'desc')
    .onSnapshot(snap => {
      container.innerHTML = '';
      if (snap.empty) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">📷</div><h3>No memories yet</h3><p>Add your first one!</p></div>';
        return;
      }
      // On This Day
      const today = new Date();
      const otd = snap.docs.filter(doc => {
        const d = doc.data().date; if (!d) return false;
        const m = new Date(d + 'T12:00:00');
        return m.getDate() === today.getDate() && m.getMonth() === today.getMonth() && m.getFullYear() !== today.getFullYear();
      });
      if (otd.length) {
        const banner = document.createElement('div'); banner.className = 'otd-banner';
        banner.innerHTML = `<div class="otd-title">🗓️ On This Day</div><div class="otd-sub">${otd.length} memory${otd.length>1?'ies':''} from this date in past years — tap to reveal</div>`;
        banner.addEventListener('click', () => { banner.remove(); otd.forEach(doc => container.prepend(buildCard(doc.id, doc.data()))); });
        container.appendChild(banner);
      }
      snap.docs.forEach(doc => container.appendChild(buildCard(doc.id, doc.data())));
    }, err => {
      console.error('Feed:', err);
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Could not load</h3><p>Check your connection</p></div>';
    });
}

function buildCard(id, m) {
  const f    = FAMILY[m.uid] || { name:'Family', role:'Member', av:'U', color:'#1a3a5c', short:'User' };
  const act  = ACTIVITIES.find(a => a.id === m.activity) || { icon:'📍', label:m.activity || '' };
  const emo  = EMOTIONS.find(e => e.id === m.emotion)   || { icon:'😊', label:'' };
  const likes    = m.likes     || [];
  const comments = m.comments  || [];
  const reactions= m.reactions || {};
  const tagged   = (m.taggedMembers || []).map(u => FAMILY[u]?.short).filter(Boolean);
  const liked    = likes.includes(currentUser?.uid);
  const isVideo  = m.mediaType === 'video';
  const dateStr  = m.date ? new Date(m.date + 'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '';
  const rxSummary = Object.entries(reactions).map(([e,u]) => u?.length ? `${e}${u.length}` : '').filter(Boolean).join(' ');

  // Build avatar for card header
  const saved = getSavedAv(m.uid);
  const avDiv = document.createElement('div'); avDiv.className = 'card-av';
  applyAvToEl(avDiv, saved, f.color, f.av);

  const card = document.createElement('div'); card.className = 'memory-card';

  // Header
  const header = document.createElement('div'); header.className = 'card-header';
  const userInfo = document.createElement('div');
  userInfo.innerHTML = `
    <div class="card-user-name">${f.name}<span class="card-role"> · ${f.role}</span></div>
    <div class="card-meta">📅 ${dateStr}${m.location ? ' · 📍 ' + m.location : ''}</div>
    <div class="card-badges">
      <span class="badge badge-act">${act.icon} ${act.label}</span>
      <span class="badge badge-emo">${emo.icon} ${emo.label}</span>
      ${tagged.length ? `<span class="badge badge-tag">👥 ${tagged.join(', ')}</span>` : ''}
    </div>`;
  header.appendChild(avDiv); header.appendChild(userInfo);
  card.appendChild(header);

  // Media
  if (isVideo && m.photoURL) {
    const vid = document.createElement('video');
    vid.className = 'card-photo'; vid.controls = true; vid.playsInline = true; vid.preload = 'metadata';
    vid.src = m.photoURL; vid.style.cssText = 'background:#000;max-height:380px;object-fit:contain';
    card.appendChild(vid);
  } else if (m.photoURL) {
    const img = document.createElement('img');
    img.className = 'card-photo'; img.src = m.photoURL; img.alt = 'Memory'; img.loading = 'lazy';
    img.onerror = () => img.style.display = 'none';
    card.appendChild(img);
  } else {
    const ph = document.createElement('div'); ph.className = 'card-no-media'; ph.textContent = act.icon;
    card.appendChild(ph);
  }

  // Caption
  if (m.description) {
    const cap = document.createElement('div'); cap.className = 'card-caption'; cap.textContent = m.description;
    card.appendChild(cap);
  }

  // Reaction bar
  const rxBar = document.createElement('div'); rxBar.className = 'reaction-bar'; rxBar.id = `rx-${id}`;
  rxBar.textContent = rxSummary;
  card.appendChild(rxBar);

  // Action buttons
  const actions = document.createElement('div'); actions.className = 'card-actions';
  actions.innerHTML = `
    <button class="card-action-btn like-btn ${liked?'liked':''}" data-id="${id}">
      ${liked?'❤️':'🤍'} <span class="lc">${likes.length}</span>
    </button>
    <button class="card-action-btn react-btn" data-id="${id}">😊 React</button>
    <button class="card-action-btn cmt-btn" data-id="${id}">💬 <span class="cc">${comments.length}</span></button>`;
  card.appendChild(actions);

  // Reaction picker
  const rp = document.createElement('div'); rp.className = 'reaction-picker'; rp.id = `rp-${id}`;
  rp.innerHTML = REACTIONS.map(r => `<button class="r-opt" data-r="${r}">${r}</button>`).join('');
  card.appendChild(rp);

  // Comments
  const cmtBox = document.createElement('div'); cmtBox.className = 'card-comments'; cmtBox.id = `cmts-${id}`;
  cmtBox.innerHTML = `<div id="clist-${id}">${comments.map(buildCommentHTML).join('')}</div>
    <div class="comment-input-row">
      <input class="comment-input" id="cinp-${id}" placeholder="Add a comment…">
      <button class="comment-send">➤</button>
    </div>`;
  card.appendChild(cmtBox);

  // Events
  card.querySelector('.like-btn').addEventListener('click', () => toggleLike(id, likes, card));
  card.querySelector('.react-btn').addEventListener('click', () => {
    rp.style.display = rp.style.display === 'flex' ? 'none' : 'flex';
  });
  rp.querySelectorAll('.r-opt').forEach(btn =>
    btn.addEventListener('click', () => addReaction(id, btn.dataset.r, reactions, rxBar))
  );
  card.querySelector('.cmt-btn').addEventListener('click', () => {
    rp.style.display = 'none';
    cmtBox.style.display = cmtBox.style.display === 'block' ? 'none' : 'block';
    if (cmtBox.style.display === 'block') setTimeout(() => document.getElementById('cinp-' + id)?.focus(), 100);
  });
  cmtBox.querySelector('.comment-send').addEventListener('click',  () => postComment(id, card));
  cmtBox.querySelector('#cinp-' + id).addEventListener('keydown', e => { if (e.key === 'Enter') postComment(id, card); });

  return card;
}

function buildCommentHTML(c) {
  const f = FAMILY[c.uid] || { name:'Family', color:'#888', av:'U' };
  const t = c.timestamp ? new Date(c.timestamp).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) : '';
  return `<div class="comment-item">
    <div class="comment-av" style="background:${f.color}">${f.av}</div>
    <div class="comment-bubble">
      <span class="comment-author">${f.name}</span>
      <span class="comment-text">${c.text}</span>
      ${t?`<span class="comment-time">${t}</span>`:''}
    </div>
  </div>`;
}

async function toggleLike(id, currentLikes, card) {
  if (!currentUser) return;
  const uid = currentUser.uid, liked = currentLikes.includes(uid);
  const newLikes = liked ? currentLikes.filter(l => l !== uid) : [...currentLikes, uid];
  const btn = card.querySelector('.like-btn');
  if (btn) { btn.innerHTML = `${liked?'🤍':'❤️'} <span class="lc">${newLikes.length}</span>`; btn.classList.toggle('liked', !liked); }
  try { await db.collection('eagles_memories').doc(id).update({ likes: newLikes }); }
  catch { showToast('Could not update like'); }
}

async function addReaction(id, emoji, cur, rxBar) {
  if (!currentUser) return;
  document.getElementById('rp-' + id).style.display = 'none';
  const uid = currentUser.uid;
  const updated = { ...cur };
  if (!updated[emoji]) updated[emoji] = [];
  if (updated[emoji].includes(uid)) updated[emoji] = updated[emoji].filter(u => u !== uid);
  else updated[emoji] = [...updated[emoji], uid];
  Object.keys(updated).forEach(k => { if (!updated[k].length) delete updated[k]; });
  try {
    await db.collection('eagles_memories').doc(id).update({ reactions: updated });
    if (rxBar) rxBar.textContent = Object.entries(updated).map(([e,u]) => u.length?`${e}${u.length}`:'').filter(Boolean).join(' ');
  } catch { showToast('Could not add reaction'); }
}

async function postComment(id, card) {
  const inp = document.getElementById('cinp-' + id);
  const text = inp?.value?.trim();
  if (!text || !currentUser) return;
  inp.value = ''; inp.disabled = true;
  try {
    const ref   = db.collection('eagles_memories').doc(id);
    const snap  = await ref.get();
    const comments = [...(snap.data()?.comments || [])];
    const nc = { uid: currentUser.uid, text, timestamp: new Date().toISOString() };
    comments.push(nc);
    await ref.update({ comments });
    document.getElementById('clist-' + id)?.insertAdjacentHTML('beforeend', buildCommentHTML(nc));
    const ccEl = card?.querySelector('.cmt-btn .cc');
    if (ccEl) ccEl.textContent = parseInt(ccEl.textContent || 0) + 1;
  } catch { showToast('Could not post comment'); }
  finally { inp.disabled = false; inp.focus(); }
}

// ============================================================
// MEDIA — camera, gallery, video (separate inputs)
// FIX: loading spinner now properly cleared in all paths
// ============================================================
let upFile = null, upIsVideo = false;

function openCamera()      { document.getElementById('input-camera')?.click(); }
function openGallery()     { document.getElementById('input-gallery')?.click(); }
function openVideoGallery(){ document.getElementById('input-video')?.click(); }

// Wire up all three inputs once DOM is ready
function setupAddMemory() {
  document.getElementById('input-camera')?.addEventListener('change',  e => handleMediaFile(e.target.files[0], false));
  document.getElementById('input-gallery')?.addEventListener('change', e => handleMediaFile(e.target.files[0], false));
  document.getElementById('input-video')?.addEventListener('change',   e => handleMediaFile(e.target.files[0], true));

  const ag = document.getElementById('activity-chips');
  if (ag) ACTIVITIES.forEach(a => {
    const c = document.createElement('div'); c.className = 'chip';
    c.innerHTML = `${a.icon} ${a.label}`;
    c.addEventListener('click', () => { ag.querySelectorAll('.chip').forEach(x => x.classList.remove('selected')); c.classList.add('selected'); selAct = a.id; });
    ag.appendChild(c);
  });

  const eg = document.getElementById('emotion-chips');
  if (eg) EMOTIONS.forEach(e => {
    const c = document.createElement('div'); c.className = 'chip';
    c.innerHTML = `${e.icon} ${e.label}`;
    c.addEventListener('click', () => { eg.querySelectorAll('.chip').forEach(x => x.classList.remove('selected')); c.classList.add('selected'); selEmo = e.id; });
    eg.appendChild(c);
  });

  const tg = document.getElementById('tag-chips');
  if (tg) Object.entries(FAMILY).forEach(([uid, f]) => {
    const c = document.createElement('div'); c.className = 'chip';
    c.innerHTML = `<span class="chip-dot" style="background:${f.color}">${f.av}</span>${f.short}`;
    c.addEventListener('click', () => {
      c.classList.toggle('selected');
      selPeople = c.classList.contains('selected') ? [...selPeople, uid] : selPeople.filter(u => u !== uid);
    });
    tg.appendChild(c);
  });

  document.getElementById('btn-save')?.addEventListener('click', saveMemory);
  const d = document.getElementById('f-date'); if (d) d.value = new Date().toISOString().split('T')[0];
}

async function handleMediaFile(file, forceVideo) {
  if (!file) return;
  const isVid = forceVideo || file.type.startsWith('video/');
  const area  = document.getElementById('upload-area');

  if (isVid) {
    try {
      showToast('Checking video length…');
      await checkVideoDuration(file);
      upFile = file; upIsVideo = true;
      // Show video preview
      area.innerHTML = '';
      const vid = document.createElement('video');
      vid.className = 'upload-preview'; vid.muted = true; vid.playsInline = true;
      vid.src = URL.createObjectURL(file);
      area.appendChild(vid);
      area.insertAdjacentHTML('beforeend', '<div class="upload-label">🎬 Video ready</div>');
    } catch (err) {
      showToast('⚠️ ' + err.message);
      // Reset file inputs
      ['input-video','input-camera','input-gallery'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    }
  } else {
    upFile = file; upIsVideo = false;
    const reader = new FileReader();
    reader.onload = ev => {
      area.innerHTML = '';
      const img = document.createElement('img');
      img.className = 'upload-preview'; img.src = ev.target.result;
      area.appendChild(img);
      area.insertAdjacentHTML('beforeend', '<div class="upload-label">📷 Photo ready</div>');
    };
    reader.readAsDataURL(file);
  }
}

let selAct = null, selEmo = null, selPeople = [];

async function saveMemory() {
  const date = document.getElementById('f-date')?.value;
  const loc  = document.getElementById('f-location')?.value.trim();
  const cap  = document.getElementById('f-caption')?.value.trim();
  if (!cap)    { showToast('Please add a caption'); return; }
  if (!selAct) { showToast('Please pick an activity'); return; }
  if (!selEmo) { showToast('Please pick a feeling'); return; }

  const btn = document.getElementById('btn-save');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
  showLoading(true);

  let mediaURL = null;
  if (upFile) {
    try {
      if (upIsVideo) {
        showToast('📤 Uploading video…');
        mediaURL = await uploadToCloudinary(upFile, true);
      } else {
        showToast('📤 Compressing photo…');
        const compressed = await compressImage(upFile);
        mediaURL = await uploadToCloudinary(compressed, false);
      }
    } catch (e) {
      console.error('Upload error:', e);
      showToast('Upload failed — saving without media');
      // DON'T return — save the memory without photo
    }
  }

  const myUID = currentUser.uid;
  if (!selPeople.includes(myUID)) selPeople.unshift(myUID);

  try {
    await db.collection('eagles_memories').add({
      uid: myUID, photoURL: mediaURL,
      mediaType: upIsVideo ? 'video' : 'image',
      date, location: loc, description: cap,
      activity: selAct, emotion: selEmo,
      taggedMembers: selPeople,
      likes: [], comments: [], reactions: {},
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast('🦅 Memory saved!');
    resetAddForm();
    navTo('home');
  } catch (e) {
    showToast('Error saving — try again');
    console.error('Save error:', e);
  } finally {
    // FIX: ALWAYS hide loading, ALWAYS re-enable button
    showLoading(false);
    if (btn) { btn.disabled = false; btn.innerHTML = '🦅 Save Memory'; }
  }
}

function resetAddForm() {
  selAct = null; selEmo = null; selPeople = []; upFile = null; upIsVideo = false;
  const d = document.getElementById('f-date'); if (d) d.value = new Date().toISOString().split('T')[0];
  ['f-location','f-caption'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  ['input-camera','input-gallery','input-video'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const area = document.getElementById('upload-area');
  if (area) area.innerHTML = `
    <div class="upload-area-icon">📷</div>
    <div class="upload-area-text">Add a photo or video</div>
    <div class="upload-btns-row">
      <button class="upload-btn" onclick="openCamera()">📷 Camera</button>
      <button class="upload-btn" onclick="openGallery()">🖼️ Gallery</button>
      <button class="upload-btn" onclick="openVideoGallery()">🎬 Video</button>
    </div>`;
  document.querySelectorAll('#activity-chips .chip, #emotion-chips .chip, #tag-chips .chip').forEach(c => c.classList.remove('selected'));
}

// ============================================================
// COMPRESSION + UPLOAD
// ============================================================
function compressImage(file, maxW = 1200, quality = 0.82) {
  return new Promise(resolve => {
    const r = new FileReader();
    r.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width: w, height: h } = img;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type:'image/jpeg' })), 'image/jpeg', quality);
      };
      img.src = ev.target.result;
    };
    r.readAsDataURL(file);
  });
}

function checkVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const v = document.createElement('video'); v.preload = 'metadata';
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(v.src);
      v.duration > MAX_VIDEO_SECS ? reject(new Error(`Max ${MAX_VIDEO_SECS}s — yours is ${Math.round(v.duration)}s`)) : resolve(v.duration);
    };
    v.onerror = () => reject(new Error('Cannot read video'));
    v.src = URL.createObjectURL(file);
  });
}

async function uploadToCloudinary(file, isVideo = false) {
  const fd = new FormData();
  fd.append('file', file); fd.append('upload_preset', CLOUDINARY_PRESET); fd.append('folder', 'eagles_app');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${isVideo?'video':'image'}/upload`, { method:'POST', body:fd });
  const data = await res.json();
  if (!data.secure_url) throw new Error(data.error?.message || 'Upload failed');
  return data.secure_url;
}

// ============================================================
// CALENDAR
// ============================================================
let calY = new Date().getFullYear(), calM = new Date().getMonth(), calDates = new Set();
function setupCalendar() {
  document.getElementById('cal-prev')?.addEventListener('click', () => { calM--; if(calM<0){calM=11;calY--;} renderCal(); });
  document.getElementById('cal-next')?.addEventListener('click', () => { calM++; if(calM>11){calM=0;calY++;} renderCal(); });
}
async function loadCalendar() {
  try { const s = await db.collection('eagles_memories').get(); calDates = new Set(s.docs.map(d => d.data().date)); } catch {}
  renderCal();
}
function renderCal() {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const lbl = document.getElementById('cal-label'); if (lbl) lbl.textContent = `${months[calM]} ${calY}`;
  const grid = document.getElementById('cal-grid'); if (!grid) return;
  grid.innerHTML = '';
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => { const el = document.createElement('div'); el.className='cal-hdr'; el.textContent=d; grid.appendChild(el); });
  const first = new Date(calY,calM,1).getDay(), days = new Date(calY,calM+1,0).getDate(), today = new Date();
  for (let i=0;i<first;i++) { const el=document.createElement('div'); el.className='cal-day empty'; grid.appendChild(el); }
  for (let d=1;d<=days;d++) {
    const el=document.createElement('div'); el.className='cal-day'; el.textContent=d;
    const ds=`${calY}-${String(calM+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if(today.getDate()===d&&today.getMonth()===calM&&today.getFullYear()===calY) el.classList.add('today');
    if(calDates.has(ds)) el.classList.add('has-memory');
    el.addEventListener('click',()=>{ grid.querySelectorAll('.cal-day').forEach(x=>x.classList.remove('selected')); el.classList.add('selected'); loadDayMemories(ds); });
    grid.appendChild(el);
  }
}
async function loadDayMemories(ds) {
  const list=document.getElementById('cal-day-list'), title=document.getElementById('cal-day-title');
  const fmt=new Date(ds+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
  if(title) title.textContent=fmt; if(!list) return;
  try {
    const snap=await db.collection('eagles_memories').where('date','==',ds).get();
    list.innerHTML='';
    if(snap.empty){list.innerHTML='<p class="cal-empty">No memories on this day</p>';return;}
    snap.docs.forEach(doc=>{
      const m=doc.data(),f=FAMILY[m.uid]||{name:'Family',color:'#1a3a5c'},act=ACTIVITIES.find(a=>a.id===m.activity)||{icon:'📍'};
      const card=document.createElement('div'); card.className='cal-mini-card';
      card.innerHTML=`${m.photoURL&&m.mediaType!=='video'?`<img class="cal-mini-photo" src="${m.photoURL}" loading="lazy">`:`<div class="cal-mini-photo cal-mini-icon">${act.icon}</div>`}<div><div class="cal-mini-name">${f.name}</div><div class="cal-mini-desc">${(m.description||'').substring(0,60)}${(m.description||'').length>60?'…':''}</div></div>`;
      list.appendChild(card);
    });
  } catch { list.innerHTML='<p class="cal-empty">Could not load</p>'; }
}

// ============================================================
// ACTIVITIES
// ============================================================
let actFilter = 'all';
async function loadActivities() {
  const fr=document.getElementById('filter-row');
  if(fr){
    fr.innerHTML='';
    const all=document.createElement('div'); all.className=`filter-chip${actFilter==='all'?' active':''}`; all.innerHTML='🌟 All';
    all.addEventListener('click',()=>{actFilter='all';loadActivities();}); fr.appendChild(all);
    ACTIVITIES.forEach(a=>{const c=document.createElement('div');c.className=`filter-chip${actFilter===a.id?' active':''}`;c.innerHTML=`${a.icon} ${a.label}`;c.addEventListener('click',()=>{actFilter=a.id;loadActivities();});fr.appendChild(c);});
  }
  const grid=document.getElementById('acts-grid'); if(!grid) return;
  grid.innerHTML='<div class="acts-empty">Loading…</div>';
  try {
    let q=db.collection('eagles_memories').orderBy('timestamp','desc');
    if(actFilter!=='all') q=q.where('activity','==',actFilter);
    const snap=await q.get(); grid.innerHTML='';
    if(snap.empty){grid.innerHTML='<div class="acts-empty">No memories for this activity yet</div>';return;}
    snap.docs.forEach(doc=>{
      const m=doc.data(),f=FAMILY[m.uid]||{name:'Family'},act=ACTIVITIES.find(a=>a.id===m.activity)||{icon:'📍',label:m.activity};
      const card=document.createElement('div'); card.className='act-card';
      card.innerHTML=`${m.photoURL&&m.mediaType!=='video'?`<img class="act-photo" src="${m.photoURL}" loading="lazy">`:`<div class="act-no-photo">${act.icon}</div>`}<div class="act-info"><div class="act-name">${f.name}</div><div class="act-meta">${act.icon} ${act.label} · ${m.date||''}</div></div>`;
      grid.appendChild(card);
    });
  } catch { grid.innerHTML='<div class="acts-empty">Could not load</div>'; }
}

// ============================================================
// PROFILE
// ============================================================
async function loadProfile() {
  if (!currentUser) return;
  const f = getFamilyForUser() || FAMILY['demo-raj-001'];
  const pav=document.getElementById('profile-av');
  const saved=getSavedAv(f.uid);
  applyAvToEl(pav, saved, f.color, f.av);
  const $=id=>document.getElementById(id);
  if($('profile-name')) $('profile-name').textContent=f.name;
  if($('profile-role')) $('profile-role').textContent=f.role;
  try {
    const snap=await db.collection('eagles_memories').get();
    const all=snap.docs.map(d=>({id:d.id,...d.data()}));
    const mine=all.filter(m=>m.uid===currentUser.uid);
    if($('stat-mem'))  $('stat-mem').textContent=mine.length;
    if($('stat-got'))  $('stat-got').textContent=mine.reduce((s,m)=>s+(m.likes||[]).length,0);
    if($('stat-gave')) $('stat-gave').textContent=all.reduce((s,m)=>s+((m.likes||[]).includes(currentUser.uid)?1:0),0);
    const roster=$('family-roster');
    if(roster){
      roster.innerHTML='';
      Object.entries(FAMILY).forEach(([uid,fm])=>{
        const mm=all.filter(m=>m.uid===uid);
        const row=document.createElement('div'); row.className='fam-row';
        const avDiv=document.createElement('div'); avDiv.className='fam-av'; avDiv.style.background=fm.color; avDiv.textContent=fm.av;
        row.appendChild(avDiv);
        row.insertAdjacentHTML('beforeend',`<div class="fam-info"><div class="fam-name">${fm.name}</div><div class="fam-role">${fm.role}</div></div><div class="fam-count">${mm.length} memories</div>`);
        roster.appendChild(row);
      });
    }
  } catch(e) { console.error('Profile:',e); }
}

// ============================================================
// AVATAR PICKER
// FIX: photo now actually fills avatar circle using background-image
// ============================================================
function openAvatarModal() {
  const modal=document.getElementById('avatar-modal'); if(modal) modal.style.display='flex';
  const grid=document.getElementById('avatar-emoji-grid');
  if(grid){
    grid.innerHTML='';
    AVATAR_CHARS.forEach(ch=>{
      const btn=document.createElement('button'); btn.className='av-opt'; btn.textContent=ch;
      btn.addEventListener('click',()=>saveAvatar({type:'emoji',value:ch}));
      grid.appendChild(btn);
    });
  }
  // Bind file inputs fresh each open (once:true avoids double-fire)
  const bindAv=id=>{
    const el=document.getElementById(id);
    if(!el) return;
    el.value=''; // reset so same file can be re-selected
    el.addEventListener('change', async e=>{
      const file=e.target.files[0]; if(!file) return;
      showLoading(true);
      try {
        const c=await compressImage(file,400,0.85);
        const url=await uploadToCloudinary(c,false);
        saveAvatar({type:'photo',value:url});
      } catch(err) {
        showToast('Photo upload failed — try again');
      } finally {
        showLoading(false);
      }
    },{once:true});
  };
  bindAv('av-gallery'); bindAv('av-camera');
}

function closeAvatarModal() {
  const modal=document.getElementById('avatar-modal'); if(modal) modal.style.display='none';
}

function saveAvatar(data) {
  if (!currentUser) return;
  const f=getFamilyForUser()||FAMILY['demo-raj-001'];
  localStorage.setItem('eagles_av_'+f.uid, JSON.stringify(data));
  // FIX: apply to both profile circle and header circle
  applyAvToEl(document.getElementById('profile-av'),    data, f.color, f.av);
  applyAvToEl(document.getElementById('header-avatar'), data, f.color, f.av);
  closeAvatarModal();
  buildStoryRow();
  showToast('✅ Avatar updated!');
}

// ============================================================
// iCAL EXPORT
// ============================================================
async function exportCalendar() {
  showLoading(true);
  try {
    const snap=await db.collection('eagles_memories').orderBy('timestamp','desc').get();
    if(snap.empty){showToast('No memories to export');showLoading(false);return;}
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Eagles Family App//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Eagles Family Memories','X-WR-TIMEZONE:Asia/Dubai'];
    snap.docs.forEach(doc=>{
      const m=doc.data(),f=FAMILY[m.uid]||{name:'Family'};
      const act=ACTIVITIES.find(a=>a.id===m.activity)||{icon:'📍',label:m.activity||'Memory'};
      const emo=EMOTIONS.find(e=>e.id===m.emotion)||{icon:'😊',label:''};
      const tagged=(m.taggedMembers||[]).map(u=>FAMILY[u]?.name).filter(Boolean).join(', ');
      const ds=(m.date||'2025-01-01').replace(/-/g,'');
      lines.push('BEGIN:VEVENT',`UID:eagles-${doc.id}@kumar`,`DTSTART;VALUE=DATE:${ds}`,`DTEND;VALUE=DATE:${ds}`,`SUMMARY:${act.icon} ${act.label} – ${f.name}${tagged?' with '+tagged:''}`,`DESCRIPTION:${[m.description,m.location?'📍 '+m.location:'',emo.label,tagged?'👥 '+tagged:''].filter(Boolean).join('\\n')}`,m.location?`LOCATION:${m.location}`:'','END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    const blob=new Blob([lines.filter(Boolean).join('\r\n')],{type:'text/calendar;charset=utf-8'});
    const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(blob),download:'eagles-memories.ics'});
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast('📅 Exported! Open the .ics file in Outlook');
  } catch(e){showToast('Export failed');console.error(e);}
  showLoading(false);
}

// ============================================================
// UTILS
// ============================================================
function registerSW(){
  if('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
}
function showLoading(v){
  const el=document.getElementById('loading-overlay'); if(el) el.classList.toggle('show',v);
}
function showToast(msg, dur=3000){
  const t=document.getElementById('toast'); if(!t) return;
  t.textContent=msg; t.classList.add('show');
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),dur);
}
function logout(){
  if(feedUnsub){feedUnsub();feedUnsub=null;}
  auth.signOut().then(()=>{ currentUser=null; showScreen('login'); showToast('Signed out 👋'); });
}
