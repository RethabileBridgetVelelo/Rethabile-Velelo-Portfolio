// script.js - controls interactions, projects, AI, CV, modal, toast, star, glitter, flip nav

// small selectors
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

// voice availability init
let voices = [];
function loadVoices(){
  voices = window.speechSynthesis.getVoices() || [];
}
setTimeout(loadVoices, 200);
window.speechSynthesis.onvoiceschanged = loadVoices;

// ---------- star cursor (never hides) ----------
const star = $('#star-cursor');
document.addEventListener('mousemove', (e) => {
  star.style.left = e.clientX + 'px';
  star.style.top = e.clientY + 'px';
  const rot = (e.clientX / window.innerWidth - 0.5) * 12;
  star.style.transform = `translate(-50%,-50%) rotate(${rot}deg)`;
});
// star style is defined in CSS; it glows and animates on its own

// ---------- glitter (slow glowing falling) ----------
const glitterContainer = $('#glitter-container');
for(let i=0;i<60;i++){
  const g = document.createElement('div');
  g.className = 'glitter';
  g.style.left = (Math.random()*100) + 'vw';
  g.style.top = (-10 + Math.random()*20) + 'vh';
  g.style.animationDuration = (6 + Math.random()*6) + 's';
  g.style.animationDelay = (Math.random()*6) + 's';
  g.style.opacity = (0.5 + Math.random()*0.5);
  glitterContainer.appendChild(g);
}

// ---------- Page flip navigation ----------
const book = $('#book');
const pages = $$('.page');
const bookBtns = $$('.book-btn');
let currentIndex = 0;
function goToPage(index){
  if(index === currentIndex) return;
  const direction = index > currentIndex ? 'left' : 'right';
  const current = pages[currentIndex];
  const next = pages[index];

  // apply flip-out class
  if(direction === 'left'){ current.classList.add('flip-left'); }
  else { current.classList.add('flip-right'); }

  // after flip duration, reset and activate next
  setTimeout(() => {
    current.classList.remove('active','flip-left','flip-right');
    next.classList.add('active');
    currentIndex = index;
  }, 900);
}
bookBtns.forEach((btn, idx) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    const targetIndex = pages.findIndex(p => p.id === target);
    if(targetIndex >= 0) goToPage(targetIndex);
  });
});

// also make the top nav (book-nav) react
$$('.book-btn').forEach(b => {
  b.addEventListener('click', () => {
    const target = b.dataset.target;
    const idx = pages.findIndex(p => p.id === target);
    if(idx>=0) goToPage(idx);
  });
});

// ---------- Projects generation (50 names + gradient classes + contrast) ----------
const projectNames = knowledgeBase.projects.slice(); // from knowledge.js
const projectsContainer = $('#projects-container');
const gradClasses = ['g1','g2','g3','g4','g5','g6','g7','g8','g9','g10'];

function createProjectCards(filter=''){
  projectsContainer.innerHTML = '';
  projectNames.forEach((name, i) => {
    if(filter && !name.toLowerCase().includes(filter.toLowerCase())) return;
    const card = document.createElement('div');
    const grad = gradClasses[i % gradClasses.length];
    card.className = `project ${grad}`;
    const title = document.createElement('div');
    title.className = 'p-title';
    title.textContent = name;
    const meta = document.createElement('div');
    meta.className = 'p-meta';
    meta.textContent = `#${i+1}`;
    card.appendChild(title);
    card.appendChild(meta);

    // click opens modal
    card.addEventListener('click', () => {
      openProjectModal(i);
    });

    projectsContainer.appendChild(card);
  });
}
createProjectCards();

// search & reset
$('#project-search-btn').addEventListener('click', () => {
  const q = $('#project-search').value.trim();
  createProjectCards(q);
});
$('#projects-reset').addEventListener('click', () => {
  $('#project-search').value='';
  createProjectCards('');
});
$('#project-search').addEventListener('keypress', (e)=>{ if(e.key==='Enter') $('#project-search-btn').click(); });

// ---------- Project modal ----------
const projectModal = $('#project-modal');
const modalTitle = $('#modal-title');
const modalThumb = $('#modal-thumb');
const modalDesc = $('#modal-desc');
const modalGh = $('#modal-gh');
$('#modal-close').addEventListener('click', closeModal);
function openProjectModal(index){
  const name = projectNames[index];
  modalTitle.textContent = name;
  const desc = knowledgeBase.descriptions[name] || knowledgeBase.descriptions['default'];
  modalDesc.textContent = desc;
  // auto thumbnail (unsplash search)
  modalThumb.src = `https://source.unsplash.com/800x450/?technology,code,${encodeURIComponent(name)}`;
  modalThumb.style.display = 'block';
  modalGh.href = knowledgeBase.contacts.github || '#';
  projectModal.classList.add('show');
  projectModal.setAttribute('aria-hidden','false');
}
function closeModal(){
  projectModal.classList.remove('show');
  projectModal.setAttribute('aria-hidden','true');
  showToast("Are you done? It was nice meeting you. See you next time.");
}
window.addEventListener('click', (e)=>{
  if(e.target === projectModal) closeModal();
});

// ---------- CV viewer (tabs + download) ----------
const cvViewer = $('#cv-viewer');
const cvTabs = $$('.cv-tab');

function renderCVTab(tab){
  cvViewer.innerHTML = '';
  if(tab === 'summary'){
    cvViewer.innerHTML = `
      <h3>Professional Summary</h3>
      <p>${knowledgeBase.about}</p>
    `;
  } else if(tab === 'education'){
    cvViewer.innerHTML = `<h3>Education & Qualifications</h3><ul>${knowledgeBase.qualifications.map(q=>`<li>${q}</li>`).join('')}</ul>`;
  } else if(tab === 'skills'){
    cvViewer.innerHTML = `<h3>Skills</h3><p>HTML · CSS · JavaScript · React · Networking basics · AI/ML prototyping · Documentation</p>`;
  } else if(tab === 'projects'){
    cvViewer.innerHTML = `<h3>Projects</h3><ol>${projectNames.map((n,i)=>`<li><strong>${n}</strong>: ${knowledgeBase.descriptions[n]||knowledgeBase.descriptions['default']}</li>`).join('')}</ol>`;
  } else if(tab === 'contact'){
    const c = knowledgeBase.contacts;
    cvViewer.innerHTML = `<h3>Contact</h3><p>Email: <a href="mailto:${c.email}">${c.email}</a><br>Phone: <a href="https://wa.me/27${c.phone.replace(/\D/g,'')}">${c.phone}</a></p>`;
  }
}
cvTabs.forEach(btn=>{
  btn.addEventListener('click', ()=> {
    cvTabs.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderCVTab(btn.dataset.tab);
  });
});
// default tab
cvTabs[0].classList.add('active');
renderCVTab('summary');

// download CV
$('#download-cv').addEventListener('click', async ()=>{
  showToast('Rendering CV to PDF...');
  try{
    const el = $('#cv-viewer');
    const canvas = await html2canvas(el, {scale:2});
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({unit:'pt',format:'a4'});
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData,'PNG',0,0,pdfWidth,pdfHeight);
    pdf.save('Rethabile_CV.pdf');
    showToast('CV downloaded ✓');
  }catch(err){
    console.error(err); showToast('Error creating PDF. See console.');
  }
});

// ---------- AI assistant: search the knowledge base and portfolio content ----------
const aiInput = $('#ai-input');
const aiSearchBtn = $('#ai-search');
const aiSpeakBtn = $('#ai-speak-btn');
const aiChat = $('#ai-chat');

function appendChat(who, text){
  const row = document.createElement('div');
  row.className = 'chat-row';
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble ' + (who==='user' ? 'chat-user' : 'chat-ai');
  bubble.innerHTML = text.replace(/\n/g,'<br>');
  row.appendChild(bubble);
  aiChat.appendChild(row);
  aiChat.scrollTop = aiChat.scrollHeight;
}

function speakText(text){
  if(!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.pitch = 1;
  u.rate = 1;
  // choose female voice if available
  const preferred = voices.find(v => /female|zira|samantha|alloy/i.test(v.name)) || voices.find(v=>/en-.*female/i.test(v.name)) || voices[0];
  if(preferred) u.voice = preferred;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// AI answer logic: search knowledgeBase and page text
function aiAnswer(query){
  const q = query.toLowerCase().trim();
  if(!q) return "Hi — ask me about Rethabile's projects, qualifications, skills, or contact details.";
  // direct keyword checks
  if(q.includes('about') || q.includes('who are you') || q.includes('yourself')) return knowledgeBase.about;
  if(q.includes('qualification') || q.includes('degree') || q.includes('certificate') || q.includes('study')) return `Qualifications: ${knowledgeBase.qualifications.join('; ')}`;
  if(q.includes('projects') || q.includes('project') || q.includes('work')) {
    return `Projects include: ${projectNames.slice(0,8).join(', ')}. Use 'show project <name>' for details.`;
  }
  if(q.startsWith('show project ') || q.startsWith('project ')){
    // try to match project name
    const name = q.replace(/^show project |^project /,'').trim();
    const foundIndex = projectNames.findIndex(p => p.toLowerCase().includes(name));
    if(foundIndex >= 0){
      const pname = projectNames[foundIndex];
      const desc = knowledgeBase.descriptions[pname] || knowledgeBase.descriptions['default'];
      return `${pname}: ${desc}`;
    } else {
      return `I couldn't find a project called "${name}". Try typing part of the project name or use the projects page.`;
    }
  }
  if(q.includes('contact') || q.includes('reach') || q.includes('email') || q.includes('phone')){
    const c = knowledgeBase.contacts;
    return `You can reach Rethabile at ${c.email} or WhatsApp ${c.phone}. GitHub: ${c.github}. Social placeholders: YouTube, TikTok, Instagram, LinkedIn.`;
  }
  if(q.includes('quote') || q.includes('motto')) return knowledgeBase.quotes[Math.floor(Math.random()*knowledgeBase.quotes.length)];
  // fallback: try simple search across descriptions & about
  let matches = [];
  if(knowledgeBase.about.toLowerCase().includes(q)) matches.push(knowledgeBase.about);
  projectNames.forEach((p, idx) => {
    const desc = (knowledgeBase.descriptions[p]||'').toLowerCase();
    if(p.toLowerCase().includes(q) || desc.includes(q)) matches.push(`${p}: ${knowledgeBase.descriptions[p]||knowledgeBase.descriptions['default']}`);
  });
  if(matches.length) return matches.slice(0,6).join('\n\n');
  return "I'm not sure about that yet. Try asking about 'projects', 'qualifications', 'contact', or 'show project <name>'.";
}

// handle AI interactions
aiSearchBtn.addEventListener('click', () => {
  const q = aiInput.value.trim();
  if(!q) { appendChat('user','(empty)'); appendChat('ai','Type a question to ask about the portfolio.'); return; }
  appendChat('user', q);
  const ans = aiAnswer(q);
  appendChat('ai', ans);
  speakText(ans);
  aiInput.value = '';
});

aiSpeakBtn.addEventListener('click', () => {
  const q = aiInput.value.trim();
  if(q){ appendChat('user', q); }
  const ans = aiAnswer(q || 'hello');
  appendChat('ai', ans);
  speakText(ans);
  aiInput.value = '';
});

// also support pressing Enter to send
aiInput.addEventListener('keypress', (e)=>{ if(e.key==='Enter') aiSearchBtn.click(); });

// ---------- Voice toggle (top-right) ----------
$('#voice-toggle').addEventListener('click', () => {
  const btn = $('#voice-toggle');
  if(btn.textContent.includes('🔈')) {
    btn.textContent = '🔊 Voice';
    showToast('Voice UI enabled — answers will be spoken');
  } else {
    btn.textContent = '🔈 Voice';
    window.speechSynthesis.cancel();
    showToast('Voice UI disabled');
  }
});

// ---------- Farewell toast ----------
const toast = $('#toast');
let toastTimer = null;
function showToast(msg, len = 3500){
  toast.textContent = msg;
  toast.classList.add('show');
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove('show'), len);
}

// ---------- initial helpers ----------
$('#year').textContent = new Date().getFullYear();
setTimeout(()=>showToast('Welcome! Ask RethAI anything — try "projects" or "qualifications".'), 700);
