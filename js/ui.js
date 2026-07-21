function updateUI() {
  let calcLevel = Math.min(8, Math.floor(state.xp / 300) + 1);
  if (calcLevel > state.level) {
    state.level = calcLevel;
    showModal('Level Up!', `You are now a ${TITLES[state.level-1]}!`, () => {});
    playSound('success'); triggerConfetti();
  }
  document.getElementById('xp-bar').style.width = state.level >= 8 ? '100%' : `${(state.xp % 300) / 3}%`;
  document.getElementById('level-title').innerText = TITLES[state.level-1];
  document.getElementById('streak-count').innerText = state.streak;
  
  const acc = document.getElementById('pet-accessory');
  acc.innerHTML = '';
  if (state.equippedAccessory) {
    const reward = REWARDS.find(r => r.id === state.equippedAccessory);
    if (reward) acc.innerHTML = reward.svg;
  }
  
  updateProfileUI();
}

function equipAccessory(id) {
  if (state.equippedAccessory === id) state.equippedAccessory = null;
  else state.equippedAccessory = id;
  saveData();
  playSound('click');
}

function updateProfileUI() {
  document.getElementById('profile-name').innerText = state.playerName || 'Coder';
  document.getElementById('profile-title').innerText = TITLES[state.level-1];
  
  const xpInLevel = state.xp % 300;
  const isMax = state.level >= 8;
  document.getElementById('profile-xp-bar').style.width = isMax ? '100%' : `${(xpInLevel / 300)*100}%`;
  document.getElementById('profile-xp-text').innerText = isMax ? 'Max Level!' : `${xpInLevel} / 300`;
  
  let totalStars = 0;
  Object.values(state.stars).forEach(s => totalStars += s);
  document.getElementById('stat-stars').innerText = totalStars;
  document.getElementById('stat-streak').innerText = state.streak;

  const list = document.getElementById('rewards-list');
  list.innerHTML = '';
  REWARDS.forEach(r => {
    const isUnlocked = state.level >= r.level;
    const isEquipped = state.equippedAccessory === r.id;
    
    let btn = '🔒';
    if (isUnlocked) {
      if (isEquipped) btn = `<button onclick="equipAccessory('${r.id}')" class="bg-brand-orange text-white px-4 py-2 rounded-xl text-sm font-bold shadow-[0_4px_0_0_#C2410C] active:translate-y-1 active:shadow-none transition-all">UNEQUIP</button>`;
      else btn = `<button onclick="equipAccessory('${r.id}')" class="bg-brand-teal text-white px-4 py-2 rounded-xl text-sm font-bold shadow-[0_4px_0_0_#0F766E] active:translate-y-1 active:shadow-none transition-all">EQUIP</button>`;
    }

    list.innerHTML += `
      <div class="flex items-center justify-between p-4 rounded-2xl ${isUnlocked ? (isEquipped ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800') : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 opacity-60'}">
        <div class="flex items-center gap-4">
          <div class="text-4xl ${isUnlocked ? '' : 'grayscale'}">${r.icon}</div>
          <div>
            <div class="font-bold ${isUnlocked ? (isEquipped ? 'text-brand-orange' : 'text-green-700 dark:text-green-400') : 'text-slate-500'}">${r.name}</div>
            <div class="text-xs font-bold uppercase text-slate-400">Unlocks at Level ${r.level}</div>
          </div>
        </div>
        <div>${btn}</div>
      </div>
    `;
  });
}

function toggleDarkMode() { document.documentElement.classList.toggle('dark'); }
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
  document.getElementById(`${id}-screen`).classList.remove('hidden');
  if (id === 'level') renderMap();
}

function resetProgress() { document.getElementById('confirm-modal-overlay').classList.remove('hidden'); }
function closeConfirmModal() { document.getElementById('confirm-modal-overlay').classList.add('hidden'); }
function confirmReset() { localStorage.removeItem('tinkl_data'); location.reload(); }

function editName() {
  const input = document.getElementById('name-input');
  input.value = state.playerName || 'Coder';
  document.getElementById('name-modal-overlay').classList.remove('hidden');
  input.focus();
}
function closeNameModal() { document.getElementById('name-modal-overlay').classList.add('hidden'); }
function saveName() {
  const name = document.getElementById('name-input').value.trim();
  if (name) { state.playerName = name.substring(0, 15); saveData(); }
  closeNameModal();
}

function renderMap() {
  const container = document.getElementById('level-grid');
  container.innerHTML = '';
  LEVELS.forEach((lvl, i) => {
    let isLocked = false;
    let isCurrent = false;
    
    if (lvl.id === 99) {
      isLocked = state.highestLevel < 3;
    } else {
      isLocked = lvl.id > state.highestLevel + 1;
      isCurrent = lvl.id === state.highestLevel + 1;
    }

    const stars = state.stars[lvl.id] || 0;
    let starHTML = '';
    for(let j=0; j<3; j++) starHTML += `<span class="${j < stars ? 'text-brand-yellow drop-shadow-md' : 'text-slate-300 dark:text-slate-600'}">★</span>`;

    let btnClass = isCurrent ? 'bg-brand-orange text-white animate-bounce-slow' 
                 : isLocked ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-[0_6px_0_0_#CBD5E1] dark:shadow-[0_6px_0_0_#334155]' 
                 : 'bg-brand-teal text-white hover:scale-110 shadow-[0_6px_0_0_#0F766E]';
    
    let displayId = isLocked ? '🔒' : lvl.id;
    if (lvl.id === 99) {
      displayId = isLocked ? '🔒' : '🏆';
      if (!isLocked) btnClass = 'bg-brand-yellow text-white hover:scale-110 shadow-[0_6px_0_0_#D97706] animate-pulse-glow';
    }

    container.innerHTML += `
      <div class="relative flex flex-col items-center group ${lvl.id===99 ? 'col-span-2 md:col-span-4 mt-8' : ''}">
        ${i > 0 && lvl.id !== 99 ? `<div class="absolute -left-12 top-10 w-16 h-1 border-t-4 border-dashed ${isLocked ? 'border-slate-300 dark:border-slate-700' : 'border-brand-teal'} -z-10 hidden md:block"></div>` : ''}
        <button onclick="startLevel(${lvl.id})" ${isLocked ? 'disabled' : ''}
          class="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-3xl font-display font-bold shadow-[0_6px_0_0_rgba(0,0,0,0.15)] active:shadow-none active:translate-y-[6px] transition-all
          ${btnClass}">
          ${displayId}
        </button>
        <div class="mt-4 text-center bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-xl backdrop-blur-sm shadow-sm border border-slate-100 dark:border-slate-700">
          <h4 class="font-bold text-slate-700 dark:text-slate-200 text-sm md:text-base ${lvl.id===99 ? 'text-brand-orange' : ''}">${lvl.title}</h4>
          <div class="flex justify-center mt-1 text-sm md:text-lg">${!isLocked && stars > 0 ? starHTML : ''}</div>
        </div>
      </div>`;
  });
}

let dragClone = null, currentTarget = null, draggedBlockId = null;
let startX = 0, startY = 0;

function initInteraction() {
  document.addEventListener('pointerdown', (e) => {
    const tblock = e.target.closest('.toolbox-block');
    const wblock = e.target.closest('.workspace-block');
    if (!tblock && !wblock) return;
    const block = tblock || wblock;
    draggedBlockId = block.dataset.id;
    currentTarget = block;
    startX = e.clientX; startY = e.clientY;
    
    dragClone = block.cloneNode(true);
    dragClone.classList.add('fixed', 'pointer-events-none', 'z-50', 'scale-110', 'opacity-90', 'shadow-2xl');
    dragClone.style.left = (e.clientX - block.offsetWidth/2) + 'px';
    dragClone.style.top = (e.clientY - block.offsetHeight/2) + 'px';
    dragClone.style.width = block.offsetWidth + 'px';
    document.body.appendChild(dragClone);
    
    if (wblock) wblock.style.opacity = '0.3';
  });

  document.addEventListener('pointermove', (e) => {
    if (!dragClone) return;
    dragClone.style.left = (e.clientX - dragClone.offsetWidth/2) + 'px';
    dragClone.style.top = (e.clientY - dragClone.offsetHeight/2) + 'px';
  });

  document.addEventListener('pointerup', (e) => {
    if (!dragClone) return;
    const workspace = document.getElementById('workspace-blocks');
    const rect = workspace.getBoundingClientRect();
    const inArea = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    
    if (currentTarget.classList.contains('toolbox-block')) {
      const isTap = Math.hypot(e.clientX - startX, e.clientY - startY) < 5;
      if (isTap || inArea) {
        addBlock(draggedBlockId);
      }
    } else if (currentTarget.classList.contains('workspace-block')) {
      if (!inArea || Math.hypot(e.clientX - startX, e.clientY - startY) < 5) {
        currentTarget.remove(); playSound('click');
      } else {
        currentTarget.style.opacity = '1';
      }
    }
    dragClone.remove(); dragClone = null; currentTarget = null;
  });
}

function addBlock(id) {
  const ws = document.getElementById('workspace-blocks');
  const def = BLOCKS[id];
  const el = document.createElement('div');
  el.className = `workspace-block select-none text-white font-bold py-3 px-4 rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)] border-b-4 cursor-pointer hover:brightness-110 transition-all transform scale-0 origin-left ${def.color}`;
  el.dataset.id = id; el.innerHTML = def.label;
  ws.appendChild(el);
  requestAnimationFrame(() => el.style.transform = 'scale(1)');
  ws.scrollTop = ws.scrollHeight;
  playSound('click');
}

function clearWorkspace() { document.getElementById('workspace-blocks').innerHTML = ''; }

function triggerConfetti() {
  const c = document.getElementById('confetti-container');
  const colors = ['#FF8A65', '#4DB6AC', '#FFD54F', '#BA68C8', '#4ADE80'];
  for(let i=0; i<60; i++) {
    const p = document.createElement('div');
    p.style.position = 'absolute'; p.style.width = '12px'; p.style.height = '12px';
    p.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
    p.style.left = '50%'; p.style.top = '50%'; p.style.borderRadius = Math.random()>0.5 ? '50%' : '2px';
    const a = Math.random()*Math.PI*2, v = 50+Math.random()*150;
    const tx = Math.cos(a)*v, ty = Math.sin(a)*v - 150;
    p.animate([
      { transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 1 },
      { transform: `translate(${tx}px, ${ty}px) rotate(${Math.random()*360}deg)`, opacity: 1, offset: 0.7 },
      { transform: `translate(${tx}px, ${ty+200}px) rotate(${Math.random()*720}deg)`, opacity: 0 }
    ], { duration: 1500+Math.random()*1000, easing: 'cubic-bezier(.17,.89,.32,1.28)', fill: 'forwards' });
    c.appendChild(p); setTimeout(()=>p.remove(), 3000);
  }
}

function initBackground() {
  const bg = document.getElementById('bg-shapes');
  const shapes = ['{ }', '< >', ';', '★', '●', '■', '()'];
  for(let i=0; i<15; i++) {
    const el = document.createElement('div');
    el.innerText = shapes[Math.floor(Math.random()*shapes.length)];
    el.className = 'absolute text-brand-teal/20 dark:text-brand-teal/10 font-display text-4xl animate-float select-none';
    el.style.left = `${Math.random()*100}%`; el.style.top = `${Math.random()*100}%`;
    el.style.animationDelay = `${Math.random()*5}s`; el.style.animationDuration = `${4+Math.random()*4}s`;
    bg.appendChild(el);
  }
}

function showModal(title, desc, cb, isFail = false) {
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-desc').innerText = desc;
  document.getElementById('modal-title').className = `font-display text-4xl mb-2 ${isFail ? 'text-red-500' : 'text-brand-orange'}`;
  document.getElementById('modal-icon').innerText = isFail ? '🤔' : '🌟';
  
  const btn = document.getElementById('modal-btn');
  if (btn) {
     btn.innerText = isFail ? 'Try Again' : 'Continue';
     btn.className = isFail 
       ? 'bg-slate-500 hover:bg-slate-600 text-white font-display text-2xl py-3 px-8 rounded-2xl w-full shadow-[0_4px_0_0_#334155] active:translate-y-1 active:shadow-none transition-all'
       : 'bg-brand-teal hover:bg-teal-500 text-white font-display text-2xl py-3 px-8 rounded-2xl w-full shadow-[0_4px_0_0_#0F766E] active:translate-y-1 active:shadow-none transition-all';
  }
  
  document.getElementById('modal-overlay').classList.remove('hidden');
  modalCallback = cb;
}
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  if (modalCallback) { modalCallback(); modalCallback = null; }
}

function showPetMessage(msg, type) {
  const b = document.getElementById('pet-bubble'), t = document.getElementById('pet-message'), p = document.getElementById('pet-svg');
  t.innerText = msg; b.classList.remove('hidden');
  p.classList.remove('pet-idle'); p.classList.add('pet-jump');
  setTimeout(() => { p.classList.remove('pet-jump'); p.classList.add('pet-idle'); }, 500);
  setTimeout(() => b.classList.add('hidden'), 4000);
}

function pokePet() {
  playSound('click');
  const msgs = ["You're doing great!", "Coding is fun!", "Keep going!", "I believe in you!"];
  showPetMessage(msgs[Math.floor(Math.random()*msgs.length)], 'happy');
}
