let state = { xp: 0, level: 1, highestLevel: 0, stars: {}, streak: 1, lastPlayDate: '', playerName: 'Coder', equippedAccessory: null, weeklyStarsWeek: 0 };
let currentLevel = null;
let gameState = {};
let executionTimeout = null;
let modalCallback = null;

function loadData() {
  const saved = localStorage.getItem('tinkl_data');
  if (saved) state = Object.assign(state, JSON.parse(saved));
  const today = new Date().toDateString();
  if (state.lastPlayDate !== today) {
    if (state.lastPlayDate) {
      const diffDays = Math.ceil(Math.abs(new Date(today) - new Date(state.lastPlayDate)) / (1000 * 60 * 60 * 24));
      state.streak = diffDays === 1 ? state.streak + 1 : 1;
    }
    state.lastPlayDate = today;
  }
  if (state.weeklyStarsWeek !== currentWeekNum) {
    state.weeklyStarsWeek = currentWeekNum;
    delete state.stars[99];
  }
  saveData();
  updateUI();
}

function saveData() { 
  localStorage.setItem('tinkl_data', JSON.stringify(state)); 
  updateUI(); 
}
