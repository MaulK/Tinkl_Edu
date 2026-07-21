function startLevel(id) {
  currentLevel = LEVELS.find(l => l.id === id);
  document.getElementById('level-name').innerText = `Level ${currentLevel.id}: ${currentLevel.title}`;
  document.getElementById('mobile-level-name').innerText = currentLevel.title;
  
  let starHTML = '';
  for(let i=0; i<3; i++) starHTML += `<span class="${i < (state.stars[id]||0) ? 'text-brand-yellow' : 'text-slate-300 dark:text-slate-600'}">★</span>`;
  document.getElementById('level-stars-display').innerHTML = starHTML;
  
  const tb = document.getElementById('toolbox');
  tb.innerHTML = '';
  currentLevel.tools.forEach(tid => {
    const def = BLOCKS[tid];
    tb.innerHTML += `<div class="toolbox-block select-none text-white font-bold py-2 px-3 rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)] border-b-4 cursor-grab active:cursor-grabbing hover:brightness-110 transition-all ${def.color}" data-id="${tid}">${def.label}</div>`;
  });
  clearWorkspace();
  resetLevel();
  showScreen('level');
  showPetMessage("Let's go!", "happy");
}

function resetLevel() {
  clearTimeout(executionTimeout);
  document.getElementById('run-btn').innerHTML = '▶️ RUN';
  document.getElementById('run-btn').disabled = false;
  gameState = {
    pos: currentLevel.start ? {...currentLevel.start} : {x:0,y:0},
    targetPos: currentLevel.start ? {...currentLevel.start} : {x:0,y:0},
    visualPos: currentLevel.start ? {...currentLevel.start} : {x:0,y:0},
    angle: -90, targetAngle: -90, visualAngle: -90,
    collectedFlowers: [], collected: 0, path: currentLevel.type==='turtle' ? [{x:200,y:200}] : [],
    turn: 0, weather: 'rain', botState: 'normal', queue: []
  };
  if(currentLevel.type==='turtle') { gameState.pos={x:200,y:200}; gameState.targetPos={x:200,y:200}; gameState.visualPos={x:200,y:200}; }
}

function compileAST(blocks) {
  let ast = [], i = 0;
  while(i < blocks.length) {
    if (blocks[i] === 'repeat4') {
      let body = []; i++;
      while(i < blocks.length && blocks[i] !== 'endRepeat') { body.push(blocks[i]); i++; }
      for(let j=0; j<4; j++) ast.push(...body);
    } else if (blocks[i] === 'defA') {
      let body = []; i++;
      while(i < blocks.length && blocks[i] !== 'endTrick') { body.push(blocks[i]); i++; }
      window.savedFuncA = body;
    } else if (blocks[i] === 'funcA') {
      if (window.savedFuncA) ast.push(...window.savedFuncA);
    } else {
      ast.push(blocks[i]);
    }
    i++;
  }
  return ast;
}

function runCode() {
  const wsBlocks = Array.from(document.getElementById('workspace-blocks').children).map(c => c.dataset.id);
  if (wsBlocks.length === 0) return pokePet();
  
  resetLevel();
  gameState.codeBlocks = wsBlocks;
  const ast = compileAST(wsBlocks);
  
  const btn = document.getElementById('run-btn');
  btn.innerHTML = '⏳...'; btn.disabled = true;
  
  if (currentLevel.mode === 'rules') {
    gameState.ast = ast; executeRuleTurn();
  } else if (currentLevel.type === 'logic') {
    gameState.ast = ast; executeLogicTurn();
  } else if (currentLevel.type === 'pattern') {
    gameState.ans = ast[0];
    executionTimeout = setTimeout(checkWin, 1000);
  } else {
    gameState.queue = ast; executeNext();
  }
}

function executeNext() {
  if (gameState.queue.length === 0) return checkWin();
  const inst = gameState.queue.shift();
  const def = BLOCKS[inst];
  
  if (currentLevel.type === 'grid' && def && def.type === 'move') {
    gameState.pos.x = Math.max(0, Math.min(currentLevel.size - 1, gameState.pos.x + def.action.x));
    gameState.pos.y = Math.max(0, Math.min(currentLevel.size - 1, gameState.pos.y + def.action.y));
    gameState.targetPos = {...gameState.pos};
    currentLevel.ents.forEach(e => {
      if (e.type === 'flower' && e.x === gameState.pos.x && e.y === gameState.pos.y) {
        const key = `${e.x},${e.y}`;
        if (!gameState.collectedFlowers.includes(key)) {
          gameState.collectedFlowers.push(key); gameState.collected++; playSound('click');
        }
      }
    });
  } else if (currentLevel.type === 'turtle') {
    if (inst === 'forward') {
      const r = gameState.angle * Math.PI / 180;
      gameState.pos.x += Math.cos(r) * 60; gameState.pos.y += Math.sin(r) * 60;
      gameState.targetPos = {...gameState.pos}; gameState.path.push({...gameState.pos});
    } else if (inst === 'turnRight') {
      gameState.angle += 90; gameState.targetAngle = gameState.angle;
    }
  }
  executionTimeout = setTimeout(executeNext, 500);
}

function executeRuleTurn() {
  if (currentLevel.win(gameState, gameState.codeBlocks) || gameState.turn >= 15) return checkWin();
  let acted = false, i = 0, ast = gameState.ast;
  while(i < ast.length && !acted) {
    if (ast[i] === 'ifRed') {
      const isRed = currentLevel.ents.find(e => e.type==='color' && e.color==='red' && e.x===gameState.pos.x && e.y===gameState.pos.y);
      i++;
      while(i < ast.length && ast[i] !== 'endIf') {
        if (isRed && !acted && BLOCKS[ast[i]]?.type === 'move') { applyMove(ast[i]); acted = true; }
        i++;
      }
    } else if (BLOCKS[ast[i]]?.type === 'move') {
      applyMove(ast[i]); acted = true;
    }
    i++;
  }
  gameState.turn++;
  if(!acted) return checkWin();
  executionTimeout = setTimeout(executeRuleTurn, 600);
}

function applyMove(inst) {
  const def = BLOCKS[inst];
  gameState.pos.x = Math.max(0, Math.min(currentLevel.size - 1, gameState.pos.x + def.action.x));
  gameState.pos.y = Math.max(0, Math.min(currentLevel.size - 1, gameState.pos.y + def.action.y));
  gameState.targetPos = {...gameState.pos};
}

function executeLogicTurn() {
  if (gameState.turn === 0) {
    gameState.weather = 'rain'; gameState.botState = evalLogic('rain');
    executionTimeout = setTimeout(() => { gameState.turn++; executeLogicTurn(); }, 1500);
  } else if (gameState.turn === 1) {
    gameState.weather = 'sun'; gameState.botState = evalLogic('sun');
    executionTimeout = setTimeout(() => { 
      gameState.success = (gameState.history[0] === 'useUmbrella' && gameState.botState === 'wearShades');
      checkWin(); 
    }, 1500);
  }
}

function evalLogic(w) {
  let out = 'normal', i = 0, ast = gameState.ast;
  while(i < ast.length) {
    if (ast[i] === 'ifRain') { i++; while(i<ast.length && ast[i]!=='endIf') { if(w==='rain') out=ast[i]; i++; } }
    else if (ast[i] === 'ifSun') { i++; while(i<ast.length && ast[i]!=='endIf') { if(w==='sun') out=ast[i]; i++; } }
    i++;
  }
  if (!gameState.history) gameState.history = [];
  gameState.history.push(out); return out;
}

function checkWin() {
  document.getElementById('run-btn').innerHTML = '▶️ RUN';
  document.getElementById('run-btn').disabled = false;
  
  if (currentLevel.id === 4) {
    const last = gameState.path[gameState.path.length-1];
    if (Math.hypot(last.x - 200, last.y - 200) < 5 && gameState.path.length >= 5) gameState.isSquare = true;
  }

  if (currentLevel.win(gameState, gameState.codeBlocks)) {
    playSound('success'); triggerConfetti(); showPetMessage('You did it!', 'happy');
    const c = gameState.codeBlocks.length;
    let stars = c <= 6 ? 3 : c <= 10 ? 2 : 1;
    
    if (!state.stars[currentLevel.id] || state.stars[currentLevel.id] < stars) state.stars[currentLevel.id] = stars;
    if (state.highestLevel < currentLevel.id) state.highestLevel = currentLevel.id;
    state.xp += stars * 100;
    saveData();
    
    executionTimeout = setTimeout(() => {
      showModal('Level Complete!', `You earned ${stars} stars!`, () => showScreen('home'));
    }, 1500);
  } else {
    playSound('fail'); showPetMessage("Oops! Let's try again.", 'think');
  }
}
