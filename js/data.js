const BLOCKS = {
  up: { id: 'up', label: '⬆️ Up', color: 'bg-blue-500 border-blue-700', type: 'move', action: {x: 0, y: -1} },
  down: { id: 'down', label: '⬇️ Down', color: 'bg-blue-500 border-blue-700', type: 'move', action: {x: 0, y: 1} },
  left: { id: 'left', label: '⬅️ Left', color: 'bg-blue-500 border-blue-700', type: 'move', action: {x: -1, y: 0} },
  right: { id: 'right', label: '➡️ Right', color: 'bg-blue-500 border-blue-700', type: 'move', action: {x: 1, y: 0} },
  repeat4: { id: 'repeat4', label: '🔄 Repeat 4x', color: 'bg-purple-500 border-purple-700', type: 'control' },
  endRepeat: { id: 'endRepeat', label: '🔙 End Repeat', color: 'bg-purple-600 border-purple-800', type: 'control' },
  forward: { id: 'forward', label: '🐢 Forward', color: 'bg-green-500 border-green-700', type: 'turtle' },
  turnRight: { id: 'turnRight', label: '↪️ Turn Right', color: 'bg-green-600 border-green-800', type: 'turtle' },
  ifRed: { id: 'ifRed', label: '🔴 If on Red', color: 'bg-red-500 border-red-700', type: 'condition' },
  endIf: { id: 'endIf', label: '🔚 End If', color: 'bg-slate-500 border-slate-700', type: 'condition' },
  ifRain: { id: 'ifRain', label: '🌧️ If Rain', color: 'bg-indigo-500 border-indigo-700', type: 'logic' },
  useUmbrella: { id: 'useUmbrella', label: '☂️ Umbrella', color: 'bg-pink-500 border-pink-700', type: 'action' },
  ifSun: { id: 'ifSun', label: '☀️ If Sun', color: 'bg-yellow-500 border-yellow-700 text-slate-800', type: 'logic' },
  wearShades: { id: 'wearShades', label: '🕶️ Shades', color: 'bg-pink-500 border-pink-700', type: 'action' },
  defA: { id: 'defA', label: '🅰️ Learn Trick', color: 'bg-rose-500 border-rose-700', type: 'function' },
  funcA: { id: 'funcA', label: '🪄 Do Trick', color: 'bg-rose-600 border-rose-800', type: 'function' },
  endTrick: { id: 'endTrick', label: '🏁 End Trick', color: 'bg-rose-700 border-rose-900', type: 'function' },
  circleRed: { id: 'circleRed', label: '🔴 Red', color: 'bg-red-500 border-red-700', type: 'shape' },
  circleBlue: { id: 'circleBlue', label: '🔵 Blue', color: 'bg-blue-500 border-blue-700', type: 'shape' },
  circleGreen: { id: 'circleGreen', label: '🟢 Green', color: 'bg-green-500 border-green-700', type: 'shape' }
};

const LEVELS = [
  { id: 1, title: "Help the Robot Walk", cat: "Sequencing", tools: ['right', 'down'], type: 'grid', size: 5, start: {x:0, y:0}, goal: {x:3, y:2}, ents: [], win: s => s.pos.x===3 && s.pos.y===2 },
  { id: 2, title: "Pick the Flowers", cat: "Sequencing", tools: ['right', 'down', 'up', 'left'], type: 'grid', size: 5, start: {x:0, y:0}, goal: {x:4, y:4}, ents: [{type:'flower', x:2, y:0}, {type:'flower', x:4, y:2}], win: s => s.pos.x===4 && s.pos.y===4 && s.collected===2 },
  { id: 3, title: "Repeat the Dance", cat: "Loops", tools: ['right', 'repeat4', 'endRepeat'], type: 'grid', size: 6, start: {x:0, y:2}, goal: {x:4, y:2}, ents: [], win: (s,c) => s.pos.x===4 && s.pos.y===2 && c.includes('repeat4') },
  { id: 4, title: "Draw a Square", cat: "Loops", tools: ['forward', 'turnRight', 'repeat4', 'endRepeat'], type: 'turtle', win: (s,c) => s.isSquare && c.includes('repeat4') },
  { id: 5, title: "If/Else Maze", cat: "Conditionals", tools: ['ifRed', 'down', 'endIf', 'right'], type: 'grid', mode: 'rules', size: 5, start: {x:0, y:0}, goal: {x:3, y:3}, ents: [{type:'color', color:'red', x:1, y:0}, {type:'color', color:'red', x:2, y:1}, {type:'color', color:'red', x:3, y:2}], win: s => s.pos.x===3 && s.pos.y===3 },
  { id: 6, title: "Weather Bot", cat: "Conditionals", tools: ['ifRain', 'useUmbrella', 'endIf', 'ifSun', 'wearShades'], type: 'logic', win: s => s.success },
  { id: 7, title: "Teach a Trick", cat: "Functions", tools: ['defA', 'right', 'down', 'endTrick', 'funcA'], type: 'grid', size: 5, start: {x:0, y:0}, goal: {x:4, y:4}, ents: [], win: (s,c) => s.pos.x===4 && s.pos.y===4 && c.includes('funcA') },
  { id: 8, title: "Pattern Decoder", cat: "Logic", tools: ['circleRed', 'circleBlue', 'circleGreen'], type: 'pattern', seq: ['circleRed', 'circleBlue', 'circleRed', 'circleBlue', 'circleRed'], win: (s,c) => c[0]==='circleBlue' },
  { id: 9, title: "Double Trick", cat: "Functions", tools: ['defA', 'right', 'down', 'endTrick', 'funcA'], type: 'grid', size: 6, start: {x:0, y:0}, goal: {x:4, y:4}, ents: [], win: (s,c) => s.pos.x===4 && s.pos.y===4 && c.includes('funcA') },
  { id: 10, title: "Color Decoder", cat: "Logic", tools: ['circleRed', 'circleBlue', 'circleGreen'], type: 'pattern', seq: ['circleRed', 'circleGreen', 'circleBlue', 'circleRed', 'circleGreen'], win: (s,c) => c[0]==='circleBlue' }
];

const currentWeekNum = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
const bonusLevels = [
  { id: 99, title: "Weekly: Flower Run", cat: "Bonus", tools: ['right', 'down', 'left', 'up', 'repeat4', 'endRepeat'], type: 'grid', size: 6, start: {x:0, y:0}, goal: {x:5, y:5}, ents: [{type:'flower', x:2, y:2}, {type:'flower', x:2, y:5}, {type:'flower', x:4, y:1}], win: s => s.pos.x===5 && s.pos.y===5 && s.collected===3 },
  { id: 99, title: "Weekly: Green Code", cat: "Bonus", tools: ['circleRed', 'circleBlue', 'circleGreen'], type: 'pattern', seq: ['circleGreen', 'circleGreen', 'circleBlue', 'circleGreen', 'circleGreen'], win: (s,c) => c[0]==='circleBlue' },
  { id: 99, title: "Weekly: Rule Maker", cat: "Bonus", tools: ['ifRed', 'down', 'endIf', 'right'], type: 'grid', mode: 'rules', size: 5, start: {x:0, y:0}, goal: {x:4, y:2}, ents: [{type:'color', color:'red', x:2, y:0}, {type:'color', color:'red', x:4, y:0}], win: s => s.pos.x===4 && s.pos.y===2 }
];
LEVELS.push(bonusLevels[currentWeekNum % 3]);

const TITLES = [
  "Bug Hunter", "Code Explorer", "Logic Wizard", "Loop Master",
  "Pixel Artist", "Script Sentinel", "Algorithm Ace", "Code Ninja"
];

const REWARDS = [
  { id: 'cap', level: 2, name: "Red Cap", icon: "🧢", svg: '<path d="M 35 25 L 65 25 L 50 5 Z" fill="#EF4444" stroke="#B91C1C" stroke-width="2"/>' },
  { id: 'glasses', level: 3, name: "Smart Glasses", icon: "👓", svg: '<path d="M 30 55 h 40" stroke="#1E293B" stroke-width="3"/><circle cx="35" cy="55" r="10" fill="none" stroke="#1E293B" stroke-width="3"/><circle cx="65" cy="55" r="10" fill="none" stroke="#1E293B" stroke-width="3"/>' },
  { id: 'bowtie', level: 4, name: "Pink Bowtie", icon: "🎀", svg: '<path d="M 50 82 L 35 72 L 35 92 Z" fill="#F472B6"/><path d="M 50 82 L 65 72 L 65 92 Z" fill="#F472B6"/><circle cx="50" cy="82" r="5" fill="#DB2777"/>' },
  { id: 'crown', level: 5, name: "Golden Crown", icon: "👑", svg: '<path d="M 30 25 L 30 5 L 40 15 L 50 0 L 60 15 L 70 5 L 70 25 Z" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>' },
  { id: 'wand', level: 6, name: "Magic Wand", icon: "🪄", svg: '<path d="M 10 40 L 25 55" stroke="#78350F" stroke-width="4" stroke-linecap="round"/><circle cx="10" cy="40" r="5" fill="#FCD34D"/>' },
  { id: 'cape', level: 7, name: "Hero Cape", icon: "🦸‍♂️", svg: '<path d="M 25 60 L 5 95 Q 25 105 45 95 Z" fill="#EF4444"/><path d="M 75 60 L 95 95 Q 75 105 55 95 Z" fill="#EF4444"/><circle cx="50" cy="65" r="5" fill="#FCD34D"/>' },
  { id: 'bandana', level: 8, name: "Ninja Bandana", icon: "🥷", svg: '<path d="M 15 45 Q 50 65 85 45 L 85 55 Q 50 75 15 55 Z" fill="#1E293B"/> <path d="M 80 50 L 95 65 L 90 70 L 75 55 Z" fill="#1E293B"/>' }
];
