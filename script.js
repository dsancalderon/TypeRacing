// Banco de palabras por idioma y dificultad
const WORDS = {
  es: {
    easy: [
      'sol','mar','luz','pan','red','rio','paz','gas','ley','voz',
      'fin','rey','pez','tez','cal','col','don','gem','haz','hoz',
      'hay','iba','ido','ion','ira','jar','job','ken','lab','lad',
      'gato','luna','casa','vida','pato','mesa','sopa','lago','tren','boca',
      'rosa','pelo','mano','amor','dado','beso','foto','jugo','lupa','rana',
      'foca','vela','roca','pico','cama','polo','taco','nota','bola','loco',
      'nube','copa','mapa','vara','palo','dedo','giro','nave','rata','silla'
    ],
    medium: [
      'ciudad','camino','bosque','planta','fuente','tiempo','cielo','flores','música','piedra',
      'tierra','blanco','grande','pueblo','pastel','verano','noche','puente','barco','cabeza',
      'jardín','parque','paloma','conejo','tigre','dragón','hierro','viento','lluvia','frente',
      'castillo','montaña','estudio','familia','trabajo','escuela','ventana','puerta','cocina','jardín',
      'caballo','pájaro','mariposa','historia','persona','colores','planeta','estrella','espacio','viaje'
    ],
    hard: [
      'experiencia','conocimiento','universidad','comunicación','desarrollo','oportunidad','información','tecnología','contribución','organización',
      'imaginación','responsabilidad','extraordinario','administración','investigación','transformación','representación','manifestación','apreciación','interpretación',
      'establecimiento','reconocimiento','comprensión','implementación','colaboración','adaptación','socialización','globalización','modernización','especialización'
    ]
  },
  en: {
    easy: [
      'cat','dog','sun','run','fun','hot','big','red','top','fly',
      'sky','car','map','cup','bat','hat','jam','key','lip','mix',
      'nap','oak','pig','row','six','tip','van','web','yak','zip',
      'boat','cake','dark','easy','fast','give','hand','into','jump','kind',
      'love','moon','nice','open','play','quiz','road','snow','talk','unit',
      'view','walk','xray','yard','zero','ball','cave','dusk','flap','grow'
    ],
    medium: [
      'planet','bridge','castle','flower','garden','jungle','knight','lemon','market','nature',
      'orange','purple','rabbit','silver','tigers','tunnel','valley','winter','yellow','zombie',
      'branch','clever','dinner','engine','flying','ground','handle','insect','jacket','kitten',
      'launch','mirror','narrow','outside','pencil','quietly','result','sunset','travel','useful',
      'vision','window','expert','farmer','gifted','harbor','inform','joyful','kitchen','living'
    ],
    hard: [
      'knowledge','beautiful','adventure','champion','discovery','elephant','fantastic','generous','happiness','important',
      'jellyfish','knowledge','laughter','marvelous','navigator','optimistic','permanent','qualified','remarkable','surprise',
      'technology','umbrella','vocabulary','wonderful','xylophone','yesterday','abundance','brilliant','challenge','dangerous',
      'education','framework','geography','hurricane','invisible','judgement','kaleidoscope','landscape','mechanism','nationwide'
    ]
  }
};

// ============================================================
// TYPERACE – Game Logic
// ============================================================

// ---- CAR CONFIGS ----
// hasImage = true → use img tag with src path
// hasImage = false → use inline SVG
const CAR_CONFIGS = [
  { id: 'amarillo', name: 'Amarillo', hasImage: true,  src: 'img/carros/carro_amarillo.png', color: { body: '#FBBF24', roof: '#D97706', accent: '#FDE68A' } },
  { id: 'azul',     name: 'Azul',     hasImage: true,  src: 'img/carros/carro_azul.png',     color: { body: '#3B82F6', roof: '#1D4ED8', accent: '#93C5FD' } },
  { id: 'rojo',     name: 'Rojo',     hasImage: true,  src: 'img/carros/carro_rojo.png',     color: { body: '#EF4444', roof: '#B91C1C', accent: '#FCA5A5' } },
  { id: 'morado',   name: 'Morado',   hasImage: true,  src: 'img/carros/carro_morado.png',   color: { body: '#A855F7', roof: '#7E22CE', accent: '#EDE9FE' } },
  { id: 'blanco',   name: 'Blanco',   hasImage: true,  src: 'img/carros/carro_blanco.png',   color: { body: '#F8FAFC', roof: '#E2E8F0', accent: '#CBD5E1' } },
];

// Bot colors (just uses the color data, no image needed for bots)
const BOT_COLORS = [
  { body: '#3B82F6', roof: '#1D4ED8', accent: '#93C5FD' },
  { body: '#EF4444', roof: '#B91C1C', accent: '#FCA5A5' },
  { body: '#22C55E', roof: '#15803D', accent: '#86EFAC' },
];

const BOT_SPEEDS = {
  easy:   { min: 1.5, max: 2.5, errorRate: 0.15 },
  medium: { min: 3.0, max: 4.5, errorRate: 0.07 },
  hard:   { min: 5.5, max: 7.5, errorRate: 0.02 }
};

// ---- TRACK CONFIG ----
// How many intermediate tiles between start and finish
// Each tile represents pista_intermedio.png
const TRACK_TILES = 6;         // <-- change this to make the track longer/shorter
const TILE_WIDTH_PX = 820;     // natural width of the track images
const TILE_HEIGHT_PX = 160;    // natural height of the track images

// ---- STATE ----
let gameState = {
  mode: 'solo',
  lang: 'es',
  diff: 'easy',
  players: [],
  raceStarted: false,
  raceFinished: false,
  startTime: null,
  timerInterval: null,
  localPlayerCount: 2,
  localPlayerNames: [],
  selectedCarId: null,
  trackPixelLength: 0,   // total width of the scrollable track in px
};

// ---- SCREEN MANAGEMENT ----
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  if (name === 'menu') generateStars('bg-stars');
  if (name === 'car-select') { generateStars('bg-stars-cars'); buildCarSelectScreen(); }
  if (name === 'lobby') { generateStars('bg-stars2'); setupLobby(); }
}

function generateStars(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < 80; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${Math.random()*3+1}px;height:${Math.random()*3+1}px;animation-delay:${Math.random()*3}s;animation-duration:${Math.random()*2+1.5}s`;
    el.appendChild(star);
  }
}

// ---- MENU SETUP ----
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    gameState.lang = btn.dataset.lang;
  });
});
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    gameState.diff = btn.dataset.diff;
  });
});

// ---- CAR SELECT SCREEN ----
function goToCarSelect() {
  const nameInput = document.getElementById('player-name');
  gameState.localPlayerNames = [nameInput ? nameInput.value.trim() || 'Tú' : 'Tú'];
  showScreen('car-select');
}

function buildCarSelectScreen() {
  const grid = document.getElementById('car-grid');
  grid.innerHTML = '';

  CAR_CONFIGS.forEach(car => {
    const card = document.createElement('div');
    card.className = 'car-card' + (gameState.selectedCarId === car.id ? ' selected' : '');
    card.dataset.carId = car.id;
    card.onclick = () => selectCar(car.id);

    const visual = car.hasImage
      ? `<img class="car-card-img" src="${car.src}" alt="${car.name}">`
      : `<div class="car-card-svg">${drawCarSVG(car.color, 70)}</div>`;

    card.innerHTML = `
      ${visual}
      <div class="car-card-name">${car.name}</div>
      <div class="car-card-tag">${car.id === gameState.selectedCarId ? 'SELECCIONADO' : 'Seleccionar'}</div>
    `;
    grid.appendChild(card);
  });

  updateCarSelectBtn();
}

function selectCar(carId) {
  gameState.selectedCarId = carId;
  // Update cards
  document.querySelectorAll('.car-card').forEach(card => {
    const isSelected = card.dataset.carId === carId;
    card.classList.toggle('selected', isSelected);
    const tag = card.querySelector('.car-card-tag');
    if (tag) tag.textContent = isSelected ? 'SELECCIONADO' : 'Seleccionar';
  });
  updateCarSelectBtn();
}

function updateCarSelectBtn() {
  const btn = document.getElementById('btn-start-race');
  if (btn) btn.disabled = !gameState.selectedCarId;
}

function startSoloWithCar() {
  if (!gameState.selectedCarId) return;
  gameState.mode = 'solo';
  initRace('solo');
}

// ---- LOBBY ----
function showMultiLocal() {
  gameState.mode = 'multi-local';
  showScreen('lobby');
}

function setupLobby() {
  const count = gameState.localPlayerCount;
  const container = document.getElementById('local-name-inputs');
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const c = BOT_COLORS[i] || { body: '#94A3B8' };
    const wrap = document.createElement('div');
    wrap.className = 'local-name-row';
    wrap.innerHTML = `
      <span class="car-dot" style="background:${c.body}"></span>
      <input type="text" class="name-input small" placeholder="Jugador ${i+1}" maxlength="12" value="${gameState.localPlayerNames[i]||''}">
    `;
    container.appendChild(wrap);
  }
  renderLobbyPlayers();
}

function renderLobbyPlayers() {
  const container = document.getElementById('lobby-players');
  container.innerHTML = '';
  for (let i = 0; i < gameState.localPlayerCount; i++) {
    const c = BOT_COLORS[i] || { body: '#94A3B8', roof: '#64748B', accent: '#CBD5E1' };
    const card = document.createElement('div');
    card.className = 'lobby-player-card';
    card.innerHTML = `
      <div class="lobby-car-preview">${drawCarSVG(c, 60)}</div>
      <div class="lobby-player-name">${c.body}</div>
    `;
    container.appendChild(card);
  }
}

document.querySelectorAll('.count-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    gameState.localPlayerCount = parseInt(btn.dataset.count);
    setupLobby();
  });
});

function startMultiLocal() {
  const inputs = document.querySelectorAll('#local-name-inputs .name-input');
  gameState.localPlayerNames = [];
  inputs.forEach((inp, i) => {
    gameState.localPlayerNames.push(inp.value.trim() || `Jugador ${i+1}`);
  });
  // For multi-local, no car select yet — just use SVG colors
  gameState.selectedCarId = null;
  initRace('multi-local');
}

// ---- INIT RACE ----
function initRace(mode) {
  gameState.mode = mode;
  gameState.raceStarted = false;
  gameState.raceFinished = false;
  gameState.players = [];
  finishRank = 0;

  const wordPool = getWordPool();

  if (mode === 'solo') {
    // Player 0 = human with chosen car
    const chosenCar = CAR_CONFIGS.find(c => c.id === gameState.selectedCarId) || CAR_CONFIGS[0];
    gameState.players.push(createHumanPlayer(gameState.localPlayerNames[0] || 'Tú', 0, wordPool, chosenCar));

    // 3 bots — each gets a different color, avoid chosen car color if possible
    const botCarConfigs = CAR_CONFIGS.filter(c => c.id !== gameState.selectedCarId);
    const botNames = ['🤖 Bot Fácil', '🤖 Bot Medio', '🤖 Bot Difícil'];
    const botDiffs = ['easy', 'medium', 'hard'];
    for (let i = 0; i < 3; i++) {
      const botCar = botCarConfigs[i] || CAR_CONFIGS[(i + 1) % CAR_CONFIGS.length];
      gameState.players.push(createBotPlayer(botNames[i], i + 1, botDiffs[i], wordPool, botCar));
    }
  } else {
    // Multi local: all humans
    for (let i = 0; i < gameState.localPlayerCount; i++) {
      const car = CAR_CONFIGS[i % CAR_CONFIGS.length];
      gameState.players.push(createHumanPlayer(gameState.localPlayerNames[i] || `P${i+1}`, i, wordPool, car));
    }
  }

  buildRaceScreen();
  showScreen('race');
  startCountdown();
}

function getWordPool() {
  const pool = [...WORDS[gameState.lang][gameState.diff]];
  shuffle(pool);
  return pool;
}

// ---- PLAYER FACTORIES ----
function createHumanPlayer(name, idx, wordPool, carConfig) {
  return {
    id: idx,
    name,
    isBot: false,
    carConfig,
    color: carConfig.color,
    progress: 0,
    wordPool: [...wordPool],
    currentWordIdx: 0,
    currentLetterIdx: 0,
    errors: 0,
    totalLetters: 0,
    wordsCompleted: 0,
    finished: false,
    finishTime: null,
    finalRank: null,
    keyInput: null,
    carEl: null,
    progressBarEl: null,
    shakeTimeout: null,
  };
}

function createBotPlayer(name, idx, diff, wordPool, carConfig) {
  const sp = BOT_SPEEDS[diff];
  const speed = sp.min + Math.random() * (sp.max - sp.min);
  return {
    id: idx,
    name,
    isBot: true,
    botDiff: diff,
    botSpeed: speed,
    botErrorRate: sp.errorRate,
    botNextTick: 0,
    carConfig,
    color: carConfig.color,
    progress: 0,
    wordPool: [...wordPool],
    currentWordIdx: 0,
    currentLetterIdx: 0,
    errors: 0,
    totalLetters: 0,
    wordsCompleted: 0,
    finished: false,
    finishTime: null,
    finalRank: null,
    carEl: null,
    progressBarEl: null,
    shakeTimeout: null,
  };
}

// ---- BUILD RACE SCREEN ----
const ADVANCE = 8;
const RETREAT = 3;
const TRACK_LENGTH = 1000; // logical units (progress 0→1 maps to this)

function buildRaceScreen() {
  // -- Progress bars (HUD) --
  const pbContainer = document.getElementById('progress-bars');
  pbContainer.innerHTML = '';
  gameState.players.forEach(p => {
    const row = document.createElement('div');
    row.className = 'pb-row';
    row.innerHTML = `
      <span class="pb-name" style="color:${p.color.body}">${p.name}</span>
      <div class="pb-track"><div class="pb-fill" style="background:${p.color.body}" id="pb-${p.id}"></div></div>
      <span class="pb-pct" id="pct-${p.id}">0%</span>
    `;
    pbContainer.appendChild(row);
    p.progressBarEl = document.getElementById('pb-' + p.id);
  });

  // -- Build scrollable track --
  const trackScroll = document.getElementById('track-scroll');
  trackScroll.innerHTML = '';

  // Total tiles: 1 start + TRACK_TILES mid + 1 end
  const totalTiles = 1 + TRACK_TILES + 1;
  gameState.trackPixelLength = totalTiles * TILE_WIDTH_PX;

  // Start tile
  const startTile = document.createElement('div');
  startTile.className = 'track-tile tile-start';
  startTile.style.width = TILE_WIDTH_PX + 'px';
  trackScroll.appendChild(startTile);

  // Mid tiles
  for (let i = 0; i < TRACK_TILES; i++) {
    const midTile = document.createElement('div');
    midTile.className = 'track-tile tile-mid';
    midTile.style.width = TILE_WIDTH_PX + 'px';
    trackScroll.appendChild(midTile);
  }

  // End tile
  const endTile = document.createElement('div');
  endTile.className = 'track-tile tile-end';
  endTile.style.width = TILE_WIDTH_PX + 'px';
  trackScroll.appendChild(endTile);

  // -- Cars layer (fixed on screen, positioned by JS) --
  let carsLayer = document.getElementById('cars-layer');
  if (!carsLayer) {
    carsLayer = document.createElement('div');
    carsLayer.id = 'cars-layer';
    carsLayer.className = 'cars-layer';
    const wrapper = document.querySelector('.track-wrapper');
    if (wrapper) wrapper.appendChild(carsLayer);
  }
  carsLayer.innerHTML = '';

  const numPlayers = gameState.players.length;
  gameState.players.forEach((p, i) => {
    const lane = document.createElement('div');
    lane.className = 'car-lane';
    lane.id = 'car-' + p.id;
    // Divide track height evenly per lane
    const laneH = 100 / numPlayers;
    lane.style.top = `${i * laneH}%`;
    lane.style.height = `${laneH}%`;

    // Use image if available, else SVG
    if (p.carConfig && p.carConfig.hasImage) {
      lane.innerHTML = `<img src="${p.carConfig.src}" alt="${p.carConfig.name}" width="52">`;
    } else {
      lane.innerHTML = drawCarSVG(p.color, 52);
    }

    carsLayer.appendChild(lane);
    p.carEl = lane;
  });

  // Position track and cars immediately
  setTimeout(scrollTrackToPlayer, 0);

  // -- Typing zones --
  const typingZone = document.getElementById('typing-zone');
  const otherPlayersWords = document.getElementById('other-players-words');
  const humanPlayers = gameState.players.filter(p => !p.isBot);

  if (gameState.mode === 'solo') {
    document.getElementById('current-word-display').innerHTML = '';
    document.getElementById('typing-input').value = '';
    document.getElementById('typing-input').disabled = false;
    document.getElementById('word-count').textContent = '0';
    humanPlayers[0].keyInput = document.getElementById('typing-input');
    otherPlayersWords.innerHTML = '';
    otherPlayersWords.style.display = 'none';
    typingZone.querySelector('.typing-inner').style.display = 'flex';
  } else {
    typingZone.querySelector('.typing-inner').style.display = 'none';
    otherPlayersWords.style.display = 'flex';
    otherPlayersWords.innerHTML = '';
    humanPlayers.forEach(p => {
      const wrap = document.createElement('div');
      wrap.className = 'multi-typing-panel';
      wrap.style.borderColor = p.color.body;
      wrap.innerHTML = `
        <div class="mtp-name" style="color:${p.color.body}">${p.name}</div>
        <div class="mtp-word" id="mtp-word-${p.id}"></div>
        <input type="text" class="mtp-input" id="mtp-input-${p.id}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Escribe...">
        <div class="mtp-stats">WPM: <span id="mtp-wpm-${p.id}">0</span></div>
      `;
      otherPlayersWords.appendChild(wrap);
      p.keyInput = wrap.querySelector('input');
    });
  }
}

// ---- COUNTDOWN ----
function startCountdown() {
  const wrapper = document.querySelector('.track-wrapper');
  let count = 3;

  const overlay = document.createElement('div');
  overlay.className = 'countdown-overlay';
  overlay.id = 'countdown-overlay';
  overlay.textContent = count;
  wrapper.appendChild(overlay);

  gameState.players.filter(p => !p.isBot).forEach(p => {
    if (p.keyInput) p.keyInput.disabled = true;
  });

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      overlay.textContent = count;
      overlay.classList.add('pop');
      setTimeout(() => overlay.classList.remove('pop'), 300);
    } else {
      overlay.textContent = '¡GO!';
      overlay.style.color = '#22C55E';
      overlay.classList.add('pop');
      setTimeout(() => {
        overlay.remove();
        clearInterval(interval);
        beginRace();
      }, 700);
    }
  }, 1000);
}

// ---- BEGIN RACE ----
function beginRace() {
  gameState.raceStarted = true;
  gameState.startTime = Date.now();

  gameState.players.filter(p => !p.isBot).forEach(p => {
    renderWordForPlayer(p);
    if (p.keyInput) {
      p.keyInput.disabled = false;
      p.keyInput.focus();
      p.keyInput.addEventListener('input', (e) => onTypingInput(e, p));
    }
  });

  gameState.timerInterval = setInterval(updateTimer, 1000);
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

// ---- TYPING INPUT ----
function onTypingInput(e, player) {
  if (!gameState.raceStarted || player.finished) return;

  const input = e.target;
  const typed = input.value;
  const word = player.wordPool[player.currentWordIdx];

  if (typed.length === 0) return;

  const lastChar = typed[typed.length - 1];
  const expectedChar = word[player.currentLetterIdx];

  player.totalLetters++;

  if (lastChar === expectedChar) {
    player.currentLetterIdx++;
    player.progress = Math.min(1, player.progress + ADVANCE / TRACK_LENGTH);
    input.value = typed.slice(0, player.currentLetterIdx);
  } else {
    player.errors++;
    player.progress = Math.max(0, player.progress - RETREAT / TRACK_LENGTH);
    shakeCar(player);
    input.value = typed.slice(0, player.currentLetterIdx);
  }

  if (player.currentLetterIdx >= word.length) {
    player.wordsCompleted++;
    player.currentWordIdx = (player.currentWordIdx + 1) % player.wordPool.length;
    player.currentLetterIdx = 0;
    input.value = '';
    renderWordForPlayer(player);
    popWordEffect(player);
  } else {
    renderWordForPlayer(player);
  }

  updateCarPosition(player);
  updateHUD(player);
  checkFinish(player);
}

// ---- WORD RENDERING ----
function renderWordForPlayer(player) {
  const word = player.wordPool[player.currentWordIdx];
  let html = '';
  for (let i = 0; i < word.length; i++) {
    if (i < player.currentLetterIdx) {
      html += `<span class="letter correct">${word[i]}</span>`;
    } else if (i === player.currentLetterIdx) {
      html += `<span class="letter current">${word[i]}</span>`;
    } else {
      html += `<span class="letter pending">${word[i]}</span>`;
    }
  }

  if (gameState.mode === 'solo') {
    document.getElementById('current-word-display').innerHTML = html;
    document.getElementById('word-count').textContent = player.wordsCompleted;
  } else {
    const el = document.getElementById('mtp-word-' + player.id);
    if (el) el.innerHTML = html;
  }
}

// ---- GAME LOOP (BOTS + SCROLL) ----
let lastTime = 0;
function gameLoop(timestamp) {
  if (!gameState.raceStarted || gameState.raceFinished) return;

  const dt = timestamp - lastTime;
  lastTime = timestamp;

  // Bots
  gameState.players.filter(p => p.isBot && !p.finished).forEach(bot => {
    bot.botNextTick -= dt;
    if (bot.botNextTick <= 0) {
      const word = bot.wordPool[bot.currentWordIdx];
      const variation = (Math.random() - 0.5) * 0.3;
      bot.botNextTick = 1000 / (bot.botSpeed + variation);

      const isError = Math.random() < bot.botErrorRate;
      if (isError) {
        bot.errors++;
        bot.totalLetters++;
        bot.progress = Math.max(0, bot.progress - RETREAT / TRACK_LENGTH);
        shakeCar(bot);
      } else {
        bot.currentLetterIdx++;
        bot.totalLetters++;
        bot.progress = Math.min(1, bot.progress + ADVANCE / TRACK_LENGTH);
        if (bot.currentLetterIdx >= word.length) {
          bot.wordsCompleted++;
          bot.currentWordIdx = (bot.currentWordIdx + 1) % bot.wordPool.length;
          bot.currentLetterIdx = 0;
        }
      }

      updateCarPosition(bot);
      checkFinish(bot);
    }
  });

  // Scroll track behind the player car (always centered on human player 0)
  scrollTrackToPlayer();
  updatePositions();
  requestAnimationFrame(gameLoop);
}

// ---- TRACK SCROLL ----
// The track scrolls so the human car appears at ~25% from the left edge
const CAR_SCREEN_X_RATIO = 0.25;  // car appears at 25% of the track-wrapper width

function scrollTrackToPlayer() {
  const humanPlayer = gameState.players.find(p => !p.isBot);
  if (!humanPlayer) return;

  const wrapper = document.querySelector('.track-wrapper');
  const wrapperW = wrapper ? wrapper.offsetWidth : window.innerWidth;

  // Convert progress (0-1) to pixel position on the full track
  const carTrackPx = humanPlayer.progress * gameState.trackPixelLength;

  // The offset we need to shift the strip so car appears at CAR_SCREEN_X_RATIO
  const targetOffsetX = carTrackPx - wrapperW * CAR_SCREEN_X_RATIO;
  const clampedOffset = Math.max(0, Math.min(targetOffsetX, gameState.trackPixelLength - wrapperW));

  const trackScroll = document.getElementById('track-scroll');
  if (trackScroll) {
    trackScroll.style.transform = `translateX(-${clampedOffset}px)`;
  }

  // All car elements are in the fixed carsLayer.
  // Their left = their own track px position - current scroll offset
  gameState.players.forEach(p => {
    if (!p.carEl) return;
    const pxOnTrack = p.progress * gameState.trackPixelLength;
    const screenX = pxOnTrack - clampedOffset;
    p.carEl.style.left = Math.round(screenX) + 'px';
  });
}

// ---- CAR POSITION ----
function updateCarPosition(player) {
  // Progress bar update
  if (player.progressBarEl) {
    player.progressBarEl.style.width = (player.progress * 100) + '%';
    const pct = document.getElementById('pct-' + player.id);
    if (pct) pct.textContent = Math.round(player.progress * 100) + '%';
  }

  // Speed flame
  if (player.progress > 0.05) {
    player.carEl && player.carEl.classList.add('fast');
  }
}

function shakeCar(player) {
  if (!player.carEl) return;
  player.carEl.classList.remove('shake');
  void player.carEl.offsetWidth;
  player.carEl.classList.add('shake');
  clearTimeout(player.shakeTimeout);
  player.shakeTimeout = setTimeout(() => player.carEl && player.carEl.classList.remove('shake'), 400);
}

// ---- HUD ----
function updateHUD(player) {
  if (gameState.mode === 'solo' && player.id === 0) {
    const elapsed = (Date.now() - gameState.startTime) / 60000;
    const wpm = elapsed > 0 ? Math.round(player.wordsCompleted / elapsed) : 0;
    const acc = player.totalLetters > 0 ? Math.round(((player.totalLetters - player.errors) / player.totalLetters) * 100) : 100;
    document.getElementById('hud-wpm').textContent = wpm;
    document.getElementById('hud-acc').textContent = acc;
  } else if (gameState.mode === 'multi-local') {
    const elapsed = (Date.now() - gameState.startTime) / 60000;
    const wpm = elapsed > 0 ? Math.round(player.wordsCompleted / elapsed) : 0;
    const el = document.getElementById('mtp-wpm-' + player.id);
    if (el) el.textContent = wpm;
  }
}

function updateTimer() {
  if (!gameState.startTime) return;
  const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
  const min = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const sec = String(elapsed % 60).padStart(2, '0');
  document.getElementById('hud-timer').textContent = `${min}:${sec}`;
}

function updatePositions() {
  const sorted = [...gameState.players].sort((a, b) => b.progress - a.progress);
  const humanPlayer = gameState.players.find(p => !p.isBot);
  if (!humanPlayer) return;
  const myRank = sorted.findIndex(p => p.id === humanPlayer.id) + 1;
  document.getElementById('hud-position').textContent = `POS ${myRank}/${gameState.players.length}`;
}

// ---- FINISH ----
let finishRank = 0;
function checkFinish(player) {
  if (player.finished || player.progress < 1) return;
  player.finished = true;
  player.finishTime = Date.now() - gameState.startTime;
  finishRank++;
  player.finalRank = finishRank;

  if (player.carEl) player.carEl.classList.add('finished');

  const allFinished = gameState.players.every(p => p.finished);
  const humansDone = gameState.players.filter(p => !p.isBot).every(p => p.finished);

  if (allFinished || (humansDone && finishRank >= gameState.players.length - 1)) {
    setTimeout(endRace, 1500);
  }

  if (finishRank === 1 && !player.isBot) showWinBanner();
}

function showWinBanner() {
  const wrapper = document.querySelector('.track-wrapper');
  const banner = document.createElement('div');
  banner.className = 'win-banner';
  banner.textContent = '🏆 ¡GANASTE!';
  wrapper.appendChild(banner);
  setTimeout(() => banner.remove(), 2000);
}

function endRace() {
  if (gameState.raceFinished) return;
  gameState.raceFinished = true;
  clearInterval(gameState.timerInterval);

  const unfinished = gameState.players.filter(p => !p.finished).sort((a, b) => b.progress - a.progress);
  unfinished.forEach(p => {
    finishRank++;
    p.finalRank = finishRank;
    p.finishTime = Date.now() - gameState.startTime;
  });

  setTimeout(showResults, 800);
}

// ---- RESULTS ----
function showResults() {
  const sorted = [...gameState.players].sort((a, b) => a.finalRank - b.finalRank);
  const elapsed = (Date.now() - gameState.startTime - 800) / 60000;

  const podium = document.getElementById('podium');
  podium.innerHTML = '';
  const medals = ['🥇', '🥈', '🥉', '4️⃣'];
  const heights = ['120px', '90px', '70px', '50px'];

  sorted.forEach((p, i) => {
    const block = document.createElement('div');
    block.className = 'podium-block';
    block.style.animationDelay = `${i * 0.2}s`;
    const wpm = elapsed > 0 ? Math.round(p.wordsCompleted / elapsed) : 0;

    const carVisual = (p.carConfig && p.carConfig.hasImage)
      ? `<img src="${p.carConfig.src}" width="44" alt="${p.carConfig.name}">`
      : drawCarSVG(p.color, 44);

    block.innerHTML = `
      <div class="podium-car">${carVisual}</div>
      <div class="podium-medal">${medals[i]}</div>
      <div class="podium-name">${p.name}</div>
      <div class="podium-bar" style="height:${heights[i]};background:${p.color.body}">
        <span class="podium-rank">${i+1}°</span>
      </div>
    `;
    podium.appendChild(block);
  });

  const statsGrid = document.getElementById('stats-grid');
  statsGrid.innerHTML = '';
  sorted.forEach(p => {
    const wpm = elapsed > 0 ? Math.round(p.wordsCompleted / elapsed) : 0;
    const acc = p.totalLetters > 0 ? Math.round(((p.totalLetters - p.errors) / p.totalLetters) * 100) : 100;
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.style.borderColor = p.color.body;
    card.innerHTML = `
      <div class="stat-player-name" style="color:${p.color.body}">${p.name}</div>
      <div class="stat-row"><span>WPM</span><strong>${wpm}</strong></div>
      <div class="stat-row"><span>Precisión</span><strong>${acc}%</strong></div>
      <div class="stat-row"><span>Palabras</span><strong>${p.wordsCompleted}</strong></div>
      <div class="stat-row"><span>Tiempo</span><strong>${formatTime(p.finishTime)}</strong></div>
    `;
    statsGrid.appendChild(card);
  });

  showScreen('results');
  launchConfetti();
}

function formatTime(ms) {
  if (!ms) return '--';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
}

// ---- CONFETTI ----
function launchConfetti() {
  const container = document.getElementById('confetti');
  container.innerHTML = '';
  const colors = ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#C77DFF','#FF9F43'];
  for (let i = 0; i < 120; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      width:${6+Math.random()*8}px;
      height:${6+Math.random()*8}px;
      border-radius:${Math.random()>0.5?'50%':'2px'};
      animation-delay:${Math.random()*2}s;
      animation-duration:${2+Math.random()*2}s;
    `;
    container.appendChild(piece);
  }
}

// ---- WORD POP EFFECT ----
function popWordEffect(player) {
  const el = gameState.mode === 'solo'
    ? document.getElementById('current-word-display')
    : document.getElementById('mtp-word-' + player.id);
  if (!el) return;
  el.classList.remove('word-pop');
  void el.offsetWidth;
  el.classList.add('word-pop');
}

// ---- CAR SVG (fallback for color-only cars) ----
function drawCarSVG(color, size) {
  const w = size;
  const h = size * 1.7;
  return `<svg width="${w}" height="${h}" viewBox="0 0 40 68" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="64" rx="16" ry="4" fill="rgba(0,0,0,0.25)"/>
    <rect x="2" y="10" width="8" height="12" rx="3" fill="#1a1a2e"/>
    <rect x="30" y="10" width="8" height="12" rx="3" fill="#1a1a2e"/>
    <rect x="2" y="44" width="8" height="12" rx="3" fill="#1a1a2e"/>
    <rect x="30" y="44" width="8" height="12" rx="3" fill="#1a1a2e"/>
    <rect x="4" y="12" width="4" height="4" rx="2" fill="#555"/>
    <rect x="32" y="12" width="4" height="4" rx="2" fill="#555"/>
    <rect x="4" y="46" width="4" height="4" rx="2" fill="#555"/>
    <rect x="32" y="46" width="4" height="4" rx="2" fill="#555"/>
    <rect x="8" y="6" width="24" height="56" rx="8" fill="${color.body}"/>
    <rect x="11" y="18" width="18" height="20" rx="5" fill="${color.roof}"/>
    <rect x="13" y="19" width="14" height="10" rx="3" fill="#a8d8f0" opacity="0.9"/>
    <rect x="13" y="32" width="14" height="6" rx="2" fill="#a8d8f0" opacity="0.7"/>
    <rect x="10" y="7" width="6" height="4" rx="2" fill="#FEFCE8"/>
    <rect x="24" y="7" width="6" height="4" rx="2" fill="#FEFCE8"/>
    <rect x="10" y="56" width="6" height="4" rx="2" fill="#EF4444"/>
    <rect x="24" y="56" width="6" height="4" rx="2" fill="#EF4444"/>
    <rect x="18" y="8" width="4" height="52" rx="2" fill="${color.accent}" opacity="0.5"/>
    <circle cx="20" cy="10" r="2" fill="${color.accent}"/>
  </svg>`;
}

// ---- UTILS ----
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---- INIT ----
window.addEventListener('load', () => {
  generateStars('bg-stars');
});