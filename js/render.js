function renderLoop() {
  if (currentLevel) {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    if (gameState.targetPos && gameState.visualPos) {
      gameState.visualPos.x += (gameState.targetPos.x - gameState.visualPos.x) * 0.2;
      gameState.visualPos.y += (gameState.targetPos.y - gameState.visualPos.y) * 0.2;
    }
    if (gameState.targetAngle !== undefined) {
      gameState.visualAngle += (gameState.targetAngle - gameState.visualAngle) * 0.2;
    }

    if (currentLevel.type === 'grid') drawGrid(ctx, gameState, currentLevel);
    else if (currentLevel.type === 'turtle') drawTurtle(ctx, gameState, currentLevel);
    else if (currentLevel.type === 'logic') drawLogic(ctx, gameState, currentLevel);
    else if (currentLevel.type === 'pattern') drawPattern(ctx, gameState, currentLevel);
  }
  requestAnimationFrame(renderLoop);
}

function drawGrid(ctx, state, lvl) {
  ctx.clearRect(0, 0, 400, 400);
  const w = 400 / lvl.size, h = 400 / lvl.size;
  ctx.strokeStyle = '#E2E8F0'; ctx.lineWidth = 2;
  for(let i=0; i<lvl.size; i++) {
    for(let j=0; j<lvl.size; j++) {
      ctx.fillStyle = (i+j)%2===0 ? '#F8FAFC' : '#F1F5F9';
      if (lvl.ents.find(e => e.type==='color' && e.color==='red' && e.x===j && e.y===i)) ctx.fillStyle = '#FECACA';
      ctx.fillRect(j*w, i*h, w, h); ctx.strokeRect(j*w, i*h, w, h);
    }
  }
  // Goal
  ctx.fillStyle = '#FFD54F';
  drawStar(ctx, lvl.goal.x*w + w/2, lvl.goal.y*h + h/2, 5, w*0.3, w*0.15);
  // Ents
  lvl.ents.forEach(e => {
    if (e.type==='flower' && !state.collectedFlowers.includes(`${e.x},${e.y}`)) {
      ctx.fillStyle = '#F472B6'; ctx.beginPath(); ctx.arc(e.x*w+w/2, e.y*h+h/2, w*0.25, 0, Math.PI*2); ctx.fill();
    }
  });
  // Robot
  const rx = state.visualPos.x, ry = state.visualPos.y;
  ctx.fillStyle = '#4DB6AC'; ctx.beginPath(); ctx.roundRect(rx*w+w*0.2, ry*h+h*0.2, w*0.6, h*0.6, 10); ctx.fill();
  ctx.fillStyle = '#1E293B'; ctx.fillRect(rx*w+w*0.35, ry*h+h*0.35, w*0.1, w*0.1); ctx.fillRect(rx*w+w*0.55, ry*h+h*0.35, w*0.1, w*0.1);
}

function drawStar(ctx, cx, cy, spikes, outR, inR) {
  let rot = Math.PI/2*3, x, y, step = Math.PI/spikes;
  ctx.beginPath(); ctx.moveTo(cx, cy - outR);
  for(let i=0; i<spikes; i++) {
    x=cx+Math.cos(rot)*outR; y=cy+Math.sin(rot)*outR; ctx.lineTo(x,y); rot+=step;
    x=cx+Math.cos(rot)*inR; y=cy+Math.sin(rot)*inR; ctx.lineTo(x,y); rot+=step;
  }
  ctx.lineTo(cx, cy - outR); ctx.closePath(); ctx.fill();
}

function drawTurtle(ctx, state) {
  ctx.clearRect(0, 0, 400, 400);
  ctx.strokeStyle = '#FF8A65'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  if(state.path.length>0) {
    ctx.moveTo(state.path[0].x, state.path[0].y);
    for(let i=1; i<state.path.length; i++) ctx.lineTo(state.path[i].x, state.path[i].y);
    ctx.stroke();
  }
  ctx.save(); ctx.translate(state.visualPos.x, state.visualPos.y); ctx.rotate(state.visualAngle * Math.PI/180);
  ctx.fillStyle = '#4ADE80';
  ctx.beginPath(); ctx.arc(0,0,15,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(15,0,8,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#1E293B'; ctx.beginPath(); ctx.arc(17,-3,2,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(17,3,2,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawLogic(ctx, state) {
  ctx.clearRect(0,0,400,400);
  ctx.fillStyle = state.weather === 'rain' ? '#94A3B8' : '#86EFAC'; ctx.fillRect(0,0,400,400);
  ctx.font = '80px Arial'; ctx.textAlign = 'center'; ctx.fillText(state.weather === 'rain' ? '🌧️' : '☀️', 200, 100);
  ctx.fillStyle = '#4DB6AC'; ctx.beginPath(); ctx.roundRect(140,150,120,120,20); ctx.fill();
  ctx.fillStyle = '#1E293B'; ctx.fillRect(165,185,25,25); ctx.fillRect(210,185,25,25);
  ctx.font = '50px Arial';
  if(state.botState === 'useUmbrella') ctx.fillText('☂️', 120, 150);
  else if(state.botState === 'wearShades') ctx.fillText('🕶️', 200, 185);
}

function drawPattern(ctx, state, lvl) {
  ctx.clearRect(0,0,400,400);
  const w=50, gap=20, startX = 200 - ((lvl.seq.length*(w+gap))/2) + w/2;
  lvl.seq.forEach((item, i) => {
    const x = startX + i*(w+gap);
    if(i === lvl.seq.length-1) {
      ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 3; ctx.setLineDash([5,5]);
      ctx.beginPath(); ctx.arc(x,200,w/2,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
      if(state.ans) drawShape(ctx, state.ans, x, 200, w/2);
      else { ctx.font = '30px Arial'; ctx.fillStyle = '#94A3B8'; ctx.textAlign='center'; ctx.fillText('?', x, 210); }
    } else {
      drawShape(ctx, item, x, 200, w/2);
    }
  });
}

function drawShape(ctx, type, x, y, r) {
  ctx.beginPath();
  if(type==='circleRed') ctx.fillStyle='#EF4444'; if(type==='circleBlue') ctx.fillStyle='#3B82F6'; if(type==='circleGreen') ctx.fillStyle='#10B981';
  ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
}
