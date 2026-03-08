// ============================================================
// EAGLES APP v2 - Firebase + Cloudinary
// Avatar picker, video upload, compression, tagging, PWA install
// ============================================================

const CLOUDINARY_CLOUD = 'dmpb99wde';
const CLOUDINARY_PRESET = 'qrlcory1';
const MAX_VIDEO_SECONDS = 20;

let db, auth, currentUser = null, unsubscribeFeed = null, deferredInstall = null;

const AVATAR_CHARS = ['🦅','🦁','🐯','🦊','🐻','🐼','🦋','🌟','🏄','⛷️','🎸','📸','🌍','🏆','🎯','🦸','🧳','🌴','🎭','🐬'];

const FAMILY = {
  "demo-raj-001":     { name:"Raj Kumar",    role:"Dad",      avatar:"R", color:"#1a3a5c" },
  "demo-fiona-002":   { name:"Fiona Kumar",  role:"Mum",      avatar:"F", color:"#c8763a" },
  "demo-natasha-003": { name:"Natasha Kumar",role:"Daughter", avatar:"N", color:"#2d7d5a" },
  "demo-tanya-004":   { name:"Tanya Kumar",  role:"Daughter", avatar:"T", color:"#7d2d6b" }
};

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

const SEED_MEMORIES = [
  {uid:"demo-raj-001",photoURL:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",mediaType:"image",date:"2025-03-15",location:"Dubai, UAE",description:"Perfect round at Emirates Golf Club! The course was immaculate 🏌️",activity:"golf",emotion:"amazing",taggedMembers:["demo-raj-001"],likes:["demo-fiona-002","demo-natasha-003"],comments:[{uid:"demo-fiona-002",text:"So proud! What was your score? 😍",timestamp:"2025-03-15T11:30:00"}],timestamp:new Date("2025-03-15T09:00:00")},
  {uid:"demo-fiona-002",photoURL:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",mediaType:"image",date:"2025-03-10",location:"Dubai Marina, UAE",description:"Dubai skyline at sunset – absolutely breathtaking 🌇",activity:"travel",emotion:"amazing",taggedMembers:["demo-fiona-002","demo-raj-001"],likes:["demo-raj-001","demo-natasha-003","demo-tanya-004"],comments:[{uid:"demo-tanya-004",text:"Miss this so much! 😭",timestamp:"2025-03-10T20:00:00"}],timestamp:new Date("2025-03-10T19:00:00")},
  {uid:"demo-natasha-003",photoURL:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",mediaType:"image",date:"2025-02-22",location:"Jumeirah Beach, Dubai",description:"Beach day with the whole family 🌊☀️ Perfect weather!",activity:"beach",emotion:"loved",taggedMembers:["demo-natasha-003","demo-tanya-004","demo-fiona-002","demo-raj-001"],likes:["demo-raj-001","demo-fiona-002"],comments:[],timestamp:new Date("2025-02-22T15:00:00")},
  {uid:"demo-raj-001",photoURL:"https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",mediaType:"image",date:"2025-02-14",location:"Nad Al Sheba, Dubai",description:"Padel tournament – won the final in a tie-break! 🎾🔥",activity:"padel",emotion:"amazing",taggedMembers:["demo-raj-001"],likes:["demo-fiona-002","demo-tanya-004"],comments:[{uid:"demo-natasha-003",text:"Dad the champion! 🏆",timestamp:"2025-02-14T18:00:00"}],timestamp:new Date("2025-02-14T16:00:00")},
  {uid:"demo-fiona-002",photoURL:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",mediaType:"image",date:"2025-02-08",location:"Nobu, Dubai",description:"Family dinner at Nobu – the black cod was incredible 🍽️",activity:"food",emotion:"family",taggedMembers:["demo-raj-001","demo-fiona-002","demo-natasha-003","demo-tanya-004"],likes:["demo-raj-001","demo-natasha-003","demo-tanya-004"],comments:[{uid:"demo-raj-001",text:"Best night of the year!",timestamp:"2025-02-08T22:00:00"}],timestamp:new Date("2025-02-08T21:00:00")},
  {uid:"demo-tanya-004",photoURL:"https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&q=80",mediaType:"image",date:"2025-01-30",location:"Marbella, Spain",description:"Holiday breakfast in the sunshine ☀️🥐",activity:"travel",emotion:"happy",taggedMembers:["demo-tanya-004","demo-fiona-002"],likes:["demo-raj-001","demo-fiona-002","demo-natasha-003"],comments:[],timestamp:new Date("2025-01-30T09:30:00")},
  {uid:"demo-natasha-003",photoURL:"https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&q=80",mediaType:"image",date:"2025-01-20",location:"London, UK",description:"Weekend in London! Borough Market and the Thames 🇬🇧",activity:"travel",emotion:"fun",taggedMembers:["demo-natasha-003"],likes:["demo-tanya-004"],comments:[{uid:"demo-fiona-002",text:"Wish I was there! 😍",timestamp:"2025-01-20T16:00:00"}],timestamp:new Date("2025-01-20T14:00:00")},
  {uid:"demo-tanya-004",photoURL:"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",mediaType:"image",date:"2025-01-15",location:"Dubai, UAE",description:"Family movie night – popcorn and blankets 🎬🍿",activity:"family",emotion:"family",taggedMembers:["demo-raj-001","demo-fiona-002","demo-natasha-003","demo-tanya-004"],likes:["demo-raj-001","demo-fiona-002","demo-natasha-003"],comments:[{uid:"demo-natasha-003",text:"The best! Every week! 😂",timestamp:"2025-01-15T21:00:00"}],timestamp:new Date("2025-01-15T20:00:00")},
  {uid:"demo-raj-001",photoURL:"https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80",mediaType:"image",date:"2025-01-05",location:"Dubai Hills, UAE",description:"Saturday morning football ⚽💪 Nothing like a kickabout with the lads.",activity:"football",emotion:"fun",taggedMembers:["demo-raj-001"],likes:["demo-fiona-002"],comments:[],timestamp:new Date("2025-01-05T08:00:00")},
  {uid:"demo-fiona-002",photoURL:"https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",mediaType:"image",date:"2024-12-28",location:"Swiss Alps",description:"New Year trip to the Alps – absolute magic 🏔️❄️",activity:"adventure",emotion:"amazing",taggedMembers:["demo-raj-001","demo-fiona-002","demo-natasha-003","demo-tanya-004"],likes:["demo-raj-001","demo-natasha-003","demo-tanya-004"],comments:[{uid:"demo-natasha-003",text:"Best trip EVER!",timestamp:"2024-12-28T17:00:00"},{uid:"demo-tanya-004",text:"Can we go back?! ❄️",timestamp:"2024-12-28T18:00:00"}],timestamp:new Date("2024-12-28T16:00:00")}
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
  setupPWAInstall();
  registerServiceWorker();
});

function initFirebase() {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    auth.onAuthStateChanged(user => { if (user) { currentUser = user; onLoggedIn(); } });
  } catch(e) { console.error('Firebase:', e); }
}

// ============================================================
// PWA INSTALL
// ============================================================
function setupPWAInstall() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstall = e;
    setTimeout(showInstallBanner, 1500);
  });
  window.addEventListener('appinstalled', () => {
    hideInstallBanner();
    showToast('🦅 Eagles installed on your home screen!');
  });
  document.getElementById('btn-install')?.addEventListener('click', triggerInstall);
  document.getElementById('btn-dismiss-install')?.addEventListener('click', hideInstallBanner);

  // iOS Safari tip
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isIOS && !isStandalone) setTimeout(showIOSInstallTip, 3000);
}

async function triggerInstall() {
  if (!deferredInstall) return;
  hideInstallBanner();
  await deferredInstall.prompt();
  deferredInstall = null;
}
function showInstallBanner() { document.getElementById('install-banner')?.classList.add('show'); }
function hideInstallBanner() { document.getElementById('install-banner')?.classList.remove('show'); }
function showIOSInstallTip() {
  const tip = document.getElementById('ios-tip');
  if (tip) { tip.classList.add('show'); setTimeout(() => tip.classList.remove('show'), 9000); }
}

// ============================================================
// SPLASH & LOGIN
// ============================================================
function setupSplash() {
  showScreen('splash');
  document.getElementById('btn-enter')?.addEventListener('click', () => showScreen('login'));
}
function setupLogin() {
  document.getElementById('btn-login')?.addEventListener('click', handleLogin);
  document.getElementById('btn-demo')?.addEventListener('click', handleDemoLogin);
  ['login-email','login-password'].forEach(id => document.getElementById(id)?.addEventListener('keydown', e => { if(e.key==='Enter') handleLogin(); }));
}
async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value;
  if (!email||!pass) { showLoginError('Please enter email and password'); return; }
  showLoading(true);
  try { await auth.signInWithEmailAndPassword(email, pass); }
  catch(e) { showLoading(false); showLoginError('Invalid credentials. Try demo login.'); }
}
async function handleDemoLogin() {
  showLoading(true);
  try { await auth.signInWithEmailAndPassword(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password); }
  catch(e) {
    try { await auth.createUserWithEmailAndPassword(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password); }
    catch(e2) { showLoading(false); showLoginError('Demo login failed. Check Firebase Auth.'); }
  }
}
function showLoginError(msg) { const el=document.getElementById('login-error'); if(el){el.textContent=msg;el.style.display='block';} }

// ============================================================
// POST LOGIN
// ============================================================
async function onLoggedIn() {
  showLoading(false);
  showScreen('app');
  updateHeaderAvatar();
  await ensureDemoData();
  showPage('home');
  loadFeed();
  loadCalendar();
  setTimeout(requestNotifications, 3000);
}

async function requestNotifications() {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
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

function getFamilyInfo(uid) { return FAMILY[uid] || {name:currentUser?.displayName||"User",role:"Member",avatar:"U",color:"#1a3a5c"}; }

function getSavedAvatar(uid) {
  try { const s = localStorage.getItem(`eagles_avatar_${uid}`); return s ? JSON.parse(s) : null; } catch(e) { return null; }
}

function renderAvatarEl(el, data) {
  if (!el||!data) return;
  el.style.backgroundImage=''; el.style.backgroundSize=''; el.style.backgroundPosition='';
  if (data.type==='photo') {
    el.style.backgroundImage=`url(${data.value})`; el.style.backgroundSize='cover'; el.style.backgroundPosition='center'; el.textContent='';
  } else {
    el.textContent = data.value;
    el.style.fontSize = data.type==='emoji' ? '20px' : '14px';
    el.style.background = `linear-gradient(135deg, ${getFamilyInfo(currentUser?.uid).color}, #c9a84c)`;
  }
}

function updateHeaderAvatar() {
  const info = getFamilyInfo(currentUser?.uid);
  const el = document.getElementById('header-avatar');
  if (!el) return;
  const saved = getSavedAvatar(currentUser?.uid);
  if (saved) { renderAvatarEl(el, saved); }
  else { el.textContent=info.avatar; el.style.background=`linear-gradient(135deg,${info.color},#c9a84c)`; el.style.fontSize='14px'; }
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
  if(name==='home') loadFeed();
  if(name==='activities') renderActivities();
  if(name==='profile') renderProfile();
  if(name==='calendar') loadCalendar();
}

// ============================================================
// HOME FEED
// ============================================================
function loadFeed() {
  if(unsubscribeFeed) unsubscribeFeed();
  const container = document.getElementById('memory-feed');
  container.innerHTML='<div class="empty-state"><div class="empty-state-icon">🦅</div><p>Loading memories…</p></div>';
  unsubscribeFeed = db.collection('eagles_memories').orderBy('timestamp','desc').onSnapshot(snap => {
    if(snap.empty){container.innerHTML='<div class="empty-state"><div class="empty-state-icon">📷</div><h3>No memories yet</h3><p>Add your first memory!</p></div>';return;}
    container.innerHTML='';
    snap.docs.forEach(doc => container.appendChild(buildMemoryCard(doc.id, doc.data())));
  }, err => console.error('Feed:', err));
}

function buildMemoryCard(id, m) {
  const info     = FAMILY[m.uid]||{name:m.uid,role:'Member',avatar:'U',color:'#1a3a5c'};
  const activity = ACTIVITIES.find(a=>a.id===m.activity)||{icon:'📍',label:m.activity||''};
  const emotion  = EMOTIONS.find(e=>e.id===m.emotion)||{icon:'😊',label:''};
  const likes    = m.likes||[], comments = m.comments||[];
  const tagged   = (m.taggedMembers||[]).map(uid=>FAMILY[uid]?.name?.split(' ')[0]).filter(Boolean);
  const liked    = likes.includes(currentUser?.uid);
  const dateStr  = m.date ? new Date(m.date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '';
  const isVideo  = m.mediaType==='video';

  // Avatar for card
  const saved = getSavedAvatar(m.uid);
  let avHTML = '';
  if (saved?.type==='photo') avHTML=`<div class="card-avatar" style="background-image:url(${saved.value});background-size:cover;background-position:center;border-radius:50%"></div>`;
  else if (saved) avHTML=`<div class="card-avatar" style="background:${info.color};font-size:${saved.type==='emoji'?'20px':'15px'}">${saved.value}</div>`;
  else avHTML=`<div class="card-avatar" style="background:${info.color}">${info.avatar}</div>`;

  const card = document.createElement('div');
  card.className='memory-card';
  card.innerHTML=`
    <div class="card-header">
      ${avHTML}
      <div class="card-user-info">
        <div class="card-user-name">${info.name} <span class="card-role-tag">${info.role}</span></div>
        <div class="card-meta"><span>📅 ${dateStr}</span>${m.location?`<span>📍 ${m.location}</span>`:''}</div>
        <div class="card-badges">
          <span class="card-activity-badge">${activity.icon} ${activity.label}</span>
          <span class="card-emotion-badge">${emotion.icon} ${emotion.label}</span>
          ${tagged.length?`<span class="card-tag-badge">👥 ${tagged.join(', ')}</span>`:''}
        </div>
      </div>
    </div>
    ${isVideo
      ? `<video class="card-photo" controls playsinline preload="metadata" src="${m.photoURL}" style="background:#000;width:100%;max-height:400px;object-fit:contain"></video>`
      : m.photoURL?`<img class="card-photo" src="${m.photoURL}" alt="Memory" loading="lazy" onerror="this.style.display='none'">`
      :`<div class="card-photo-placeholder">${activity.icon}</div>`}
    ${m.description?`<div class="card-body"><div class="card-desc">${m.description}</div></div>`:''}
    <div class="card-actions">
      <button class="card-action-btn like-btn${liked?' liked':''}" data-id="${id}">
        <span class="like-icon">${liked?'❤️':'🤍'}</span> <span class="like-count">${likes.length}</span> Like${likes.length!==1?'s':''}
      </button>
      <button class="card-action-btn comment-toggle-btn" data-id="${id}">
        💬 <span class="cmt-count">${comments.length}</span> Comment${comments.length!==1?'s':''}
      </button>
    </div>
    <div class="card-comments" id="comments-${id}" style="display:none">
      <div class="comments-list" id="clist-${id}">${comments.map(c=>buildCommentHTML(c)).join('')}</div>
      <div class="comment-input-row">
        <input class="comment-input" placeholder="Write a comment…" id="ci-${id}">
        <button class="comment-send" data-id="${id}">➤</button>
      </div>
    </div>`;

  card.querySelector('.like-btn').addEventListener('click', ()=>toggleLike(id,likes,card));
  card.querySelector('.comment-toggle-btn').addEventListener('click', ()=>{
    const el=document.getElementById(`comments-${id}`);
    el.style.display=el.style.display==='none'?'block':'none';
    if(el.style.display==='block') setTimeout(()=>document.getElementById(`ci-${id}`)?.focus(),100);
  });
  card.querySelector('.comment-send').addEventListener('click',()=>postComment(id));
  card.querySelector(`#ci-${id}`).addEventListener('keydown',e=>{if(e.key==='Enter')postComment(id);});
  return card;
}

function buildCommentHTML(c) {
  const ci=FAMILY[c.uid]||{name:c.uid||'Family',color:'#888',avatar:'U'};
  return `<div class="comment-item"><div class="comment-avatar" style="background:${ci.color}">${ci.avatar}</div><div class="comment-bubble"><span class="comment-author">${ci.name}</span><span class="comment-text">${c.text}</span></div></div>`;
}

async function toggleLike(id, currentLikes, card) {
  if(!currentUser) return;
  const uid=currentUser.uid, liked=currentLikes.includes(uid);
  const newLikes=liked?currentLikes.filter(l=>l!==uid):[...currentLikes,uid];
  card.querySelector('.like-icon').textContent=liked?'🤍':'❤️';
  card.querySelector('.like-count').textContent=newLikes.length;
  card.querySelector('.like-btn').classList.toggle('liked',!liked);
  try { await db.collection('eagles_memories').doc(id).update({likes:newLikes}); }
  catch(e) { showToast('Could not update like'); }
}

async function postComment(id) {
  const input=document.getElementById(`ci-${id}`);
  const text=input?.value?.trim();
  if(!text||!currentUser) return;
  input.value=''; input.disabled=true;
  try {
    const docRef=db.collection('eagles_memories').doc(id);
    const docSnap=await docRef.get();
    const comments=docSnap.data()?.comments||[];
    const nc={uid:currentUser.uid,text,timestamp:new Date().toISOString()};
    comments.push(nc);
    await docRef.update({comments});
    document.getElementById(`clist-${id}`)?.insertAdjacentHTML('beforeend',buildCommentHTML(nc));
    const cc=document.querySelector(`[data-id="${id}"].comment-toggle-btn .cmt-count`);
    if(cc) cc.textContent=parseInt(cc.textContent||0)+1;
    showToast('💬 Comment posted!');
  } catch(e) { showToast('Could not post comment'); }
  finally { input.disabled=false; input.focus(); }
}

// ============================================================
// COMPRESSION + VIDEO CHECK + UPLOAD
// ============================================================
function compressImage(file, maxWidth=1200, quality=0.82) {
  return new Promise(resolve => {
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
    const video=document.createElement('video');
    video.preload='metadata';
    video.onloadedmetadata=()=>{ URL.revokeObjectURL(video.src); video.duration>MAX_VIDEO_SECONDS?reject(new Error(`Video must be ${MAX_VIDEO_SECONDS}s or less (yours is ${Math.round(video.duration)}s)`)):resolve(video.duration); };
    video.onerror=()=>reject(new Error('Could not read video'));
    video.src=URL.createObjectURL(file);
  });
}

async function uploadToCloudinary(file, isVideo=false) {
  const fd=new FormData();
  fd.append('file',file); fd.append('upload_preset',CLOUDINARY_PRESET); fd.append('folder','eagles_app');
  const res=await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${isVideo?'video':'image'}/upload`,{method:'POST',body:fd});
  const data=await res.json();
  if(!data.secure_url) throw new Error(data.error?.message||'Upload failed');
  return data.secure_url;
}

// ============================================================
// ADD MEMORY
// ============================================================
let selectedActivity=null, selectedEmotion=null, selectedMembers=[], uploadedFile=null, uploadedIsVideo=false;

function setupAddMemory() {
  const actGrid=document.getElementById('activity-chips');
  if(actGrid) ACTIVITIES.forEach(a=>{
    const chip=document.createElement('div'); chip.className='chip';
    chip.innerHTML=`${a.icon} ${a.label}`;
    chip.addEventListener('click',()=>{ actGrid.querySelectorAll('.chip').forEach(c=>c.classList.remove('selected')); chip.classList.add('selected'); selectedActivity=a.id; });
    actGrid.appendChild(chip);
  });

  const emoGrid=document.getElementById('emotion-chips');
  if(emoGrid) EMOTIONS.forEach(e=>{
    const chip=document.createElement('div'); chip.className='chip emotion-chip';
    chip.innerHTML=`${e.icon} ${e.label}`;
    chip.addEventListener('click',()=>{ emoGrid.querySelectorAll('.chip').forEach(c=>c.classList.remove('selected')); chip.classList.add('selected'); selectedEmotion=e.id; });
    emoGrid.appendChild(chip);
  });

  const tagGrid=document.getElementById('tag-chips');
  if(tagGrid) Object.entries(FAMILY).forEach(([uid,f])=>{
    const chip=document.createElement('div'); chip.className='chip tag-chip';
    chip.innerHTML=`<span style="background:${f.color};color:white;border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">${f.avatar}</span> ${f.name.split(' ')[0]}`;
    chip.addEventListener('click',()=>{ chip.classList.toggle('selected'); selectedMembers=chip.classList.contains('selected')?[...selectedMembers,uid]:selectedMembers.filter(m=>m!==uid); });
    tagGrid.appendChild(chip);
  });

  document.getElementById('photo-upload-area')?.addEventListener('click',()=>document.getElementById('media-input')?.click());
  document.getElementById('media-input')?.addEventListener('change',handleMediaSelect);
  document.getElementById('btn-submit-memory')?.addEventListener('click',submitMemory);
  const dateEl=document.getElementById('memory-date'); if(dateEl) dateEl.value=new Date().toISOString().split('T')[0];
}

async function handleMediaSelect(e) {
  const file=e.target.files[0]; if(!file) return;
  const isVideo=file.type.startsWith('video/');
  const area=document.getElementById('photo-upload-area');
  if(isVideo) {
    try {
      showToast('Checking video…');
      await checkVideoDuration(file);
      uploadedFile=file; uploadedIsVideo=true;
      const url=URL.createObjectURL(file);
      area.innerHTML=`<video src="${url}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit" muted playsinline></video><div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.6);color:white;padding:4px 10px;border-radius:20px;font-size:12px">🎬 Video ready</div>`;
    } catch(err) { showToast('⚠️ '+err.message); e.target.value=''; }
  } else {
    uploadedFile=file; uploadedIsVideo=false;
    const reader=new FileReader();
    reader.onload=ev=>{ area.innerHTML=`<img src="${ev.target.result}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit"><div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.6);color:white;padding:4px 10px;border-radius:20px;font-size:12px">📷 Photo ready</div>`; };
    reader.readAsDataURL(file);
  }
}

async function submitMemory() {
  const date=document.getElementById('memory-date')?.value;
  const location=document.getElementById('memory-location')?.value.trim();
  const desc=document.getElementById('memory-desc')?.value.trim();
  if(!desc){showToast('Please add a description');return;}
  if(!selectedActivity){showToast('Please choose an activity');return;}
  if(!selectedEmotion){showToast('Please choose an emotion');return;}
  const btn=document.getElementById('btn-submit-memory');
  if(btn){btn.classList.add('loading');btn.textContent='Uploading…';}
  showLoading(true);
  let mediaURL=null;
  if(uploadedFile) {
    try {
      if(uploadedIsVideo){showToast('📤 Uploading video…');mediaURL=await uploadToCloudinary(uploadedFile,true);}
      else{showToast('📤 Compressing photo…');const c=await compressImage(uploadedFile);mediaURL=await uploadToCloudinary(c,false);}
    } catch(e){console.error(e);showToast('Upload failed – saving without media');}
  }
  if(!selectedMembers.includes(currentUser.uid)) selectedMembers.unshift(currentUser.uid);
  try {
    await db.collection('eagles_memories').add({uid:currentUser.uid,photoURL:mediaURL,mediaType:uploadedIsVideo?'video':'image',date,location,description:desc,activity:selectedActivity,emotion:selectedEmotion,taggedMembers:selectedMembers,likes:[],comments:[],timestamp:firebase.firestore.FieldValue.serverTimestamp()});
    showToast('🦅 Memory saved!');
    resetAddForm();
    document.querySelector('.nav-item[data-page="home"]')?.click();
  } catch(e){showToast('Error saving – try again');console.error(e);}
  finally{showLoading(false);if(btn){btn.classList.remove('loading');btn.innerHTML='🦅 Save Memory';}}
}

function resetAddForm() {
  selectedActivity=null;selectedEmotion=null;selectedMembers=[];uploadedFile=null;uploadedIsVideo=false;
  const d=document.getElementById('memory-date');if(d)d.value=new Date().toISOString().split('T')[0];
  ['memory-location','memory-desc'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const mi=document.getElementById('media-input');if(mi)mi.value='';
  const area=document.getElementById('photo-upload-area');
  if(area)area.innerHTML=`<div class="photo-upload-icon">📷🎬</div><div class="photo-upload-text">Tap to add photo or video</div><div class="photo-upload-hint">Photos compressed · Videos up to 20s</div>`;
  document.querySelectorAll('#activity-chips .chip,#emotion-chips .chip,#tag-chips .chip').forEach(c=>c.classList.remove('selected'));
}

// ============================================================
// CALENDAR
// ============================================================
let calYear=new Date().getFullYear(), calMonth=new Date().getMonth(), memoryDates=new Set();
function setupCalendar() {
  document.getElementById('cal-prev')?.addEventListener('click',()=>{calMonth--;if(calMonth<0){calMonth=11;calYear--;}renderCalendar();});
  document.getElementById('cal-next')?.addEventListener('click',()=>{calMonth++;if(calMonth>11){calMonth=0;calYear++;}renderCalendar();});
}
async function loadCalendar() {
  try{const snap=await db.collection('eagles_memories').get();memoryDates=new Set(snap.docs.map(d=>d.data().date));renderCalendar();}catch(e){renderCalendar();}
}
function renderCalendar() {
  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const label=document.getElementById('cal-month-label');if(label)label.textContent=`${months[calMonth]} ${calYear}`;
  const grid=document.getElementById('cal-grid');if(!grid)return;
  grid.innerHTML='';
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d=>{const el=document.createElement('div');el.className='cal-day-label';el.textContent=d;grid.appendChild(el);});
  const firstDay=new Date(calYear,calMonth,1).getDay(), daysInMonth=new Date(calYear,calMonth+1,0).getDate(), today=new Date();
  for(let i=0;i<firstDay;i++){const el=document.createElement('div');el.className='cal-day empty';grid.appendChild(el);}
  for(let d=1;d<=daysInMonth;d++){
    const el=document.createElement('div');el.className='cal-day';el.textContent=d;
    const ds=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if(today.getDate()===d&&today.getMonth()===calMonth&&today.getFullYear()===calYear)el.classList.add('today');
    if(memoryDates.has(ds))el.classList.add('has-memory');
    el.addEventListener('click',()=>{grid.querySelectorAll('.cal-day').forEach(x=>x.classList.remove('selected'));el.classList.add('selected');loadDayMemories(ds);});
    grid.appendChild(el);
  }
}
async function loadDayMemories(dateStr) {
  const container=document.getElementById('cal-memories-list'), title=document.getElementById('cal-memories-title');
  const formatted=new Date(dateStr+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
  if(title)title.textContent=formatted;
  if(!container)return;
  try{
    const snap=await db.collection('eagles_memories').where('date','==',dateStr).get();
    container.innerHTML='';
    if(snap.empty){container.innerHTML='<p style="color:var(--grey);font-size:14px;text-align:center;padding:20px 0">No memories on this day</p>';return;}
    snap.docs.forEach(doc=>{
      const m=doc.data(),info=FAMILY[m.uid]||{name:'Family',avatar:'🦅',color:'#1a3a5c'},act=ACTIVITIES.find(a=>a.id===m.activity)||{icon:'📍'};
      const mini=document.createElement('div');mini.className='mini-card';
      mini.innerHTML=`${m.photoURL&&m.mediaType!=='video'?`<img class="mini-card-photo" src="${m.photoURL}" loading="lazy">`:`<div class="mini-card-photo">${act.icon}</div>`}<div class="mini-card-info"><div class="mini-card-title">${info.name}</div><div class="mini-card-sub">${m.location||''} ${m.description?(m.description.substring(0,50)+(m.description.length>50?'…':'')):''}  </div></div>`;
      container.appendChild(mini);
    });
  }catch(e){if(container)container.innerHTML='<p style="color:var(--grey);text-align:center">Could not load</p>';}
}

// ============================================================
// ACTIVITIES
// ============================================================
let activeFilter='all';
async function renderActivities() {
  const filterRow=document.getElementById('activity-filter-row');
  if(filterRow){
    filterRow.innerHTML='';
    const all=document.createElement('div');all.className=`filter-chip ${activeFilter==='all'?'active':''}`;all.innerHTML='🌟 All';
    all.addEventListener('click',()=>{activeFilter='all';renderActivities();});filterRow.appendChild(all);
    ACTIVITIES.forEach(a=>{const chip=document.createElement('div');chip.className=`filter-chip ${activeFilter===a.id?'active':''}`;chip.innerHTML=`${a.icon} ${a.label}`;chip.addEventListener('click',()=>{activeFilter=a.id;renderActivities();});filterRow.appendChild(chip);});
  }
  const grid=document.getElementById('activities-grid');if(!grid)return;
  grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--grey)">Loading…</div>';
  try{
    let q=db.collection('eagles_memories').orderBy('timestamp','desc');
    if(activeFilter!=='all')q=q.where('activity','==',activeFilter);
    const snap=await q.get();grid.innerHTML='';
    if(snap.empty){grid.innerHTML='<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">📷</div><p>No memories for this activity yet</p></div>';return;}
    snap.docs.forEach(doc=>{
      const m=doc.data(),info=FAMILY[m.uid]||{name:'Family',color:'#1a3a5c'},act=ACTIVITIES.find(a=>a.id===m.activity)||{icon:'📍',label:m.activity};
      const card=document.createElement('div');card.className='activity-card';
      card.innerHTML=`${m.photoURL&&m.mediaType!=='video'?`<img class="activity-card-photo" src="${m.photoURL}" loading="lazy" style="object-fit:cover;width:100%;aspect-ratio:1">`:`<div class="activity-card-photo">${act.icon}</div>`}<div class="activity-card-body"><div class="activity-card-title">${info.name}</div><div class="activity-card-sub">${act.icon} ${act.label} · ${m.date||''}</div></div>`;
      grid.appendChild(card);
    });
  }catch(e){grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--grey)">Could not load</div>';}
}

// ============================================================
// PROFILE + AVATAR PICKER
// ============================================================
async function renderProfile() {
  if(!currentUser)return;
  const info=getFamilyInfo(currentUser.uid);
  const profileAvatarEl=document.getElementById('profile-avatar');
  const saved=getSavedAvatar(currentUser.uid);
  if(saved&&profileAvatarEl)renderAvatarEl(profileAvatarEl,saved);
  else if(profileAvatarEl){profileAvatarEl.textContent=info.avatar;profileAvatarEl.style.background=`linear-gradient(135deg,${info.color},#c9a84c)`;}
  const nameEl=document.getElementById('profile-name');if(nameEl)nameEl.textContent=info.name;
  const roleEl=document.getElementById('profile-role');if(roleEl)roleEl.textContent=info.role;
  try{
    const snap=await db.collection('eagles_memories').get();
    const all=snap.docs.map(d=>({id:d.id,...d.data()}));
    const mine=all.filter(m=>m.uid===currentUser.uid);
    const statMem=document.getElementById('stat-memories');if(statMem)statMem.textContent=mine.length;
    const statLikes=document.getElementById('stat-likes');if(statLikes)statLikes.textContent=mine.reduce((s,m)=>s+(m.likes||[]).length,0);
    const statGiven=document.getElementById('stat-liked');if(statGiven)statGiven.textContent=all.reduce((s,m)=>s+((m.likes||[]).filter(l=>l===currentUser.uid).length),0);
    const fam=document.getElementById('family-roster');
    if(fam){fam.innerHTML='';Object.entries(FAMILY).forEach(([uid,f])=>{const mm=all.filter(m=>m.uid===uid);const row=document.createElement('div');row.className='family-member-row';row.innerHTML=`<div class="fam-avatar" style="background:${f.color}">${f.avatar}</div><div class="fam-info"><div class="fam-name">${f.name}</div><div class="fam-role">${f.role}</div></div><div class="fam-count">${mm.length} memories</div>`;fam.appendChild(row);});}
  }catch(e){console.error('Profile:',e);}
}

function openAvatarPicker() {
  const modal=document.getElementById('avatar-modal');if(!modal)return;
  modal.classList.add('show');
  const grid=document.getElementById('avatar-emoji-grid');
  if(grid){
    grid.innerHTML='';
    AVATAR_CHARS.forEach(ch=>{
      const btn=document.createElement('div');btn.className='avatar-option';btn.textContent=ch;
      btn.addEventListener('click',()=>saveAvatar({type:'emoji',value:ch}));
      grid.appendChild(btn);
    });
  }
  const setupInput=(id,isCamera)=>{
    const el=document.getElementById(id);
    el?.addEventListener('change',async e=>{
      const file=e.target.files[0];if(!file)return;
      showLoading(true);
      try{const c=await compressImage(file,400,0.85);const url=await uploadToCloudinary(c);saveAvatar({type:'photo',value:url});}
      catch(err){showToast('Photo upload failed');showLoading(false);}
    },{once:true});
  };
  document.getElementById('avatar-photo-btn')?.addEventListener('click',()=>document.getElementById('avatar-photo-input')?.click(),{once:true});
  document.getElementById('avatar-camera-btn')?.addEventListener('click',()=>document.getElementById('avatar-camera-input')?.click(),{once:true});
  setupInput('avatar-photo-input');
  setupInput('avatar-camera-input');
  document.getElementById('avatar-modal-close')?.addEventListener('click',()=>modal.classList.remove('show'),{once:true});
}

function saveAvatar(data) {
  if(!currentUser)return;
  localStorage.setItem(`eagles_avatar_${currentUser.uid}`,JSON.stringify(data));
  const profileEl=document.getElementById('profile-avatar'), headerEl=document.getElementById('header-avatar');
  if(profileEl)renderAvatarEl(profileEl,data);
  if(headerEl)renderAvatarEl(headerEl,data);
  document.getElementById('avatar-modal')?.classList.remove('show');
  showLoading(false);
  showToast('✅ Profile picture updated!');
}

// ============================================================
// HELPERS
// ============================================================
function registerServiceWorker() { if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js').catch(e=>console.log('SW:',e)); }
function showScreen(name) { document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); document.getElementById(name)?.classList.add('active'); }
function showLoading(show) { document.getElementById('loading-overlay')?.classList.toggle('show',show); }
function showToast(msg,duration=2800) { const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),duration); }
function logout() { auth.signOut().then(()=>{ currentUser=null;if(unsubscribeFeed)unsubscribeFeed();showScreen('splash');showToast('Signed out 👋'); }); }
