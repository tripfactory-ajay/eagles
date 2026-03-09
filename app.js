// ============================================================
// EAGLES V6 — Kumar Family Memory App
// Clean rewrite: no legacy conflicts
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

// These emails must be added manually in Firebase Auth console
// All password: Eagles2025!
const FAMILY_LOGINS = {
  'demo-raj-001':     { email:'raj@kumar.family',     password:'Eagles2025!' },
  'demo-fiona-002':   { email:'fiona@kumar.family',   password:'Eagles2025!' },
  'demo-natasha-003': { email:'natasha@kumar.family', password:'Eagles2025!' },
  'demo-tanya-004':   { email:'tanya@kumar.family',   password:'Eagles2025!' }
};

const ACTIVITIES = [
  {id:'golf',    icon:'⛳', label:'Golf'},
  {id:'padel',   icon:'🎾', label:'Padel'},
  {id:'football',icon:'⚽', label:'Football'},
  {id:'beach',   icon:'🏖️', label:'Beach'},
  {id:'travel',  icon:'✈️', label:'Travel'},
  {id:'food',    icon:'🍽️', label:'Food'},
  {id:'adventure',icon:'🧗',label:'Adventure'},
  {id:'family',  icon:'👨‍👩‍👧‍👧',label:'Family'}
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
  {uid:'demo-raj-001',    photoURL:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', mediaType:'image', date:'2025-03-15', location:'Dubai, UAE',          description:'Perfect round at Emirates Golf Club! 🏌️',              activity:'golf',     emotion:'amazing', taggedMembers:['demo-raj-001'],                                              likes:['demo-fiona-002','demo-natasha-003'], comments:[{uid:'demo-fiona-002',text:'So proud! What was your score? 😍',timestamp:'2025-03-15T11:30:00'}], reactions:{}, timestamp:new Date('2025-03-15T09:00:00')},
  {uid:'demo-fiona-002',  photoURL:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80', mediaType:'image', date:'2025-03-10', location:'Dubai Marina, UAE',   description:'Dubai skyline at sunset – absolutely breathtaking 🌇',   activity:'travel',   emotion:'amazing', taggedMembers:['demo-fiona-002','demo-raj-001'],                             likes:['demo-raj-001','demo-natasha-003','demo-tanya-004'], comments:[{uid:'demo-tanya-004',text:'Miss this so much! 😭',timestamp:'2025-03-10T20:00:00'}], reactions:{}, timestamp:new Date('2025-03-10T19:00:00')},
  {uid:'demo-natasha-003',photoURL:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', mediaType:'image', date:'2025-02-22', location:'Jumeirah Beach',       description:'Beach day with the whole family 🌊☀️ Perfect weather!',  activity:'beach',    emotion:'loved',   taggedMembers:['demo-natasha-003','demo-tanya-004','demo-fiona-002','demo-raj-001'], likes:['demo-raj-001','demo-fiona-002'], comments:[], reactions:{}, timestamp:new Date('2025-02-22T15:00:00')},
  {uid:'demo-raj-001',    photoURL:'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80', mediaType:'image', date:'2025-02-14', location:'Nad Al Sheba, Dubai',   description:'Padel tournament – won the final in a tie-break! 🎾🔥',  activity:'padel',    emotion:'amazing', taggedMembers:['demo-raj-001'],                                              likes:['demo-fiona-002','demo-tanya-004'], comments:[{uid:'demo-natasha-003',text:'Dad the champion! 🏆',timestamp:'2025-02-14T18:00:00'}], reactions:{}, timestamp:new Date('2025-02-14T16:00:00')},
  {uid:'demo-fiona-002',  photoURL:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', mediaType:'image', date:'2025-02-08', location:'Nobu, Dubai',           description:'Family dinner at Nobu – the black cod was incredible 🍽️', activity:'food',     emotion:'family',  taggedMembers:['demo-raj-001','demo-fiona-002','demo-natasha-003','demo-tanya-004'], likes:['demo-raj-001','demo-natasha-003','demo-tanya-004'], comments:[{uid:'demo-raj-001',text:'Best night of the year!',timestamp:'2025-02-08T22:00:00'}], reactions:{}, timestamp:new Date('2025-02-08T21:00:00')},
  {uid:'demo-tanya-004',  photoURL:'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&q=80', mediaType:'image', date:'2025-01-30', location:'Marbella, Spain',       description:'Holiday breakfast in the sunshine ☀️🥐',                 activity:'travel',   emotion:'happy',   taggedMembers:['demo-tanya-004','demo-fiona-002'],                           likes:['demo-raj-001','demo-fiona-002','demo-natasha-003'], comments:[], reactions:{}, timestamp:new Date('2025-01-30T09:30:00')},
  {uid:'demo-natasha-003',photoURL:'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&q=80', mediaType:'image', date:'2025-01-20', location:'London, UK',            description:'Weekend in London! Borough Market and the Thames 🇬🇧',   activity:'travel',   emotion:'fun',     taggedMembers:['demo-natasha-003'],                                          likes:['demo-tanya-004'], comments:[{uid:'demo-fiona-002',text:'Wish I was there! 😍',timestamp:'2025-01-20T16:00:00'}], reactions:{}, timestamp:new Date('2025-01-20T14:00:00')},
  {uid:'demo-tanya-004',  photoURL:'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80', mediaType:'image', date:'2025-01-15', location:'Dubai, UAE',            description:'Family movie night – popcorn and blankets 🎬🍿',          activity:'family',   emotion:'family',  taggedMembers:['demo-raj-001','demo-fiona-002','demo-natasha-003','demo-tanya-004'], likes:['demo-raj-001','demo-fiona-002','demo-natasha-003'], comments:[{uid:'demo-natasha-003',text:'The best! Every week! 😂',timestamp:'2025-01-15T21:00:00'}], reactions:{}, timestamp:new Date('2025-01-15T20:00:00')},
  {uid:'demo-raj-001',    photoURL:'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80', mediaType:'image', date:'2025-01-05', location:'Dubai Hills, UAE',      description:'Saturday morning football ⚽💪',                          activity:'football', emotion:'fun',     taggedMembers:['demo-raj-001'],                                              likes:['demo-fiona-002'], comments:[], reactions:{}, timestamp:new Date('2025-01-05T08:00:00')},
  {uid:'demo-fiona-002',  photoURL:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80', mediaType:'image', date:'2024-12-28', location:'Swiss Alps',            description:'New Year trip to the Alps – absolute magic 🏔️❄️',        activity:'adventure',emotion:'amazing', taggedMembers:['demo-raj-001','demo-fiona-002','demo-natasha-003','demo-tanya-004'], likes:['demo-raj-001','demo-natasha-003','demo-tanya-004'], comments:[{uid:'demo-natasha-003',text:'Best trip EVER!',timestamp:'2024-12-28T17:00:00'},{uid:'demo-tanya-004',text:'Can we go back?! ❄️',timestamp:'2024-12-28T18:00:00'}], reactions:{}, timestamp:new Date('2024-12-28T16:00:00')}
];

// ============================================================
// BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  buildFamilyGrid();
  setupEmailLogin();
  setupNav();
  setupAddMemory();
  setupCalendar();
  setupInstall();
  registerSW();

  // Auto-advance splash → login after 1.8s
  setTimeout(() => showScreen('login'), 1800);
});

function initFirebase() {
  firebase.initializeApp(firebaseConfig);
  db   = firebase.firestore();
  auth = firebase.auth();
  auth.onAuthStateChanged(user => {
    if (user) { currentUser = user; onLoggedIn(); }
  });
}

// ============================================================
// SCREEN SWITCHING — simple, reliable, no animations
// ============================================================
function showScreen(name) {
  const ids = ['screen-splash','screen-login','screen-app'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const target = document.getElementById('screen-' + name);
  if (target) target.style.display = 'flex';
}

// ============================================================
// PWA INSTALL
// ============================================================
function setupInstall() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstall = e; // stored silently, never auto-triggered
  });
  window.addEventListener('appinstalled', () => {
    showToast('🦅 Eagles installed on your home screen!');
    deferredInstall = null;
    setTimeout(requestNotifications, 2000);
  });
}

// Called by "Install Eagles App" button in profile
function triggerInstall() {
  const standalone = window.matchMedia('(display-mode:standalone)').matches || navigator.standalone;
  if (standalone) { showToast('✅ Eagles is already installed!'); return; }
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
    const tip = document.getElementById('ios-tip');
    tip.classList.add('show');
    setTimeout(() => tip.classList.remove('show'), 12000);
    return;
  }
  // Show confirm dialog
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
// LOGIN
// ============================================================
function buildFamilyGrid() {
  const grid = document.getElementById('family-grid');
  if (!grid) return;
  grid.innerHTML = '';
  Object.entries(FAMILY).forEach(([uid, f]) => {
    const card = document.createElement('div');
    card.className = 'family-card';
    card.innerHTML = `
      <div class="family-card-av" style="background:linear-gradient(135deg,${f.color},${f.color}bb)">${f.av}</div>
      <div class="family-card-name">${f.short}</div>
      <div class="family-card-role">${f.role}</div>`;
    card.addEventListener('click', () => loginAs(uid));
    grid.appendChild(card);
  });
}

async function loginAs(uid) {
  const creds = FAMILY_LOGINS[uid];
  if (!creds) { showLoginError('Account not set up yet — ask Ajay to add it in Firebase.'); return; }
  showLoading(true); hideLoginError();
  try {
    await auth.signInWithEmailAndPassword(creds.email, creds.password);
  } catch (e) {
    // First time — create the account automatically
    try {
      const result = await auth.createUserWithEmailAndPassword(creds.email, creds.password);
      await result.user.updateProfile({ displayName: FAMILY[uid].name });
    } catch (e2) {
      showLoading(false);
      showLoginError('Could not sign in. Please ask Ajay to set up your account in Firebase Auth.');
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
  setTimeout(requestNotifications, 5000);
}

async function requestNotifications() {
  if ('Notification' in window && Notification.permission === 'default') {
    const r = await Notification.requestPermission();
    if (r === 'granted') showToast('🔔 Notifications on!');
  }
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
// ============================================================
function getSavedAv(uid) {
  try { const s = localStorage.getItem('eagles_av_' + uid); return s ? JSON.parse(s) : null; } catch { return null; }
}
function applyAv(el, data, color) {
  if (!el || !data) return;
  el.style.backgroundImage = ''; el.style.backgroundSize = ''; el.style.backgroundPosition = ''; el.textContent = '';
  if (data.type === 'photo') {
    el.style.backgroundImage = `url(${data.value})`; el.style.backgroundSize = 'cover'; el.style.backgroundPosition = 'center';
  } else {
    el.textContent = data.value;
    el.style.fontSize = '22px';
    if (color) el.style.background = `linear-gradient(135deg,${color},#c9a84c)`;
  }
}
function updateHeaderAv() {
  const f = FAMILY[currentUser?.uid] || {};
  const el = document.getElementById('header-avatar');
  if (!el) return;
  const saved = getSavedAv(currentUser?.uid);
  if (saved) applyAv(el, saved, f.color);
  else { el.textContent = f.av || 'U'; el.style.background = `linear-gradient(135deg,${f.color||'#1a3a5c'},#c9a84c)`; }
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
    let avStyle = `background:${f.color}`;
    let avContent = f.av;
    if (saved?.type === 'photo') { avStyle = `background-image:url(${saved.value});background-size:cover;background-position:center`; avContent = ''; }
    else if (saved?.type === 'emoji') { avStyle = `background:${f.color};font-size:22px`; avContent = saved.value; }
    const item = document.createElement('div');
    item.className = 'story-item';
    item.innerHTML = `
      <div class="story-ring">
        <div class="story-av" style="${avStyle}">${avContent}</div>
      </div>
      <div class="story-name">${f.short}</div>`;
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
  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navEl = document.querySelector(`.nav-item[data-page="${name}"]`);
  if (navEl) navEl.classList.add('active');
  // Show page
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const page = document.getElementById('page-' + name);
  if (page) page.style.display = 'block';
  // Page-specific init
  if (name === 'activities') loadActivities();
  if (name === 'profile')    loadProfile();
  if (name === 'calendar')   loadCalendar();
}

// ============================================================
// FEED
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
      const onThisDay = snap.docs.filter(doc => {
        const d = doc.data().date;
        if (!d) return false;
        const m = new Date(d + 'T12:00:00');
        return m.getDate() === today.getDate() && m.getMonth() === today.getMonth() && m.getFullYear() !== today.getFullYear();
      });
      if (onThisDay.length) {
        const banner = document.createElement('div');
        banner.className = 'otd-banner';
        banner.innerHTML = `<div class="otd-title">🗓️ On This Day</div><div class="otd-sub">You have ${onThisDay.length} memory${onThisDay.length > 1 ? 'ies' : 'y'} from this date in past years — tap to see</div>`;
        banner.addEventListener('click', () => {
          banner.remove();
          onThisDay.forEach(doc => container.prepend(buildCard(doc.id, doc.data())));
        });
        container.appendChild(banner);
      }
      snap.docs.forEach(doc => container.appendChild(buildCard(doc.id, doc.data())));
    }, err => console.error('Feed:', err));
}

function buildCard(id, m) {
  const f    = FAMILY[m.uid] || { name: 'Family', role: 'Member', av: 'U', color: '#1a3a5c' };
  const act  = ACTIVITIES.find(a => a.id === m.activity) || { icon: '📍', label: m.activity || '' };
  const emo  = EMOTIONS.find(e => e.id === m.emotion)   || { icon: '😊', label: '' };
  const likes    = m.likes    || [];
  const comments = m.comments || [];
  const reactions= m.reactions || {};
  const tagged   = (m.taggedMembers || []).map(u => FAMILY[u]?.short).filter(Boolean);
  const liked    = likes.includes(currentUser?.uid);
  const dateStr  = m.date ? new Date(m.date + 'T12:00:00').toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '';
  const isVideo  = m.mediaType === 'video';

  // Avatar
  const saved = getSavedAv(m.uid);
  let avStyle = `background:${f.color}`;
  let avContent = f.av;
  if (saved?.type === 'photo') { avStyle = `background-image:url(${saved.value});background-size:cover;background-position:center`; avContent = ''; }
  else if (saved?.type === 'emoji') { avStyle = `background:${f.color};font-size:22px`; avContent = saved.value; }

  // Reaction summary
  const rxSummary = Object.entries(reactions)
    .map(([e, uids]) => uids?.length ? `${e}${uids.length}` : '').filter(Boolean).join(' ');

  const card = document.createElement('div');
  card.className = 'memory-card';
  card.innerHTML = `
    <div class="card-header">
      <div class="card-av" style="${avStyle}">${avContent}</div>
      <div>
        <div class="card-user-name">${f.name}<span class="card-role"> · ${f.role}</span></div>
        <div class="card-meta">
          📅 ${dateStr}${m.location ? ' · 📍 ' + m.location : ''}
        </div>
        <div class="card-badges">
          <span class="badge badge-act">${act.icon} ${act.label}</span>
          <span class="badge badge-emo">${emo.icon} ${emo.label}</span>
          ${tagged.length ? `<span class="badge badge-tag">👥 ${tagged.join(', ')}</span>` : ''}
        </div>
      </div>
    </div>
    ${isVideo
      ? `<video class="card-photo" controls playsinline preload="metadata" src="${m.photoURL}" style="background:#000;max-height:380px;object-fit:contain"></video>`
      : m.photoURL
        ? `<img class="card-photo" src="${m.photoURL}" alt="Memory" loading="lazy" onerror="this.style.display='none'">`
        : `<div class="card-no-media">${act.icon}</div>`}
    ${m.description ? `<div class="card-caption">${m.description}</div>` : ''}
    <div class="reaction-bar" id="rx-bar-${id}">${rxSummary}</div>
    <div class="card-actions">
      <button class="card-action-btn like-btn ${liked ? 'liked' : ''}" data-id="${id}">
        ${liked ? '❤️' : '🤍'} <span class="lc">${likes.length}</span>
      </button>
      <button class="card-action-btn react-btn" data-id="${id}">😊 React</button>
      <button class="card-action-btn cmt-btn" data-id="${id}">
        💬 <span class="cc">${comments.length}</span>
      </button>
    </div>
    <div class="reaction-picker" id="rp-${id}">
      ${REACTIONS.map(r => `<button class="r-opt" data-id="${id}" data-r="${r}">${r}</button>`).join('')}
    </div>
    <div class="card-comments" id="cmts-${id}">
      <div id="cmts-list-${id}">${comments.map(buildCommentHTML).join('')}</div>
      <div class="comment-input-row">
        <input class="comment-input" id="cmt-inp-${id}" placeholder="Add a comment…">
        <button class="comment-send" data-id="${id}">➤</button>
      </div>
    </div>`;

  card.querySelector('.like-btn').addEventListener('click',  () => toggleLike(id, likes, card));
  card.querySelector('.react-btn').addEventListener('click', () => {
    const rp = document.getElementById('rp-' + id);
    rp.style.display = rp.style.display === 'flex' ? 'none' : 'flex';
  });
  card.querySelectorAll('.r-opt').forEach(btn =>
    btn.addEventListener('click', () => addReaction(id, btn.dataset.r, reactions, card))
  );
  card.querySelector('.cmt-btn').addEventListener('click', () => {
    const box = document.getElementById('cmts-' + id);
    const rp  = document.getElementById('rp-' + id);
    rp.style.display = 'none';
    box.style.display = box.style.display === 'block' ? 'none' : 'block';
    if (box.style.display === 'block') setTimeout(() => document.getElementById('cmt-inp-' + id)?.focus(), 100);
  });
  card.querySelector('.comment-send').addEventListener('click',  () => postComment(id));
  card.querySelector('#cmt-inp-' + id).addEventListener('keydown', e => { if (e.key === 'Enter') postComment(id); });
  return card;
}

function buildCommentHTML(c) {
  const f = FAMILY[c.uid] || { name: 'Family', color: '#888', av: 'U' };
  const t = c.timestamp ? new Date(c.timestamp).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }) : '';
  return `<div class="comment-item">
    <div class="comment-av" style="background:${f.color}">${f.av}</div>
    <div class="comment-bubble">
      <span class="comment-author">${f.name}</span>
      <span class="comment-text">${c.text}</span>
      ${t ? `<span class="comment-time">${t}</span>` : ''}
    </div>
  </div>`;
}

async function toggleLike(id, currentLikes, card) {
  if (!currentUser) return;
  const uid = currentUser.uid, liked = currentLikes.includes(uid);
  const newLikes = liked ? currentLikes.filter(l => l !== uid) : [...currentLikes, uid];
  const btn = card.querySelector('.like-btn');
  btn.innerHTML = `${liked ? '🤍' : '❤️'} <span class="lc">${newLikes.length}</span>`;
  btn.classList.toggle('liked', !liked);
  try { await db.collection('eagles_memories').doc(id).update({ likes: newLikes }); }
  catch (e) { showToast('Could not update like'); }
}

async function addReaction(id, emoji, cur, card) {
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
    const bar = document.getElementById('rx-bar-' + id);
    if (bar) bar.textContent = Object.entries(updated).map(([e, u]) => u.length ? `${e}${u.length}` : '').filter(Boolean).join(' ');
  } catch (e) { showToast('Could not add reaction'); }
}

async function postComment(id) {
  const inp = document.getElementById('cmt-inp-' + id);
  const text = inp?.value?.trim();
  if (!text || !currentUser) return;
  inp.value = ''; inp.disabled = true;
  try {
    const ref  = db.collection('eagles_memories').doc(id);
    const snap = await ref.get();
    const comments = [...(snap.data()?.comments || [])];
    const nc = { uid: currentUser.uid, text, timestamp: new Date().toISOString() };
    comments.push(nc);
    await ref.update({ comments });
    document.getElementById('cmts-list-' + id)?.insertAdjacentHTML('beforeend', buildCommentHTML(nc));
    const cc = card?.querySelector('.cc');
    const ccEl = document.querySelector(`[data-id="${id}"].cmt-btn .cc`);
    if (ccEl) ccEl.textContent = parseInt(ccEl.textContent || 0) + 1;
  } catch (e) { showToast('Could not post comment'); }
  finally { inp.disabled = false; inp.focus(); }
}

// ============================================================
// MEDIA
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
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(v.src);
      v.duration > MAX_VIDEO_SECS
        ? reject(new Error(`Max ${MAX_VIDEO_SECS}s — yours is ${Math.round(v.duration)}s`))
        : resolve(v.duration);
    };
    v.onerror = () => reject(new Error('Cannot read video'));
    v.src = URL.createObjectURL(file);
  });
}

async function uploadToCloudinary(file, isVideo = false) {
  const fd = new FormData();
  fd.append('file', file); fd.append('upload_preset', CLOUDINARY_PRESET); fd.append('folder', 'eagles_app');
  const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${isVideo ? 'video' : 'image'}/upload`, { method:'POST', body:fd });
  const d = await r.json();
  if (!d.secure_url) throw new Error(d.error?.message || 'Upload failed');
  return d.secure_url;
}

// ============================================================
// ADD MEMORY
// ============================================================
let selAct = null, selEmo = null, selPeople = [], upFile = null, upIsVideo = false;

function setupAddMemory() {
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

  const area = document.getElementById('upload-area');
  area?.addEventListener('click', () => document.getElementById('media-input')?.click());
  document.getElementById('media-input')?.addEventListener('change', onMediaSelect);
  document.getElementById('btn-save')?.addEventListener('click', saveMemory);

  const d = document.getElementById('f-date');
  if (d) d.value = new Date().toISOString().split('T')[0];
}

async function onMediaSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  const isVid = file.type.startsWith('video/');
  const area  = document.getElementById('upload-area');
  if (isVid) {
    try {
      showToast('Checking video…');
      await checkVideoDuration(file);
      upFile = file; upIsVideo = true;
      area.innerHTML = `<video src="${URL.createObjectURL(file)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:16px" muted playsinline></video><div class="upload-label">🎬 Ready</div>`;
    } catch (err) { showToast('⚠️ ' + err.message); e.target.value = ''; }
  } else {
    upFile = file; upIsVideo = false;
    const reader = new FileReader();
    reader.onload = ev => {
      area.innerHTML = `<img src="${ev.target.result}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:16px"><div class="upload-label">📷 Ready</div>`;
    };
    reader.readAsDataURL(file);
  }
}

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
      if (upIsVideo) { showToast('📤 Uploading video…'); mediaURL = await uploadToCloudinary(upFile, true); }
      else           { showToast('📤 Compressing photo…'); const c = await compressImage(upFile); mediaURL = await uploadToCloudinary(c); }
    } catch (e) { console.error(e); showToast('Upload failed — saving without media'); }
  }

  if (!selPeople.includes(currentUser.uid)) selPeople.unshift(currentUser.uid);

  try {
    await db.collection('eagles_memories').add({
      uid: currentUser.uid, photoURL: mediaURL,
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
  } catch (e) { showToast('Error saving — try again'); console.error(e); }
  finally {
    showLoading(false);
    if (btn) { btn.disabled = false; btn.innerHTML = '🦅 Save Memory'; }
  }
}

function resetAddForm() {
  selAct = null; selEmo = null; selPeople = []; upFile = null; upIsVideo = false;
  const d = document.getElementById('f-date'); if (d) d.value = new Date().toISOString().split('T')[0];
  ['f-location','f-caption'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const mi = document.getElementById('media-input'); if (mi) mi.value = '';
  const area = document.getElementById('upload-area');
  if (area) area.innerHTML = `<div class="upload-area-icon">📷</div><div class="upload-area-text">Tap to add photo or video</div><div class="upload-area-hint">Auto-compressed · Videos up to 20s</div>`;
  document.querySelectorAll('#activity-chips .chip, #emotion-chips .chip, #tag-chips .chip').forEach(c => c.classList.remove('selected'));
}

// ============================================================
// CALENDAR
// ============================================================
let calY = new Date().getFullYear(), calM = new Date().getMonth(), calDates = new Set();
function setupCalendar() {
  document.getElementById('cal-prev')?.addEventListener('click', () => { calM--; if (calM < 0) { calM = 11; calY--; } renderCal(); });
  document.getElementById('cal-next')?.addEventListener('click', () => { calM++; if (calM > 11) { calM = 0; calY++; } renderCal(); });
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
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => { const el = document.createElement('div'); el.className = 'cal-hdr'; el.textContent = d; grid.appendChild(el); });
  const first = new Date(calY, calM, 1).getDay(), days = new Date(calY, calM + 1, 0).getDate(), today = new Date();
  for (let i = 0; i < first; i++) { const el = document.createElement('div'); el.className = 'cal-day empty'; grid.appendChild(el); }
  for (let d = 1; d <= days; d++) {
    const el = document.createElement('div'); el.className = 'cal-day'; el.textContent = d;
    const ds = `${calY}-${String(calM+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if (today.getDate() === d && today.getMonth() === calM && today.getFullYear() === calY) el.classList.add('today');
    if (calDates.has(ds)) el.classList.add('has-memory');
    el.addEventListener('click', () => { grid.querySelectorAll('.cal-day').forEach(x => x.classList.remove('selected')); el.classList.add('selected'); loadDayMemories(ds); });
    grid.appendChild(el);
  }
}
async function loadDayMemories(ds) {
  const list  = document.getElementById('cal-day-list');
  const title = document.getElementById('cal-day-title');
  const fmt   = new Date(ds + 'T12:00:00').toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' });
  if (title) title.textContent = fmt;
  if (!list) return;
  try {
    const snap = await db.collection('eagles_memories').where('date', '==', ds).get();
    list.innerHTML = '';
    if (snap.empty) { list.innerHTML = '<p class="cal-empty">No memories on this day</p>'; return; }
    snap.docs.forEach(doc => {
      const m = doc.data(), f = FAMILY[m.uid] || { name:'Family', color:'#1a3a5c' }, act = ACTIVITIES.find(a => a.id === m.activity) || { icon:'📍' };
      const card = document.createElement('div'); card.className = 'cal-mini-card';
      card.innerHTML = `${m.photoURL && m.mediaType !== 'video' ? `<img class="cal-mini-photo" src="${m.photoURL}" loading="lazy">` : `<div class="cal-mini-photo cal-mini-icon">${act.icon}</div>`}<div><div class="cal-mini-name">${f.name}</div><div class="cal-mini-desc">${(m.description||'').substring(0,60)}${(m.description||'').length>60?'…':''}</div></div>`;
      list.appendChild(card);
    });
  } catch { list.innerHTML = '<p class="cal-empty">Could not load</p>'; }
}

// ============================================================
// ACTIVITIES
// ============================================================
let actFilter = 'all';
async function loadActivities() {
  const fr = document.getElementById('filter-row');
  if (fr) {
    fr.innerHTML = '';
    const all = document.createElement('div'); all.className = `filter-chip${actFilter === 'all' ? ' active' : ''}`; all.innerHTML = '🌟 All';
    all.addEventListener('click', () => { actFilter = 'all'; loadActivities(); }); fr.appendChild(all);
    ACTIVITIES.forEach(a => {
      const c = document.createElement('div'); c.className = `filter-chip${actFilter === a.id ? ' active' : ''}`; c.innerHTML = `${a.icon} ${a.label}`;
      c.addEventListener('click', () => { actFilter = a.id; loadActivities(); }); fr.appendChild(c);
    });
  }
  const grid = document.getElementById('acts-grid'); if (!grid) return;
  grid.innerHTML = '<div class="acts-empty">Loading…</div>';
  try {
    let q = db.collection('eagles_memories').orderBy('timestamp', 'desc');
    if (actFilter !== 'all') q = q.where('activity', '==', actFilter);
    const snap = await q.get(); grid.innerHTML = '';
    if (snap.empty) { grid.innerHTML = '<div class="acts-empty">No memories for this activity yet</div>'; return; }
    snap.docs.forEach(doc => {
      const m = doc.data(), f = FAMILY[m.uid] || { name:'Family' }, act = ACTIVITIES.find(a => a.id === m.activity) || { icon:'📍', label:m.activity };
      const card = document.createElement('div'); card.className = 'act-card';
      card.innerHTML = `${m.photoURL && m.mediaType !== 'video' ? `<img class="act-photo" src="${m.photoURL}" loading="lazy">` : `<div class="act-no-photo">${act.icon}</div>`}<div class="act-info"><div class="act-name">${f.name}</div><div class="act-meta">${act.icon} ${act.label} · ${m.date||''}</div></div>`;
      grid.appendChild(card);
    });
  } catch { grid.innerHTML = '<div class="acts-empty">Could not load</div>'; }
}

// ============================================================
// PROFILE
// ============================================================
async function loadProfile() {
  if (!currentUser) return;
  const f = FAMILY[currentUser.uid] || {};
  const pav = document.getElementById('profile-av');
  const saved = getSavedAv(currentUser.uid);
  if (saved && pav) applyAv(pav, saved, f.color);
  else if (pav) { pav.textContent = f.av; pav.style.background = `linear-gradient(135deg,${f.color},#c9a84c)`; }
  const $ = id => document.getElementById(id);
  if ($('profile-name')) $('profile-name').textContent = f.name;
  if ($('profile-role')) $('profile-role').textContent = f.role;
  try {
    const snap = await db.collection('eagles_memories').get();
    const all  = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const mine = all.filter(m => m.uid === currentUser.uid);
    if ($('stat-mem'))  $('stat-mem').textContent  = mine.length;
    if ($('stat-got'))  $('stat-got').textContent  = mine.reduce((s, m) => s + (m.likes||[]).length, 0);
    if ($('stat-gave')) $('stat-gave').textContent = all.reduce((s, m) => s + ((m.likes||[]).includes(currentUser.uid) ? 1 : 0), 0);
    const roster = $('family-roster');
    if (roster) {
      roster.innerHTML = '';
      Object.entries(FAMILY).forEach(([uid, f]) => {
        const mm = all.filter(m => m.uid === uid);
        const row = document.createElement('div'); row.className = 'fam-row';
        row.innerHTML = `<div class="fam-av" style="background:${f.color}">${f.av}</div><div class="fam-info"><div class="fam-name">${f.name}</div><div class="fam-role">${f.role}</div></div><div class="fam-count">${mm.length} memories</div>`;
        roster.appendChild(row);
      });
    }
  } catch (e) { console.error('Profile:', e); }
}

// ============================================================
// AVATAR PICKER
// ============================================================
function openAvatarModal() {
  const modal = document.getElementById('avatar-modal');
  if (modal) modal.style.display = 'flex';
  const grid = document.getElementById('avatar-emoji-grid');
  if (grid) {
    grid.innerHTML = '';
    AVATAR_CHARS.forEach(ch => {
      const btn = document.createElement('button'); btn.className = 'av-opt'; btn.textContent = ch;
      btn.addEventListener('click', () => saveAvatar({ type:'emoji', value:ch }));
      grid.appendChild(btn);
    });
  }
  const bindInput = id => {
    document.getElementById(id)?.addEventListener('change', async e => {
      const file = e.target.files[0]; if (!file) return;
      showLoading(true);
      try { const c = await compressImage(file, 400, 0.85); const url = await uploadToCloudinary(c); saveAvatar({ type:'photo', value:url }); }
      catch { showToast('Upload failed'); showLoading(false); }
    }, { once: true });
  };
  bindInput('av-photo'); bindInput('av-camera');
}
function closeAvatarModal() {
  const modal = document.getElementById('avatar-modal');
  if (modal) modal.style.display = 'none';
}
function saveAvatar(data) {
  if (!currentUser) return;
  localStorage.setItem('eagles_av_' + currentUser.uid, JSON.stringify(data));
  const f = FAMILY[currentUser.uid] || {};
  applyAv(document.getElementById('profile-av'), data, f.color);
  applyAv(document.getElementById('header-avatar'), data, f.color);
  closeAvatarModal();
  buildStoryRow();
  showLoading(false);
  showToast('✅ Avatar updated!');
}

// ============================================================
// iCAL EXPORT
// ============================================================
async function exportCalendar() {
  showLoading(true);
  try {
    const snap = await db.collection('eagles_memories').orderBy('timestamp','desc').get();
    if (snap.empty) { showToast('No memories to export'); showLoading(false); return; }
    const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Eagles Family App//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Eagles Family Memories','X-WR-TIMEZONE:Asia/Dubai'];
    snap.docs.forEach(doc => {
      const m = doc.data(), f = FAMILY[m.uid]||{name:'Family'};
      const act = ACTIVITIES.find(a => a.id === m.activity)||{icon:'📍',label:m.activity||'Memory'};
      const emo = EMOTIONS.find(e => e.id === m.emotion)||{icon:'😊',label:''};
      const tagged = (m.taggedMembers||[]).map(u => FAMILY[u]?.name).filter(Boolean).join(', ');
      const ds = (m.date||'2025-01-01').replace(/-/g,'');
      lines.push('BEGIN:VEVENT', `UID:eagles-${doc.id}@kumar`, `DTSTART;VALUE=DATE:${ds}`, `DTEND;VALUE=DATE:${ds}`,
        `SUMMARY:${act.icon} ${act.label} – ${f.name}${tagged?' with '+tagged:''}`,
        `DESCRIPTION:${[m.description, m.location?'📍 '+m.location:'', emo.label, tagged?'👥 '+tagged:''].filter(Boolean).join('\\n')}`,
        m.location ? `LOCATION:${m.location}` : '', 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.filter(Boolean).join('\r\n')], { type:'text/calendar;charset=utf-8' });
    const a = Object.assign(document.createElement('a'), { href:URL.createObjectURL(blob), download:'eagles-memories.ics' });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast('📅 Exported! Open the .ics file in Outlook');
  } catch (e) { showToast('Export failed'); console.error(e); }
  showLoading(false);
}

// ============================================================
// UTILS
// ============================================================
function registerSW() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(() => {});
}
function showLoading(v) {
  document.getElementById('loading-overlay')?.classList.toggle('show', v);
}
function showToast(msg, dur = 3000) {
  const t = document.getElementById('toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), dur);
}
function logout() {
  if (feedUnsub) { feedUnsub(); feedUnsub = null; }
  auth.signOut().then(() => { currentUser = null; showScreen('login'); showToast('Signed out 👋'); });
}
