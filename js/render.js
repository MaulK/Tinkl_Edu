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
      ctx.fillRect(j*w, i*h, w, h); ctx.strokeRect(j*w, i*h, w, h);
      
      const colorEnt = lvl.ents.find(e => e.type==='color' && e.color==='red' && e.x===j && e.y===i);
      if (colorEnt) {
         ctx.fillStyle = '#FECACA'; ctx.fillRect(j*w, i*h, w, h); 
         ctx.fillStyle = '#EF4444';
         ctx.beginPath(); ctx.roundRect(j*w + w*0.1, i*h + h*0.1, w*0.8, h*0.8, 12); ctx.fill();
         ctx.fillStyle = '#B91C1C';
         ctx.beginPath(); ctx.roundRect(j*w + w*0.2, i*h + h*0.2, w*0.6, h*0.6, 8); ctx.fill();
      }
    }
  }
  // Goal Star
  ctx.fillStyle = '#FEF08A';
  drawStar(ctx, lvl.goal.x*w + w/2, lvl.goal.y*h + h/2, 5, w*0.4, w*0.2);
  ctx.fillStyle = '#F59E0B';
  drawStar(ctx, lvl.goal.x*w + w/2, lvl.goal.y*h + h/2, 5, w*0.3, w*0.15);
  
  // Ents
  lvl.ents.forEach(e => {
    if (e.type==='flower' && !state.collectedFlowers.includes(`${e.x},${e.y}`)) {
      const cx = e.x*w+w/2, cy = e.y*h+h/2, r = w*0.35;
      
      // Stem
      ctx.strokeStyle = '#22C55E'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + r*0.8); ctx.stroke();
      
      // Leaves
      ctx.fillStyle = '#22C55E';
      ctx.beginPath(); ctx.ellipse(cx - r*0.3, cy + r*0.4, r*0.3, r*0.15, -Math.PI/4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + r*0.3, cy + r*0.4, r*0.3, r*0.15, Math.PI/4, 0, Math.PI*2); ctx.fill();
      
      // Petals
      ctx.fillStyle = '#F472B6';
      for(let p=0; p<5; p++) {
        let angle = (p * Math.PI * 2) / 5;
        ctx.beginPath(); ctx.arc(cx + Math.cos(angle)*r*0.45, cy + Math.sin(angle)*r*0.45, r*0.4, 0, Math.PI*2); ctx.fill();
      }
      
      // Center
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath(); ctx.arc(cx, cy, r*0.3, 0, Math.PI*2); ctx.fill();
    }
  });

  // Robot
  const rx = state.visualPos.x, ry = state.visualPos.y;
  const rcx = rx*w+w/2, rcy = ry*h+h/2, rw = w*0.6, rh = h*0.6;
  
  // Robot Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath(); ctx.ellipse(rcx, rcy + rh*0.5, rw*0.6, rw*0.15, 0, 0, Math.PI*2); ctx.fill();
  
  // Antenna
  ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(rcx, rcy - rh/2); ctx.lineTo(rcx, rcy - rh*0.8); ctx.stroke();
  ctx.fillStyle = '#EF4444'; ctx.beginPath(); ctx.arc(rcx, rcy - rh*0.8, 4, 0, Math.PI*2); ctx.fill();
  
  // Tracks / Wheels
  ctx.fillStyle = '#334155';
  ctx.beginPath(); ctx.roundRect(rcx - rw/2 - 4, rcy - rh*0.3, 8, rh*0.8, 4); ctx.fill();
  ctx.beginPath(); ctx.roundRect(rcx + rw/2 - 4, rcy - rh*0.3, 8, rh*0.8, 4); ctx.fill();

  // Body
  ctx.fillStyle = '#4DB6AC'; 
  ctx.beginPath(); ctx.roundRect(rcx - rw/2, rcy - rh/2, rw, rh, 12); ctx.fill();
  
  // Screen/Face
  ctx.fillStyle = '#0F172A';
  ctx.beginPath(); ctx.roundRect(rcx - rw*0.35, rcy - rh*0.25, rw*0.7, rh*0.5, 6); ctx.fill();
  
  // Glowing Eyes
  ctx.fillStyle = '#38BDF8';
  ctx.beginPath(); ctx.arc(rcx - rw*0.15, rcy, rw*0.1, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(rcx + rw*0.15, rcy, rw*0.1, 0, Math.PI*2); ctx.fill();
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
