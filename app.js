// ============================================================
// EAGLES v5 — Kumar Family Memory App
// Fixes: install flow, iOS tip position, login UX, feed smoothness
// New: tap-to-login, install confirm dialog, emoji reactions,
//      on-this-day memories, pull-to-refresh, smooth transitions
// ============================================================

const CLOUDINARY_CLOUD  = 'dmpb99wde';
const CLOUDINARY_PRESET = 'qrlcory1';
const MAX_VIDEO_SECONDS = 20;

let db, auth, currentUser = null, unsubscribeFeed = null, deferredInstall = null;

const AVATAR_CHARS = ['🦅','🦁','🐯','🦊','🐻','🐼','🦋','🌟','🏄','⛷️','🎸','📸','🌍','🏆','🎯','🦸','🧳','🌴','🎭','🐬','🌊','🎨'];

const FAMILY = {
  "demo-raj-001":     { name:"Raj Kumar",     short:"Raj",     role:"Dad",      avatar:"R", color:"#1a3a5c" },
  "demo-fiona-002":   { name:"Fiona Kumar",   short:"Fiona",   role:"Mum",      avatar:"F", color:"#c8763a" },
  "demo-natasha-003": { name:"Natasha Kumar", short:"Natasha", role:"Daughter", avatar:"N", color:"#2d7d5a" },
  "demo-tanya-004":   { name:"Tanya Kumar",   short:"Tanya",   role:"Daughter", avatar:"T", color:"#7d2d6b" }
};

// Hardcoded credentials — add these in Firebase Auth console
const FAMILY_LOGINS = {
  "demo-raj-001":     { email:"raj@kumar.family",     password:"Eagles2025!" },
  "demo-fiona-002":   { email:"fiona@kumar.family",   password:"Eagles2025!" },
  "demo-natasha-003": { email:"natasha@kumar.family", password:"Eagles2025!" },
  "demo-tanya-004":   { email:"tanya@kumar.family",   password:"Eagles2025!" }
};
const DEMO_CREDENTIALS = { email:"demo@eagles.app", password:"Eagles2025!" };

const ACTIVITIES = [
  {id:"golf",icon:"⛳",label:"Golf"},{id:"padel",icon:"🎾",label:"Padel"},
  {id:"football",icon:"⚽",label:"Football"},{id:"beach",icon:"🏖️",label:"Beach"},
  {id:"travel",icon:"✈️",label:"Travel"},{id:"food",icon:"🍽️",label:"Food"},
  {id:"adventure",icon:"🧗",label:"Adventure"},{id:"family",icon:"👨‍👩‍👧‍👧",label:"Family"}
];

const EMOTIONS = [
  {id:"happy",icon:"😊",label:"Happy"},{id:"loved",icon:"❤️",label:"Loved it"},
  {id:"fun",icon:"🎉",label:"Fun"},{id:"amazing",icon:"🤩",label:"Amazing"},
  {id:"family",icon:"🥰",label:"Family Moment"}
];

const QUICK_REACTIONS = ["❤️","🤩","😂","🥰","🔥","👏"];

const SEED_MEMORIES = [
  {uid:"demo-raj-001",photoURL:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",mediaType:"image",date:"2025-03-15",location:"Dubai, UAE",description:"Perfect round at Emirates Golf Club! The course was immaculate 🏌️",activity:"golf",emotion:"amazing",taggedMembers:["demo-raj-001"],likes:["demo-fiona-002","demo-natasha-003"],comments:[{uid:"demo-fiona-002",text:"So proud! What was your score? 😍",timestamp:"2025-03-15T11:30:00"}],reactions:{},timestamp:new Date("2025-03-15T09:00:00")},
  {uid:"demo-fiona-002",photoURL:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",mediaType:"image",date:"2025-03-10",location:"Dubai Marina, UAE",description:"Dubai skyline at sunset – absolutely breathtaking 🌇",activity:"travel",emotion:"amazing",taggedMembers:["demo-fiona-002","demo-raj-001"],likes:["demo-raj-001","demo-natasha-003","demo-tanya-004"],comments:[{uid:"demo-tanya-004",text:"Miss this so much! 😭",timestamp:"2025-03-10T20:00:00"}],reactions:{},timestamp:new Date("2025-03-10T19:00:00")},
  {uid:"demo-natasha-003",photoURL:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",mediaType:"image",date:"2025-02-22",location:"Jumeirah Beach, Dubai",description:"Beach day with the whole family 🌊☀️ Perfect weather!",activity:"beach",emotion:"loved",taggedMembers:["demo-natasha-003","demo-tanya-004","demo-fiona-002","demo-raj-001"],likes:["demo-raj-001","demo-fiona-002"],comments:[],reactions:{},timestamp:new Date("2025-02-22T15:00:00")},
  {uid:"demo-raj-001",photoURL:"https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",mediaType:"image",date:"2025-02-14",location:"Nad Al Sheba, Dubai",description:"Padel tournament – won the final in a tie-break! 🎾🔥",activity:"padel",emotion:"amazing",taggedMembers:["demo-raj-001"],likes:["demo-fiona-002","demo-tanya-004"],comments:[{uid:"demo-natasha-003",text:"Dad the champion! 🏆",timestamp:"2025-02-14T18:00:00"}],reactions:{},timestamp:new Date("2025-02-14T16:00:00")},
  {uid:"demo-fiona-002",photoURL:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",mediaType:"image",date:"2025-02-08",location:"Nobu, Dubai",description:"Family dinner at Nobu – the black cod was incredible 🍽️",activity:"food",emotion:"family",taggedMembers:["demo-raj-001","demo-fiona-002","demo-natasha-003","demo-tanya-004"],likes:["demo-raj-001","demo-natasha-003","demo-tanya-004"],comments:[{uid:"demo-raj-001",text:"Best night of the year!",timestamp:"2025-02-08T22:00:00"}],reactions:{},timestamp:new Date("2025-02-08T21:00:00")},
  {uid:"demo-tanya-004",photoURL:"https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&q=80",mediaType:"image",date:"2025-01-30",location:"Marbella, Spain",description:"Holiday breakfast in the sunshine ☀️🥐",activity:"travel",emotion:"happy",taggedMembers:["demo-tanya-004","demo-fiona-002"],likes:["demo-raj-001","demo-fiona-002","demo-natasha-003"],comments:[],reactions:{},timestamp:new Date("2025-01-30T09:30:00")},
  {uid:"demo-natasha-003",photoURL:"https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&q=80",mediaType:"image",date:"2025-01-20",location:"London, UK",description:"Weekend in London! Borough Market and the Thames 🇬🇧",activity:"travel",emotion:"fun",taggedMembers:["demo-natasha-003"],likes:["demo-tanya-004"],comments:[{uid:"demo-fiona-002",text:"Wish I was there! 😍",timestamp:"2025-01-20T16:00:00"}],reactions:{},timestamp:new Date("2025-01-20T14:00:00")},
  {uid:"demo-tanya-004",photoURL:"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",mediaType:"image",date:"2025-01-15",location:"Dubai, UAE",description:"Family movie night – popcorn and blankets 🎬🍿",activity:"family",emotion:"family",taggedMembers:["demo-raj-001","demo-fiona-002","demo-natasha-003","demo-tanya-004"],likes:["demo-raj-001","demo-fiona-002","demo-natasha-003"],comments:[{uid:"demo-natasha-003",text:"The best! Every week! 😂",timestamp:"2025-01-15T21:00:00"}],reactions:{},timestamp:new Date("2025-01-15T20:00:00")},
  {uid:"demo-raj-001",photoURL:"https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80",mediaType:"image",date:"2025-01-05",location:"Dubai Hills, UAE",description:"Saturday morning football ⚽💪 Nothing like a kickabout with the lads.",activity:"football",emotion:"fun",taggedMembers:["demo-raj-001"],likes:["demo-fiona-002"],comments:[],reactions:{},timestamp:new Date("2025-01-05T08:00:00")},
  {uid:"demo-fiona-002",photoURL:"https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",mediaType:"image",date:"2024-12-28",location:"Swiss Alps",description:"New Year trip to the Alps – absolute magic 🏔️❄️",activity:"adventure",emotion:"amazing",taggedMembers:["demo-raj-001","demo-fiona-002","demo-natasha-003","demo-tanya-004"],likes:["demo-raj-001","demo-natasha-003","demo-tanya-004"],comments:[{uid:"demo-natasha-003",text:"Best trip EVER!",timestamp:"2024-12-28T17:00:00"},{uid:"demo-tanya-004",text:"Can we go back?! ❄️",timestamp:"2024-12-28T18:00:00"}],reactions:{},timestamp:new Date("2024-12-28T16:00:00")}
];

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  buildLoginCards();
  setupEmailLogin();
  setupNav();
  setupAddMemory();
  setupCalendar();
  setupPWAInstall();
  registerServiceWorker();
  // Auto-dismiss splash after 1.5s
  setTimeout(() => {
    const splash = document.getElementById('splash');
    if (splash) splash.style.opacity = '0';
    setTimeout(() => showScreen('login'), 500);
  }, 1500);
});

function initFirebase() {
  try {
    firebase.initializeApp(firebaseConfig);
    db   = firebase.firestore();
    auth = firebase.auth();
    auth.onAuthStateChanged(user => {
      if (user) { currentUser = user; onLoggedIn(); }
    });
  } catch(e) { console.error('Firebase:', e); }
}

// ============================================================
// PWA INSTALL — simple confirm dialog, then native prompt
// ============================================================
function setupPWAInstall() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstall = e; // store silently, never auto-trigger
  });
  window.addEventListener('appinstalled', () => {
    showToast('🦅 Eagles is on your home screen!');
    deferredInstall = null;
    // After install, ask for notifications
    setTimeout(requestNotifications, 1500);
  });
}

// Called when user taps "Install Eagles App" in profile
async function triggerInstall() {
  const isStandalone = window.matchMedia('(display-mode:standalone)').matches || !!window.navigator.standalone;
  if (isStandalone) { showToast('✅ Eagles is already installed!'); return; }

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIOS) {
    // Show the iOS guide tip (positioned safely above nav)
    const tip = document.getElementById('ios-tip');
    if (tip) { tip.classList.add('show'); setTimeout(() => tip.classList.remove('show'), 12000); }
    return;
  }

  // Android/Chrome: show a friendly confirm dialog first
  showInstallConfirm();
}

function showInstallConfirm() {
  const dialog = document.getElementById('install-dialog');
  if (dialog) dialog.classList.add('show');
}

async function confirmInstall() {
  document.getElementById('install-dialog')?.classList.remove('show');
  if (deferredInstall) {
    await deferredInstall.prompt();
    const choice = await deferredInstall.userChoice;
    deferredInstall = null;
    if (choice.outcome === 'accepted') {
      showToast('🦅 Installing Eagles…');
    }
  } else {
    showToast('Tap ⋮ menu → "Add to Home screen"');
  }
}

function dismissInstallConfirm() {
  document.getElementById('install-dialog')?.classList.remove('show');
}

// ============================================================
// LOGIN — tap your face, no typing
// ============================================================
function buildLoginCards() {
  const container = document.getElementById('family-cards');
  if (!container) return;
  container.innerHTML = '';
  Object.entries(FAMILY).forEach(([uid, f]) => {
    const card = document.createElement('div');
    card.className = 'family-login-card';
    card.innerHTML = `
      <div class="family-login-avatar" style="background:linear-gradient(135deg,${f.color},${f.color}cc)">${f.avatar}</div>
      <div class="family-login-name">${f.short}</div>
      <div class="family-login-role">${f.role}</div>`;
    card.addEventListener('click', () => loginAsFamily(uid));
    container.appendChild(card);
  });
}

async function loginAsFamily(uid) {
  const creds = FAMILY_LOGINS[uid];
  if (!creds) { showLoginError('No account set up for this family member yet.'); return; }
  showLoading(true);
  clearLoginError();
  try {
    await auth.signInWithEmailAndPassword(creds.email, creds.password);
  } catch(e) {
    // Try creating account on first use
    try {
      await auth.createUserWithEmailAndPassword(creds.email, creds.password);
    } catch(e2) {
      showLoading(false);
      showLoginError('Sign in failed. Please check Firebase Auth has this email added.');
    }
  }
}

function setupEmailLogin() {
  document.getElementById('btn-do-login')?.addEventListener('click', handleEmailLogin);
  document.getElementById('login-password')?.addEventListener('keydown', e => { if(e.key==='Enter') handleEmailLogin(); });
}

async function handleEmailLogin() {
  const email = document.getElementById('login-email')?.value.trim();
  const pass  = document.getElementById('login-password')?.value;
  if (!email||!pass) { showLoginError('Please enter email and password'); return; }
  showLoading(true); clearLoginError();
  try { await auth.signInWithEmailAndPassword(email, pass); }
  catch(e) { showLoading(false); showLoginError('Invalid email or password.'); }
}

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function clearLoginError() {
  const el = document.getElementById('login-error');
  if (el) { el.style.display = 'none'; el.textContent = ''; }
}

// ============================================================
// POST LOGIN
// ============================================================
async function onLoggedIn() {
  showLoading(false);
  showScreen('app');
  updateHeaderAvatar();
  buildStoryRow();
  loadFeed();           // real-time listener starts immediately
  loadCalendar();
  showPage('home');
  ensureDemoData();     // seeds in background if needed
  setTimeout(requestNotifications, 4000); // ask after user is settled
}

async function requestNotifications() {
  if ('Notification' in window && Notification.permission === 'default') {
    const result = await Notification.requestPermission();
    if (result === 'granted') showToast('🔔 Notifications enabled!');
  }
}

async function ensureDemoData() {
  try {
    const snap = await db.collection('eagles_memories').limit(1).get();
    if (snap.empty) {
      const batch = db.batch();
      SEED_MEMORIES.forEach(m => batch.set(db.collection('eagles_memories').doc(), m));
      await batch.commit();
      showToast('🦅 Family memories loaded!');
    }
  } catch(e) { console.error('Seed:', e); }
}

function getFamilyInfo(uid) {
  return FAMILY[uid] || { name: currentUser?.displayName||'User', short:'User', role:'Member', avatar:'U', color:'#1a3a5c' };
}
function getSavedAvatar(uid) {
  try { const s = localStorage.getItem(`eagles_avatar_${uid}`); return s ? JSON.parse(s) : null; } catch(e) { return null; }
}
function renderAvatarEl(el, data, fallbackColor) {
  if (!el||!data) return;
  el.style.backgroundImage=''; el.style.backgroundSize=''; el.style.backgroundPosition=''; el.textContent='';
  if (data.type==='photo') {
    el.style.backgroundImage=`url(${data.value})`; el.style.backgroundSize='cover'; el.style.backgroundPosition='center';
  } else {
    el.textContent = data.value;
    el.style.fontSize = data.type==='emoji' ? '22px' : '15px';
    if (fallbackColor) el.style.background = `linear-gradient(135deg,${fallbackColor},#c9a84c)`;
  }
}
function updateHeaderAvatar() {
  const info = getFamilyInfo(currentUser?.uid);
  const el = document.getElementById('header-avatar');
  if (!el) return;
  const saved = getSavedAvatar(currentUser?.uid);
  if (saved) renderAvatarEl(el, saved, info.color);
  else { el.textContent=info.avatar; el.style.background=`linear-gradient(135deg,${info.color},#c9a84c)`; el.style.fontSize='15px'; }
}

function buildStoryRow() {
  const row = document.getElementById('story-row');
  if (!row) return;
  row.innerHTML = `
    <div class="story-item" onclick="showPage('add')">
      <div class="story-ring add-ring"><div class="story-avatar" style="background:linear-gradient(135deg,#c9a84c,#e07b4a);font-size:26px;color:white">+</div></div>
      <div class="story-name">Add</div>
    </div>`;
  Object.entries(FAMILY).forEach(([uid, f]) => {
    const saved = getSavedAvatar(uid);
    let avStyle = `background:${f.color};font-size:18px;color:white`;
    let avContent = f.avatar;
    if (saved?.type==='photo') { avStyle=`background-image:url(${saved.value});background-size:cover;background-position:center`; avContent=''; }
    else if (saved?.type==='emoji') { avStyle=`background:${f.color};font-size:22px`; avContent=saved.value; }
    const item = document.createElement('div');
    item.className = 'story-item';
    item.innerHTML = `<div class="story-ring"><div class="story-avatar" style="${avStyle}">${avContent}</div></div><div class="story-name">${f.short}</div>`;
    row.appendChild(item);
  });
}

// ============================================================
// NAVIGATION
// ============================================================
function setupNav() {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
      item.classList.add('active');
      showPage(item.dataset.page);
    });
  });
}
function showPage(name) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(`page-${name}`)?.classList.add('active');
  if(name==='activities') renderActivities();
  if(name==='profile')    renderProfile();
  if(name==='calendar')   loadCalendar();
}

// ============================================================
// HOME FEED — real-time, loads immediately on login
// ============================================================
function loadFeed() {
  if(unsubscribeFeed) unsubscribeFeed();
  const container = document.getElementById('memory-feed');
  if (!container) return;
  container.innerHTML = '<div class="feed-loading"><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>';
  unsubscribeFeed = db.collection('eagles_memories')
    .orderBy('timestamp','desc')
    .onSnapshot(snap => {
      if (snap.empty) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">📷</div><h3>No memories yet</h3><p>Be the first to add one!</p></div>';
        return;
      }
      container.innerHTML = '';
      // On This Day banner
      const today = new Date();
      const todayStr = `${String(today.getDate()).padStart(2,'0')} ${today.toLocaleString('en',{month:'short'})}`;
      const onThisDay = snap.docs.filter(doc => {
        const d = doc.data().date;
        if (!d) return false;
        const mem = new Date(d+'T12:00:00');
        return mem.getDate()===today.getDate() && mem.getMonth()===today.getMonth() && mem.getFullYear()!==today.getFullYear();
      });
      if (onThisDay.length > 0) {
        const banner = document.createElement('div');
        banner.className = 'on-this-day-banner';
        banner.innerHTML = `<div class="otd-title">🗓️ On This Day</div><div class="otd-sub">${onThisDay.length} memory${onThisDay.length>1?'s':''} from this date in past years</div>`;
        banner.addEventListener('click', () => {
          onThisDay.forEach(doc => {
            const card = buildMemoryCard(doc.id, doc.data());
            card.style.border = '2px solid var(--gold)';
            container.prepend(card);
          });
          banner.remove();
        });
        container.appendChild(banner);
      }
      snap.docs.forEach(doc => container.appendChild(buildMemoryCard(doc.id, doc.data())));
    }, err => console.error('Feed error:', err));
}

function buildMemoryCard(id, m) {
  const info     = FAMILY[m.uid]||{name:m.uid,role:'Member',avatar:'U',color:'#1a3a5c',short:'User'};
  const activity = ACTIVITIES.find(a=>a.id===m.activity)||{icon:'📍',label:m.activity||''};
  const emotion  = EMOTIONS.find(e=>e.id===m.emotion)||{icon:'😊',label:''};
  const likes    = m.likes||[], comments = m.comments||[];
  const reactions= m.reactions||{};
  const tagged   = (m.taggedMembers||[]).map(uid=>FAMILY[uid]?.short).filter(Boolean);
  const liked    = likes.includes(currentUser?.uid);
  const isVideo  = m.mediaType==='video';
  const dateStr  = m.date ? new Date(m.date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '';

  // Avatar HTML
  const saved = getSavedAvatar(m.uid);
  let avHTML='';
  if (saved?.type==='photo') avHTML=`<div class="card-avatar" style="background-image:url(${saved.value});background-size:cover;background-position:center"></div>`;
  else if (saved?.type==='emoji') avHTML=`<div class="card-avatar" style="background:${info.color};font-size:22px">${saved.value}</div>`;
  else avHTML=`<div class="card-avatar" style="background:${info.color}">${info.avatar}</div>`;

  // Reaction summary
  const reactionSummary = Object.entries(reactions)
    .map(([emoji,uids])=>uids?.length?`${emoji}${uids.length}`:'').filter(Boolean).join(' ');

  const card = document.createElement('div');
  card.className = 'memory-card';
  card.innerHTML = `
    <div class="card-header">
      ${avHTML}
      <div class="card-user-info">
        <div class="card-user-name">${info.name} <span class="card-role-tag">${info.role}</span></div>
        <div class="card-meta">
          <span>📅 ${dateStr}</span>
          ${m.location?`<span>📍 ${m.location}</span>`:''}
        </div>
        <div class="card-badges">
          <span class="badge-activity">${activity.icon} ${activity.label}</span>
          <span class="badge-emotion">${emotion.icon} ${emotion.label}</span>
          ${tagged.length?`<span class="badge-tagged">👥 ${tagged.join(', ')}</span>`:''}
        </div>
      </div>
    </div>
    ${isVideo
      ? `<video class="card-photo" controls playsinline preload="metadata" src="${m.photoURL}" style="background:#000;width:100%;max-height:400px;object-fit:contain"></video>`
      : m.photoURL
        ? `<img class="card-photo" src="${m.photoURL}" alt="Memory" loading="lazy" onerror="this.style.display='none'">`
        : `<div class="card-no-photo">${activity.icon}</div>`}
    ${m.description?`<div class="card-caption">${m.description}</div>`:''}
    ${reactionSummary?`<div class="reaction-summary">${reactionSummary}</div>`:''}
    <div class="card-actions">
      <button class="action-btn like-btn ${liked?'liked':''}" data-id="${id}">
        ${liked?'❤️':'🤍'} <span class="like-count">${likes.length}</span>
      </button>
      <button class="action-btn react-btn" data-id="${id}">😊 React</button>
      <button class="action-btn comment-btn" data-id="${id}">
        💬 <span class="cmt-count">${comments.length}</span>
      </button>
    </div>
    <div class="reaction-picker" id="rp-${id}" style="display:none">
      ${QUICK_REACTIONS.map(r=>`<button class="reaction-opt" data-id="${id}" data-emoji="${r}">${r}</button>`).join('')}
    </div>
    <div class="card-comments" id="comments-${id}" style="display:none">
      <div class="comments-list" id="clist-${id}">${comments.map(c=>buildCommentHTML(c)).join('')}</div>
      <div class="comment-input-row">
        <input class="comment-input" placeholder="Add a comment…" id="ci-${id}">
        <button class="comment-send" data-id="${id}">➤</button>
      </div>
    </div>`;

  card.querySelector('.like-btn').addEventListener('click', ()=>toggleLike(id,likes,card));
  card.querySelector('.react-btn').addEventListener('click', ()=>{
    const rp = document.getElementById(`rp-${id}`);
    rp.style.display = rp.style.display==='none'?'flex':'none';
  });
  card.querySelectorAll('.reaction-opt').forEach(btn=>{
    btn.addEventListener('click', ()=>addReaction(id, btn.dataset.emoji, reactions, card));
  });
  card.querySelector('.comment-btn').addEventListener('click', ()=>{
    const el=document.getElementById(`comments-${id}`);
    el.style.display=el.style.display==='none'?'block':'none';
    document.getElementById(`rp-${id}`).style.display='none';
    if(el.style.display==='block') setTimeout(()=>document.getElementById(`ci-${id}`)?.focus(),150);
  });
  card.querySelector('.comment-send').addEventListener('click', ()=>postComment(id));
  card.querySelector(`#ci-${id}`).addEventListener('keydown', e=>{if(e.key==='Enter')postComment(id);});
  return card;
}

function buildCommentHTML(c) {
  const ci=FAMILY[c.uid]||{name:'Family',color:'#888',avatar:'U'};
  const t=c.timestamp?new Date(c.timestamp).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):'';
  return `<div class="comment-item">
    <div class="comment-avatar" style="background:${ci.color}">${ci.avatar}</div>
    <div class="comment-bubble">
      <span class="comment-author">${ci.name}</span>
      <span class="comment-text">${c.text}</span>
      ${t?`<span class="comment-time">${t}</span>`:''}
    </div>
  </div>`;
}

async function toggleLike(id, currentLikes, card) {
  if(!currentUser)return;
  const uid=currentUser.uid, liked=currentLikes.includes(uid);
  const newLikes=liked?currentLikes.filter(l=>l!==uid):[...currentLikes,uid];
  // Optimistic UI
  const btn=card.querySelector('.like-btn');
  btn.innerHTML=`${liked?'🤍':'❤️'} <span class="like-count">${newLikes.length}</span>`;
  btn.classList.toggle('liked',!liked);
  try { await db.collection('eagles_memories').doc(id).update({likes:newLikes}); }
  catch(e) { showToast('Could not update like'); }
}

async function addReaction(id, emoji, currentReactions, card) {
  if(!currentUser)return;
  document.getElementById(`rp-${id}`).style.display='none';
  const uid=currentUser.uid;
  const updated = {...currentReactions};
  if (!updated[emoji]) updated[emoji]=[];
  if (updated[emoji].includes(uid)) updated[emoji]=updated[emoji].filter(u=>u!==uid);
  else updated[emoji]=[...updated[emoji],uid];
  // Clean empty
  Object.keys(updated).forEach(k=>{ if(!updated[k].length) delete updated[k]; });
  try {
    await db.collection('eagles_memories').doc(id).update({reactions:updated});
    const sum = card.querySelector('.reaction-summary');
    const txt = Object.entries(updated).map(([e,u])=>u.length?`${e}${u.length}`:'').filter(Boolean).join(' ');
    if (sum) sum.textContent=txt;
    else if (txt) {
      const div=document.createElement('div'); div.className='reaction-summary'; div.textContent=txt;
      card.querySelector('.card-caption')?.after(div);
    }
  } catch(e) { showToast('Could not add reaction'); }
}

async function postComment(id) {
  const input=document.getElementById(`ci-${id}`);
  const text=input?.value?.trim();
  if(!text||!currentUser)return;
  input.value=''; input.disabled=true;
  try {
    const docRef=db.collection('eagles_memories').doc(id);
    const snap=await docRef.get();
    const comments=[...(snap.data()?.comments||[])];
    const nc={uid:currentUser.uid,text,timestamp:new Date().toISOString()};
    comments.push(nc);
    await docRef.update({comments});
    document.getElementById(`clist-${id}`)?.insertAdjacentHTML('beforeend',buildCommentHTML(nc));
    const cc=document.querySelector(`[data-id="${id}"].comment-btn .cmt-count`);
    if(cc) cc.textContent=parseInt(cc.textContent||0)+1;
  } catch(e) { showToast('Could not post comment'); }
  finally { input.disabled=false; input.focus(); }
}

// ============================================================
// MEDIA COMPRESSION + UPLOAD
// ============================================================
function compressImage(file, maxWidth=1200, quality=0.82) {
  return new Promise(resolve=>{
    const reader=new FileReader();
    reader.onload=ev=>{
      const img=new Image();
      img.onload=()=>{
        const canvas=document.createElement('canvas');
        let {width,height}=img;
        if(width>maxWidth){height=Math.round(height*maxWidth/width);width=maxWidth;}
        canvas.width=width; canvas.height=height;
        canvas.getContext('2d').drawImage(img,0,0,width,height);
        canvas.toBlob(blob=>resolve(new File([blob],file.name.replace(/\.[^.]+$/,'.jpg'),{type:'image/jpeg'})),'image/jpeg',quality);
      };
      img.src=ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function checkVideoDuration(file) {
  return new Promise((resolve,reject)=>{
    const v=document.createElement('video');
    v.preload='metadata';
    v.onloadedmetadata=()=>{
      URL.revokeObjectURL(v.src);
      v.duration>MAX_VIDEO_SECONDS?reject(new Error(`Max ${MAX_VIDEO_SECONDS}s (yours: ${Math.round(v.duration)}s)`)):resolve(v.duration);
    };
    v.onerror=()=>reject(new Error('Cannot read video'));
    v.src=URL.createObjectURL(file);
  });
}

async function uploadToCloudinary(file, isVideo=false) {
  const fd=new FormData();
  fd.append('file',file); fd.append('upload_preset',CLOUDINARY_PRESET); fd.append('folder','eagles_app');
  const r=await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${isVideo?'video':'image'}/upload`,{method:'POST',body:fd});
  const d=await r.json();
  if(!d.secure_url) throw new Error(d.error?.message||'Upload failed');
  return d.secure_url;
}

// ============================================================
// ADD MEMORY
// ============================================================
let selActivity=null, selEmotion=null, selMembers=[], upFile=null, upIsVideo=false;

function setupAddMemory() {
  // Activity chips
  const ag=document.getElementById('activity-chips');
  if(ag) ACTIVITIES.forEach(a=>{
    const c=document.createElement('div'); c.className='chip';
    c.innerHTML=`${a.icon} ${a.label}`;
    c.addEventListener('click',()=>{ag.querySelectorAll('.chip').forEach(x=>x.classList.remove('selected'));c.classList.add('selected');selActivity=a.id;});
    ag.appendChild(c);
  });
  // Emotion chips
  const eg=document.getElementById('emotion-chips');
  if(eg) EMOTIONS.forEach(e=>{
    const c=document.createElement('div'); c.className='chip';
    c.innerHTML=`${e.icon} ${e.label}`;
    c.addEventListener('click',()=>{eg.querySelectorAll('.chip').forEach(x=>x.classList.remove('selected'));c.classList.add('selected');selEmotion=e.id;});
    eg.appendChild(c);
  });
  // Tag chips
  const tg=document.getElementById('tag-chips');
  if(tg) Object.entries(FAMILY).forEach(([uid,f])=>{
    const c=document.createElement('div'); c.className='chip tag-chip';
    c.innerHTML=`<span class="tag-dot" style="background:${f.color}">${f.avatar}</span> ${f.short}`;
    c.addEventListener('click',()=>{
      c.classList.toggle('selected');
      selMembers=c.classList.contains('selected')?[...selMembers,uid]:selMembers.filter(m=>m!==uid);
    });
    tg.appendChild(c);
  });

  document.getElementById('photo-upload-area')?.addEventListener('click',()=>document.getElementById('media-input')?.click());
  document.getElementById('media-input')?.addEventListener('change',handleMediaSelect);
  document.getElementById('btn-submit-memory')?.addEventListener('click',submitMemory);
  const d=document.getElementById('memory-date'); if(d) d.value=new Date().toISOString().split('T')[0];
}

async function handleMediaSelect(e) {
  const file=e.target.files[0]; if(!file) return;
  const isVideo=file.type.startsWith('video/');
  const area=document.getElementById('photo-upload-area');
  if(isVideo){
    try{
      showToast('Checking video length…');
      await checkVideoDuration(file);
      upFile=file; upIsVideo=true;
      area.innerHTML=`<video src="${URL.createObjectURL(file)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit" muted playsinline></video><div class="media-label">🎬 Video ready</div>`;
    }catch(err){showToast('⚠️ '+err.message);e.target.value='';}
  } else {
    upFile=file; upIsVideo=false;
    const reader=new FileReader();
    reader.onload=ev=>{area.innerHTML=`<img src="${ev.target.result}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit"><div class="media-label">📷 Photo ready</div>`;};
    reader.readAsDataURL(file);
  }
}

async function submitMemory() {
  const date=document.getElementById('memory-date')?.value;
  const loc=document.getElementById('memory-location')?.value.trim();
  const desc=document.getElementById('memory-desc')?.value.trim();
  if(!desc){showToast('Please add a caption');return;}
  if(!selActivity){showToast('Please pick an activity');return;}
  if(!selEmotion){showToast('Please pick a feeling');return;}
  const btn=document.getElementById('btn-submit-memory');
  if(btn){btn.disabled=true;btn.textContent='Saving…';}
  showLoading(true);
  let mediaURL=null;
  if(upFile){
    try{
      if(upIsVideo){showToast('📤 Uploading video…');mediaURL=await uploadToCloudinary(upFile,true);}
      else{showToast('📤 Compressing…');const c=await compressImage(upFile);mediaURL=await uploadToCloudinary(c);}
    }catch(e){console.error(e);showToast('Upload failed – saving without media');}
  }
  if(!selMembers.includes(currentUser.uid)) selMembers.unshift(currentUser.uid);
  try{
    await db.collection('eagles_memories').add({
      uid:currentUser.uid, photoURL:mediaURL, mediaType:upIsVideo?'video':'image',
      date, location:loc, description:desc,
      activity:selActivity, emotion:selEmotion, taggedMembers:selMembers,
      likes:[], comments:[], reactions:{},
      timestamp:firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast('🦅 Memory saved!');
    resetAddForm();
    document.querySelector('.nav-item[data-page="home"]')?.click();
  }catch(e){showToast('Error saving');console.error(e);}
  finally{showLoading(false);if(btn){btn.disabled=false;btn.innerHTML='🦅 Save Memory';}}
}

function resetAddForm(){
  selActivity=null;selEmotion=null;selMembers=[];upFile=null;upIsVideo=false;
  const d=document.getElementById('memory-date');if(d)d.value=new Date().toISOString().split('T')[0];
  ['memory-location','memory-desc'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const mi=document.getElementById('media-input');if(mi)mi.value='';
  const area=document.getElementById('photo-upload-area');
  if(area)area.innerHTML=`<div class="upload-icon">📷</div><div class="upload-text">Tap to add photo or video</div><div class="upload-hint">Auto-compressed · Videos up to 20s</div>`;
  document.querySelectorAll('#activity-chips .chip,#emotion-chips .chip,#tag-chips .chip').forEach(c=>c.classList.remove('selected'));
}

// ============================================================
// CALENDAR
// ============================================================
let calYear=new Date().getFullYear(), calMonth=new Date().getMonth(), memDates=new Set();
function setupCalendar(){
  document.getElementById('cal-prev')?.addEventListener('click',()=>{calMonth--;if(calMonth<0){calMonth=11;calYear--;}renderCalendar();});
  document.getElementById('cal-next')?.addEventListener('click',()=>{calMonth++;if(calMonth>11){calMonth=0;calYear++;}renderCalendar();});
}
async function loadCalendar(){
  try{const s=await db.collection('eagles_memories').get();memDates=new Set(s.docs.map(d=>d.data().date));renderCalendar();}catch(e){renderCalendar();}
}
function renderCalendar(){
  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const lbl=document.getElementById('cal-month-label');if(lbl)lbl.textContent=`${months[calMonth]} ${calYear}`;
  const grid=document.getElementById('cal-grid');if(!grid)return;
  grid.innerHTML='';
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d=>{const el=document.createElement('div');el.className='cal-day-label';el.textContent=d;grid.appendChild(el);});
  const first=new Date(calYear,calMonth,1).getDay(),days=new Date(calYear,calMonth+1,0).getDate(),today=new Date();
  for(let i=0;i<first;i++){const el=document.createElement('div');el.className='cal-day empty';grid.appendChild(el);}
  for(let d=1;d<=days;d++){
    const el=document.createElement('div');el.className='cal-day';el.textContent=d;
    const ds=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if(today.getDate()===d&&today.getMonth()===calMonth&&today.getFullYear()===calYear)el.classList.add('today');
    if(memDates.has(ds))el.classList.add('has-memory');
    el.addEventListener('click',()=>{grid.querySelectorAll('.cal-day').forEach(x=>x.classList.remove('selected'));el.classList.add('selected');loadDayMemories(ds);});
    grid.appendChild(el);
  }
}
async function loadDayMemories(ds){
  const container=document.getElementById('cal-memories-list'),title=document.getElementById('cal-memories-title');
  const fmt=new Date(ds+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
  if(title)title.textContent=fmt;
  if(!container)return;
  try{
    const snap=await db.collection('eagles_memories').where('date','==',ds).get();
    container.innerHTML='';
    if(snap.empty){container.innerHTML='<p class="cal-empty">No memories on this day</p>';return;}
    snap.docs.forEach(doc=>{
      const m=doc.data(),info=FAMILY[m.uid]||{name:'Family',avatar:'🦅',color:'#1a3a5c'},act=ACTIVITIES.find(a=>a.id===m.activity)||{icon:'📍'};
      const mini=document.createElement('div');mini.className='mini-card';
      mini.innerHTML=`${m.photoURL&&m.mediaType!=='video'?`<img class="mini-photo" src="${m.photoURL}" loading="lazy">`:`<div class="mini-photo mini-icon">${act.icon}</div>`}<div class="mini-info"><div class="mini-name">${info.name}</div><div class="mini-desc">${(m.description||'').substring(0,60)}${(m.description||'').length>60?'…':''}</div></div>`;
      container.appendChild(mini);
    });
  }catch(e){if(container)container.innerHTML='<p class="cal-empty">Could not load</p>';}
}

// ============================================================
// ACTIVITIES
// ============================================================
let activeFilter='all';
async function renderActivities(){
  const fr=document.getElementById('activity-filter-row');
  if(fr){
    fr.innerHTML='';
    const a=document.createElement('div');a.className=`filter-chip${activeFilter==='all'?' active':''}`;a.innerHTML='🌟 All';
    a.addEventListener('click',()=>{activeFilter='all';renderActivities();});fr.appendChild(a);
    ACTIVITIES.forEach(act=>{const c=document.createElement('div');c.className=`filter-chip${activeFilter===act.id?' active':''}`;c.innerHTML=`${act.icon} ${act.label}`;c.addEventListener('click',()=>{activeFilter=act.id;renderActivities();});fr.appendChild(c);});
  }
  const grid=document.getElementById('activities-grid');if(!grid)return;
  grid.innerHTML='<div class="act-loading">Loading…</div>';
  try{
    let q=db.collection('eagles_memories').orderBy('timestamp','desc');
    if(activeFilter!=='all')q=q.where('activity','==',activeFilter);
    const snap=await q.get();grid.innerHTML='';
    if(snap.empty){grid.innerHTML='<div class="act-empty">No memories for this activity yet</div>';return;}
    snap.docs.forEach(doc=>{
      const m=doc.data(),info=FAMILY[m.uid]||{name:'Family',color:'#1a3a5c'},act=ACTIVITIES.find(a=>a.id===m.activity)||{icon:'📍',label:m.activity};
      const card=document.createElement('div');card.className='act-card';
      card.innerHTML=`${m.photoURL&&m.mediaType!=='video'?`<img class="act-photo" src="${m.photoURL}" loading="lazy">`:`<div class="act-photo act-icon">${act.icon}</div>`}<div class="act-info"><div class="act-name">${info.name}</div><div class="act-meta">${act.icon} ${act.label} · ${m.date||''}</div></div>`;
      grid.appendChild(card);
    });
  }catch(e){grid.innerHTML='<div class="act-empty">Could not load</div>';}
}

// ============================================================
// PROFILE + AVATAR PICKER
// ============================================================
async function renderProfile(){
  if(!currentUser)return;
  const info=getFamilyInfo(currentUser.uid);
  const pav=document.getElementById('profile-avatar');
  const saved=getSavedAvatar(currentUser.uid);
  if(saved&&pav)renderAvatarEl(pav,saved,info.color);
  else if(pav){pav.textContent=info.avatar;pav.style.background=`linear-gradient(135deg,${info.color},#c9a84c)`;}
  const n=document.getElementById('profile-name');if(n)n.textContent=info.name;
  const r=document.getElementById('profile-role');if(r)r.textContent=info.role;
  try{
    const snap=await db.collection('eagles_memories').get();
    const all=snap.docs.map(d=>({id:d.id,...d.data()}));
    const mine=all.filter(m=>m.uid===currentUser.uid);
    const el=id=>document.getElementById(id);
    if(el('stat-memories'))el('stat-memories').textContent=mine.length;
    if(el('stat-likes'))el('stat-likes').textContent=mine.reduce((s,m)=>s+(m.likes||[]).length,0);
    if(el('stat-liked'))el('stat-liked').textContent=all.reduce((s,m)=>s+((m.likes||[]).includes(currentUser.uid)?1:0),0);
    const fam=el('family-roster');
    if(fam){fam.innerHTML='';Object.entries(FAMILY).forEach(([uid,f])=>{
      const mm=all.filter(m=>m.uid===uid);
      const row=document.createElement('div');row.className='fam-row';
      row.innerHTML=`<div class="fam-av" style="background:${f.color}">${f.avatar}</div><div class="fam-detail"><div class="fam-name">${f.name}</div><div class="fam-role">${f.role}</div></div><div class="fam-count">${mm.length} memories</div>`;
      fam.appendChild(row);
    });}
  }catch(e){console.error('Profile:',e);}
}

function openAvatarPicker(){
  const modal=document.getElementById('avatar-modal');if(!modal)return;
  modal.classList.add('show');
  const grid=document.getElementById('avatar-emoji-grid');
  if(grid){grid.innerHTML='';AVATAR_CHARS.forEach(ch=>{const btn=document.createElement('div');btn.className='avatar-option';btn.textContent=ch;btn.addEventListener('click',()=>saveAvatar({type:'emoji',value:ch}));grid.appendChild(btn);});}
  const setup=id=>{
    const el=document.getElementById(id);
    el?.addEventListener('change',async e=>{
      const file=e.target.files[0];if(!file)return;
      showLoading(true);
      try{const c=await compressImage(file,400,0.85);const url=await uploadToCloudinary(c);saveAvatar({type:'photo',value:url});}
      catch(err){showToast('Upload failed');showLoading(false);}
    },{once:true});
  };
  document.getElementById('avatar-photo-btn')?.addEventListener('click',()=>document.getElementById('avatar-photo-input')?.click(),{once:true});
  document.getElementById('avatar-camera-btn')?.addEventListener('click',()=>document.getElementById('avatar-camera-input')?.click(),{once:true});
  setup('avatar-photo-input');setup('avatar-camera-input');
  document.getElementById('avatar-modal-close')?.addEventListener('click',()=>modal.classList.remove('show'),{once:true});
}

function saveAvatar(data){
  if(!currentUser)return;
  localStorage.setItem(`eagles_avatar_${currentUser.uid}`,JSON.stringify(data));
  const pav=document.getElementById('profile-avatar'),hav=document.getElementById('header-avatar');
  const info=getFamilyInfo(currentUser.uid);
  if(pav)renderAvatarEl(pav,data,info.color);
  if(hav)renderAvatarEl(hav,data,info.color);
  document.getElementById('avatar-modal')?.classList.remove('show');
  buildStoryRow();
  showLoading(false);
  showToast('✅ Profile picture updated!');
}

// ============================================================
// iCAL / OUTLOOK EXPORT
// ============================================================
async function exportToCalendar(){
  showLoading(true);
  try{
    const snap=await db.collection('eagles_memories').orderBy('timestamp','desc').get();
    if(snap.empty){showToast('No memories to export');showLoading(false);return;}
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Eagles Family App//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Eagles Family Memories','X-WR-TIMEZONE:Asia/Dubai'];
    snap.docs.forEach(doc=>{
      const m=doc.data(),info=FAMILY[m.uid]||{name:'Family'},act=ACTIVITIES.find(a=>a.id===m.activity)||{label:m.activity||'Memory',icon:'📍'},emo=EMOTIONS.find(e=>e.id===m.emotion)||{icon:'😊',label:''};
      const ds=(m.date||'2025-01-01').replace(/-/g,'');
      const tagged=(m.taggedMembers||[]).map(u=>FAMILY[u]?.name).filter(Boolean).join(', ');
      const summary=`${act.icon} ${act.label} – ${info.name}${tagged?' with '+tagged:''}`;
      const desc=[m.description,m.location?'📍 '+m.location:'',emo.icon+' '+emo.label,tagged?'👥 '+tagged:''].filter(Boolean).join('\\n');
      lines.push('BEGIN:VEVENT',`UID:eagles-${doc.id}@kumar`,`DTSTART;VALUE=DATE:${ds}`,`DTEND;VALUE=DATE:${ds}`,`SUMMARY:${summary}`,`DESCRIPTION:${desc}`,m.location?`LOCATION:${m.location}`:'','END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    const blob=new Blob([lines.filter(Boolean).join('\r\n')],{type:'text/calendar;charset=utf-8'});
    const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(blob),download:'eagles-memories.ics'});
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    showToast('📅 Exported! Open the .ics file in Outlook or Calendar');
  }catch(e){showToast('Export failed');console.error(e);}
  showLoading(false);
}

// ============================================================
// UTILS
// ============================================================
function registerServiceWorker(){if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>{});}
function showScreen(name){
  document.querySelectorAll('.screen').forEach(s=>{s.style.opacity='0';setTimeout(()=>{s.classList.remove('active');s.style.opacity='';},200);});
  setTimeout(()=>{const el=document.getElementById(name);if(el){el.classList.add('active');}},200);
}
function showLoading(show){document.getElementById('loading-overlay')?.classList.toggle('show',show);}
function showToast(msg,dur=3000){
  const t=document.getElementById('toast');if(!t)return;
  t.textContent=msg;t.classList.add('show');
  clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),dur);
}
function logout(){
  if(unsubscribeFeed)unsubscribeFeed();
  auth.signOut().then(()=>{currentUser=null;showScreen('splash');setTimeout(()=>showScreen('login'),500);showToast('Signed out 👋');});
}
