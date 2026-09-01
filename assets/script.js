// ============================================================
// UTIL
// ============================================================
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const NAME = (window.siteConfig && siteConfig.personName) || "Lilin";

document.addEventListener('DOMContentLoaded', () => {
  $$('.name-fill').forEach(el => el.textContent = NAME);
  document.title = `Untuk ${NAME} 🌸`;
});

// ============================================================
// FLOATING PETALS (ambient canvas)
// ============================================================
(function petals(){
  const canvas = $('#petal-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, petalsArr = [];

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = reducedMotion ? 0 : (window.innerWidth < 640 ? 10 : 18);

  function makePetal(){
    return {
      x: Math.random() * w,
      y: Math.random() * -h,
      size: 6 + Math.random() * 8,
      speedY: 0.35 + Math.random() * 0.5,
      speedX: Math.sin(Math.random() * Math.PI),
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 1.2,
      sway: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.5 ? '#f0bdc9' : '#fad9c4',
    };
  }
  for(let i=0;i<COUNT;i++) petalsArr.push(makePetal());

  function drawPetal(p){
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot * Math.PI/180);
    ctx.fillStyle = p.hue;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size*0.6, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function tick(){
    ctx.clearRect(0,0,w,h);
    petalsArr.forEach(p => {
      p.y += p.speedY;
      p.sway += 0.02;
      p.x += Math.sin(p.sway) * 0.6;
      p.rot += p.rotSpeed;
      if(p.y > h + 20){ Object.assign(p, makePetal(), {y: -20}); }
      drawPetal(p);
    });
    requestAnimationFrame(tick);
  }
  if(!reducedMotion) tick();
})();

// ============================================================
// SCROLL REVEAL
// ============================================================
(function scrollReveal(){
  const items = $$('.reveal-up');
  if(!('IntersectionObserver' in window) || reducedMotion){
    items.forEach(el => el.classList.add('shown'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('shown');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  items.forEach(el => io.observe(el));
})();

// ============================================================
// HERO SEQUENTIAL REVEAL
// ============================================================
(function heroReveal(){
  const lines = $$('.reveal-line');
  lines.forEach(line => {
    const delay = parseInt(line.dataset.delay || 0, 10);
    setTimeout(() => line.classList.add('shown'), reducedMotion ? 0 : 500 + delay * 550);
  });
})();

$('#hero-go')?.addEventListener('click', () => {
  $('#ch1').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
});
$('#hero-curious')?.addEventListener('click', () => {
  $('#hero-curious-response').textContent = 'Hehe. Kamu akan tahu pelan-pelan. Ayo mulai jelajahi.';
});

// ============================================================
// MUSIC SYSTEM — controls the <audio> in HTML
// ============================================================
var bgAudio = document.getElementById('bg-audio');

(function initMusic(){
  var cfg = (window.siteConfig && siteConfig.music) || {};
  if(!bgAudio) return;

  bgAudio.volume = 0.6;
  bgAudio.loop = !!cfg;

  $('#music-player').hidden = false;
  $('#mp-title').textContent = cfg.title || 'Sebuah Lagu Untukmu';
  $('#mp-artist').textContent = cfg.artist || '';

  bgAudio.addEventListener('play', function(){ $('#mp-toggle').textContent = '⏸'; });
  bgAudio.addEventListener('pause', function(){ $('#mp-toggle').textContent = '▶'; });
  bgAudio.addEventListener('ended', function(){ $('#mp-toggle').textContent = '▶'; });
  bgAudio.addEventListener('error', function(){
    $('#mp-title').textContent = 'File tidak ditemukan';
    $('#mp-artist').textContent = 'assets/musik.mp3';
  });
})();

function musicPlay(){
  if(!bgAudio) return;
  bgAudio.play().catch(function(){});
}
function musicPause(){ if(bgAudio) bgAudio.pause(); }
function musicToggle(){ if(!bgAudio) return; if(bgAudio.paused) musicPlay(); else musicPause(); }
function musicVolume(v){ if(bgAudio) bgAudio.volume = Number(v)/100; }
function musicMute(){ if(bgAudio){ bgAudio.muted=true; $('#mp-mute').textContent='🔇'; } }
function musicUnmute(){ if(bgAudio){ bgAudio.muted=false; $('#mp-mute').textContent='🔊'; } }
function musicHasSong(){ return !!bgAudio; }

const MusicSystem = {
  init: function(){},
  play: musicPlay,
  pause: musicPause,
  toggle: musicToggle,
  setVolume: musicVolume,
  mute: musicMute,
  unmute: musicUnmute,
  hasMusic: musicHasSong,
  isReady: function(){ return !!bgAudio; }
};

$('#gate-yes')?.addEventListener('click', () => {
  $('#gate-response').textContent = "Okay... let's begin.";
  if(MusicSystem.hasMusic()) {
    MusicSystem.play();
  }
  setTimeout(closeGate, 900);
});
$('#gate-no')?.addEventListener('click', () => {
  $('#gate-response').textContent = 'Tidak apa-apa. Musiknya akan tetap di sini.';
  setTimeout(closeGate, 900);
});
function closeGate(){
  $('#music-gate').classList.add('hidden-gate');
  setTimeout(() => { $('#music-gate').style.display = 'none'; }, 900);
}

$('#mp-toggle')?.addEventListener('click', () => MusicSystem.toggle());
let muted = false;
$('#mp-mute')?.addEventListener('click', () => {
  muted = !muted;
  if(muted) MusicSystem.mute(); else MusicSystem.unmute();
});
$('#mp-volume')?.addEventListener('input', (e) => MusicSystem.setVolume(e.target.value));

// ============================================================
// CHAPTER 2 — EASTER EGGS
// ============================================================
(function teddyEgg(){
  const img = $('#teddy-egg-img');
  const resp = $('#teddy-egg-response');
  const msgs = [
    'psst... aku boleh membocorkan sesuatu?',
    'yang membuat website ini kelihatannya cukup serius saat membuatnya. padahal, dia mungkin lebih gugup daripada yang kamu kira. jangan bilang siapa-siapa.',
    'oops. sepertinya aku terlalu banyak bicara.',
  ];
  let count = 0;
  img?.addEventListener('click', () => {
    resp.textContent = msgs[Math.min(count, msgs.length - 1)];
    count++;
  });
})();

$('#flower-btn')?.addEventListener('click', () => {
  const resp = $('#flower-egg-response');
  resp.textContent = 'Some flowers bloom quietly. Begitu juga beberapa perasaan.';
  setTimeout(() => { resp.textContent = 'Eh. Sudah. Lupakan kalimat terakhir. 😳'; }, 1800);
});

(function movingButton(){
  const btn = $('#moving-btn');
  const resp = $('#moving-btn-response');
  if(!btn) return;
  const taunts = ['Hehe.', 'Belum bisa.', 'Kamu penasaran banget, ya?', 'Yakin mau terus mencoba?', 'Baiklah... kamu menang.'];
  let tries = 0;
  const MAX_DODGE = 4;

  function dodge(){
    const wrap = btn.parentElement.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const maxX = Math.max(0, wrap.width - btnRect.width);
    const maxY = Math.max(0, wrap.height - btnRect.height);
    const x = Math.random() * maxX - (btnRect.left - wrap.left);
    const y = Math.random() * maxY - (btnRect.top - wrap.top);
    btn.style.transform = `translate(${x}px, ${y}px)`;
  }

  function handleAttempt(e){
    if(tries < MAX_DODGE){
      e.preventDefault();
      resp.textContent = taunts[Math.min(tries, taunts.length - 1)];
      tries++;
      if(!reducedMotion) dodge();
      if(tries === MAX_DODGE){
        btn.textContent = 'Baiklah, coba lagi.';
      }
    } else {
      resp.textContent = 'Aku sudah menduganya. Kamu ternyata cukup gigih. Entah kenapa, aku suka orang yang tidak mudah menyerah.';
      btn.style.transform = 'none';
    }
  }

  btn.addEventListener('mouseenter', () => { if(tries < MAX_DODGE) handleAttempt({ preventDefault(){} }); });
  btn.addEventListener('click', handleAttempt);
})();

// ============================================================
// CHAPTER 2 — PETAL CATCH GAME
// ============================================================
(function petalGame(){
  const field = $('#petal-field');
  const scoreEl = $('#petal-score');
  const msgEl = $('#petal-game-message');
  const restartBtn = $('#petal-restart');
  if(!field) return;

  const WIN_SCORE = 10;
  const emojis = ['🌸', '🌺', '🌷'];
  let score = 0, spawnTimer = null, finished = false;

  function spawnPetal(){
    if(finished) return;
    const petal = document.createElement('button');
    petal.className = 'falling-petal';
    petal.type = 'button';
    petal.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    petal.setAttribute('aria-label', 'Tangkap kelopak');
    const fieldWidth = field.clientWidth || 300;
    petal.style.left = `${Math.random() * Math.max(0, fieldWidth - 34)}px`;

    if(reducedMotion){
      petal.style.top = `${Math.random() * 180}px`;
      const timeout = setTimeout(() => petal.remove(), 3200);
      petal.addEventListener('click', () => { clearTimeout(timeout); catchPetal(petal); });
    } else {
      const duration = (3 + Math.random() * 2).toFixed(2);
      petal.style.animation = `fall ${duration}s linear forwards`;
      petal.addEventListener('animationend', () => petal.remove());
      petal.addEventListener('click', () => catchPetal(petal));
    }
    field.appendChild(petal);
  }

  function catchPetal(petal){
    if(finished) return;
    score++;
    scoreEl.textContent = score;
    petal.remove();
    if(score >= WIN_SCORE) finishGame();
  }

  function finishGame(){
    finished = true;
    clearInterval(spawnTimer);
    $$('.falling-petal', field).forEach(p => p.remove());
    msgEl.textContent = 'Kamu menangkap semuanya. Mungkin kamu memang cukup cekatan — atau cukup sabar menunggu waktu yang tepat untuk meraih sesuatu.';
  }

  function startGame(){
    finished = false;
    score = 0;
    scoreEl.textContent = '0';
    msgEl.textContent = '';
    $$('.falling-petal', field).forEach(p => p.remove());
    clearInterval(spawnTimer);
    spawnTimer = setInterval(spawnPetal, 800);
  }

  restartBtn?.addEventListener('click', startGame);

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting && !spawnTimer){ startGame(); io.disconnect(); }
    });
  }, { threshold: 0.3 });
  io.observe(field);
})();

// ============================================================
// CHAPTER 2 — MEMORY MATCH GAME
// ============================================================
(function memoryGame(){
  const grid = $('#memory-grid');
  const msg = $('#memory-message');
  const restartBtn = $('#memory-restart');
  if(!grid) return;

  const icons = ['🌸', '🧸', '⭐', '🌙', '✉️', '🍡'];
  let flipped = [], matchedCount = 0, lock = false;

  function shuffle(arr){
    for(let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function build(){
    grid.innerHTML = '';
    flipped = []; matchedCount = 0; lock = false; msg.textContent = '';
    const cards = shuffle([...icons, ...icons]);
    cards.forEach(icon => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'memory-card';
      btn.dataset.icon = icon;
      btn.textContent = '❀';
      btn.setAttribute('aria-label', 'Kartu tertutup');
      btn.addEventListener('click', () => flipCard(btn));
      grid.appendChild(btn);
    });
  }

  function flipCard(btn){
    if(lock || btn.classList.contains('flipped') || btn.classList.contains('matched')) return;
    btn.classList.add('flipped');
    btn.textContent = btn.dataset.icon;
    flipped.push(btn);

    if(flipped.length === 2){
      lock = true;
      const [a, b] = flipped;
      if(a.dataset.icon === b.dataset.icon){
        a.classList.add('matched'); b.classList.add('matched');
        matchedCount++;
        flipped = [];
        lock = false;
        if(matchedCount === icons.length){
          msg.textContent = 'Kamu menemukan semua pasangannya. Ternyata kamu memang cukup teliti untuk hal-hal kecil.';
        }
      } else {
        setTimeout(() => {
          a.classList.remove('flipped'); a.textContent = '❀';
          b.classList.remove('flipped'); b.textContent = '❀';
          flipped = [];
          lock = false;
        }, 700);
      }
    }
  }

  restartBtn?.addEventListener('click', build);
  build();
})();

// ============================================================
// CHAPTER 3 — HIDDEN QUOTES
// ============================================================
(function hiddenQuotes(){
  const quotes = [
    '"Orang yang benar-benar istimewa bukan yang merasa dirinya di atas orang lain, tapi yang tetap memilih berdiri sejajar walau ia punya semua alasan untuk merasa lebih."',
    '"Maaf adalah kata yang paling sederhana, tapi paling sulit diucapkan dengan tulus. Ini salah satu dari sedikit kesempatan aku mengucapkannya dengan sepenuh hati."',
    '"Kadang lilin kecil menerangi ruangan yang jauh lebih besar dari ukurannya sendiri — bukan karena nyalanya paling besar, tapi karena ia memilih untuk tetap menyala."',
  ];
  $$('.quote-pebble').forEach(pebble => {
    pebble.addEventListener('click', () => {
      const idx = parseInt(pebble.dataset.quote, 10);
      $('#quote-display').textContent = quotes[idx];
    });
  });
})();

// ============================================================
// CHAPTER 4 — STAR SKY / GAME
// ============================================================
(function starSky(){
  const sky = $('#star-sky');
  if(!sky) return;
  const COUNT = window.innerWidth < 640 ? 40 : 80;
  for(let i=0;i<COUNT;i++){
    const s = document.createElement('div');
    s.className = 'star';
    const size = 1 + Math.random()*2;
    s.style.width = s.style.height = `${size}px`;
    s.style.left = `${Math.random()*100}%`;
    s.style.top = `${Math.random()*100}%`;
    s.style.animationDelay = `${Math.random()*3}s`;
    sky.appendChild(s);
  }
})();

$('#moon-egg')?.addEventListener('click', moonMsg);
$('#moon-egg')?.addEventListener('keypress', (e) => { if(e.key === 'Enter') moonMsg(); });
function moonMsg(){
  $('#moon-egg-response').textContent = 'Kalau kamu melihat bulan malam ini, ingatlah — mungkin ada seseorang di tempat lain yang juga sedang melihat bulan yang sama. Jarak mungkin membuat dua orang berada di tempat berbeda. Tapi kadang, langit yang sama cukup untuk membuat kita merasa tidak terlalu jauh.';
}

const starAnswers = {
  bright: 'Yang paling terang memang mudah ditemukan.',
  closest: 'Kadang yang paling berarti bukan yang paling jauh.',
  faint: 'Menarik. Mungkin kamu tahu sesuatu yang orang lain sering lupa — bahwa tidak semua hal yang berarti harus terlihat jelas. Mungkin ada hal-hal yang memang lebih baik dirasakan daripada dijelaskan.',
};
$$('[data-star]').forEach(btn => {
  btn.addEventListener('click', () => {
    $('#star-answer').textContent = starAnswers[btn.dataset.star];
  });
});

$$('[data-count]').forEach(btn => {
  btn.addEventListener('click', () => {
    $('#star-count-answer').textContent = 'Mungkin jawabannya tidak terlalu penting. Karena kalau semua orang sibuk menghitung bintang yang sama, mereka mungkin lupa bahwa setiap orang punya caranya sendiri untuk memandang langit. Jadi, kalau suatu hari ada seseorang yang membuatmu merasa kamu harus menjadi bintang yang paling terang — ingat ini. Kamu tidak harus menjadi bintang yang paling terang. Jadilah bintang yang paling mirip dengan dirimu sendiri. Karena langit tidak pernah meminta semua bintang untuk bersinar dengan cara yang sama. Dan anehnya, justru itu yang membuat langit menjadi indah.';
  });
});

// ============================================================
// CHAPTER 6 — ENVELOPE
// ============================================================
$('#open-envelope')?.addEventListener('click', (e) => {
  const envelope = $('#envelope');
  envelope.classList.add('open');
  setTimeout(() => {
    $('#letter').hidden = false;
    e.target.hidden = true;
    $('#letter').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
  }, reducedMotion ? 0 : 700);
});

// ============================================================
// CHAPTER 9 — FINAL SCREEN
// ============================================================
$('#restart-btn')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
});
$('#stay-btn')?.addEventListener('click', () => {
  $('#stay-response').textContent = 'Baiklah. Aku memang berharap kamu tidak langsung pergi.';
});