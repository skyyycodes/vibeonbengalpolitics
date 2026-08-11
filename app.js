/* ═══════════════════════════════════════════════════════════
   vibeonbengalpolitics.fun
   Background scenes + clock + ticker, with music playing through
   YouTube's embedded player. Vanilla JS, no build step.
   Edit config.js, not this file.
   ═══════════════════════════════════════════════════════════ */
(() => {
'use strict';

const CFG = Object.assign({
  title: 'vibe', subtitle: '',
  backgrounds: [], backgroundRotateSeconds: 0, backgroundVideoLoop: true,
  grain: true, scanlines: false, flicker: false,
  birds: true, birdsEverySeconds: 15,
  ticker: [], playlist: [], shuffle: false, playerPosition: 'center',
}, window.VIBE_CONFIG || {});

const $  = (id) => document.getElementById(id);
const el = {
  body: document.body, bgA: $('bgA'), bgB: $('bgB'), bgDim: $('bgDim'),
  sceneBtn: $('sceneBtn'), sceneToast: $('sceneToast'),
  grain: $('grain'), scanlines: $('scanlines'),
  heroTitle: $('heroTitle'), clock: $('clock'), birds: $('birds'),
  ticker: $('ticker'), tickerTrack: $('tickerTrack'),
  cover: $('cover'), coverImg: $('coverImg'),
  npTitle: $('npTitle'), npArtist: $('npArtist'), ytCount: $('ytCount'),
  seek: $('seek'), seekFill: $('seekFill'), tCur: $('tCur'), tDur: $('tDur'),
  playBtn: $('playBtn'), prevBtn: $('prevBtn'), nextBtn: $('nextBtn'),
  shuffleBtn: $('shuffleBtn'), muteBtn: $('muteBtn'),
  volRail: $('volRail'), volFill: $('volFill'),
  keys: $('keys'), keysClose: $('keysClose'),
};

const store = {
  get(k, d) { try { const v = localStorage.getItem('vibe:' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('vibe:' + k, JSON.stringify(v)); } catch { /* private mode */ } },
};

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ── chrome ─────────────────────────────────────────────── */
function paintChrome() {
  document.title = CFG.subtitle || CFG.title || document.title;
  if (CFG.title) el.heroTitle.textContent = CFG.title;

  if (!CFG.grain)      el.grain.hidden = true;
  if (!CFG.scanlines)  el.scanlines.hidden = true;
  if (CFG.flicker)     el.body.classList.add('flicker');

  if (!CFG.birds) el.birds.hidden = true;
  else {
    const s = Number(CFG.birdsEverySeconds) || 15;
    document.documentElement.style.setProperty('--birds-cycle', `${s}s`);
  }

  const pos = CFG.playerPosition;
  if (pos === 'left' || pos === 'right') el.body.classList.add(`deck-${pos}`);

  // ticker — duplicated once so the -50% crawl loops seamlessly
  const lines = (CFG.ticker || []).filter(Boolean);
  if (!lines.length) { el.ticker.style.display = 'none'; return; }
  const half = lines.map(t => `<span>${escapeHtml(t)}</span>`).join('');
  el.tickerTrack.innerHTML = half + half;
}

/* ── clock (always Kolkata, wherever you're listening from) ── */
function startClock() {
  const fmtTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: CFG.clockTimeZone || 'Asia/Kolkata',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
  const tick = () => {
    const now = new Date();
    el.clock.textContent = fmtTime.format(now);
    el.clock.dateTime = now.toISOString();
    // re-sync to the top of the next second instead of drifting on setInterval
    setTimeout(tick, 1000 - (now.getTime() % 1000) + 15);
  };
  tick();
}

/* ── scenes (backgrounds) ───────────────────────────────── */
const scenes = {
  list: (CFG.backgrounds || []).filter(s => s && s.src),
  at: -1,
  layers: [el.bgA, el.bgB],
  front: 0,
  toastTimer: 0,
  rotateTimer: 0,
};

const isVideo = (src) => /\.(mp4|webm|ogv|mov)$/i.test(src);

/* Paint a scene into a layer. Resolves once it's ready to show (or
   immediately if it failed — the layer falls back to the animated
   gradient rather than flashing black). */
function fillLayer(layer, scene) {
  layer.innerHTML = '';
  layer.classList.remove('is-fallback');
  layer.style.backgroundImage = '';
  layer.style.backgroundPosition = scene.focus || 'center';

  return new Promise((resolve) => {
    if (isVideo(scene.src)) {
      const v = document.createElement('video');
      Object.assign(v, {
        src: scene.src, autoplay: true, muted: true, playsInline: true,
        loop: CFG.backgroundVideoLoop !== false,
      });
      v.setAttribute('playsinline', '');
      v.style.objectPosition = scene.focus || 'center';
      v.addEventListener('loadeddata', () => resolve(), { once: true });
      v.addEventListener('error', () => { layer.classList.add('is-fallback'); resolve(); }, { once: true });
      layer.appendChild(v);
      v.play().catch(() => {});
      setTimeout(resolve, 2500);          // don't stall the fade on a slow file
    } else {
      const probe = new Image();
      probe.onload  = () => { layer.style.backgroundImage = `url("${scene.src}")`; resolve(); };
      probe.onerror = () => { layer.classList.add('is-fallback'); resolve(); };
      probe.src = scene.src;
    }
  });
}

function applySceneChrome(scene) {
  const dim = typeof scene.dim === 'number' ? scene.dim : 0;
  el.bgDim.style.opacity = String(Math.min(1, Math.max(0, dim)));
}

function toast(text) {
  if (!text) return;
  el.sceneToast.textContent = text;
  el.sceneToast.classList.add('is-on');
  clearTimeout(scenes.toastTimer);
  scenes.toastTimer = setTimeout(() => el.sceneToast.classList.remove('is-on'), 1900);
}

async function showScene(i, opts = {}) {
  if (!scenes.list.length) return;
  const idx = ((i % scenes.list.length) + scenes.list.length) % scenes.list.length;
  if (idx === scenes.at) return;
  const scene = scenes.list[idx];

  const back = scenes.layers[1 - scenes.front];
  await fillLayer(back, scene);

  scenes.layers[scenes.front].classList.remove('is-on');
  back.classList.add('is-on');
  scenes.front = 1 - scenes.front;
  scenes.at = idx;

  applySceneChrome(scene);
  if (!opts.silent) toast(scene.label);
  store.set('scene', idx);
  armRotate();
}

const nextScene = () => showScene(scenes.at + 1);

function armRotate() {
  clearTimeout(scenes.rotateTimer);
  const s = Number(CFG.backgroundRotateSeconds) || 0;
  if (s > 0 && scenes.list.length > 1) scenes.rotateTimer = setTimeout(nextScene, s * 1000);
}

function initScenes() {
  if (!scenes.list.length) {
    el.bgA.classList.add('is-fallback', 'is-on');
    el.sceneBtn.hidden = true;
    return;
  }
  if (scenes.list.length < 2) el.sceneBtn.hidden = true;

  const saved = store.get('scene', 0);
  const start = Number.isInteger(saved) && saved >= 0 && saved < scenes.list.length ? saved : 0;

  applySceneChrome(scenes.list[start]);
  showScene(start, { silent: true });
  scenes.list.forEach((s, i) => { if (i !== start && !isVideo(s.src)) new Image().src = s.src; });
}
/* ── YouTube player ─────────────────────────────────────── */
/* The iframe is parked off-screen and every control below is proxied onto it
   through the IFrame API, so the pill drives playback. */
const yt = { player: null, ids: [], ready: false, poll: 0, seeking: false, lastId: '' };

const state = {
  volume: store.get('volume', 75),          // YouTube's scale is 0-100
  muted:  store.get('muted', false),
  shuffle: store.get('shuffle', !!CFG.shuffle),
};

function buildIds() {
  return (CFG.playlist || [])
    .map(v => String(v).trim())
    .map(v => {
      // tolerate full URLs as well as bare IDs
      const m = v.match(/[?&]v=([\w-]{11})/) || v.match(/youtu\.be\/([\w-]{11})/);
      return m ? m[1] : v;
    })
    .filter(v => /^[\w-]{11}$/.test(v));
}

function loadYouTubeAPI() {
  return new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) return resolve();
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (typeof prev === 'function') prev(); resolve(); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    s.onerror = reject;
    document.head.appendChild(s);
    setTimeout(() => (window.YT && window.YT.Player) ? resolve() : reject(new Error('timeout')), 12000);
  });
}

const call = (fn, ...args) => {
  try { return yt.ready && yt.player && yt.player[fn] ? yt.player[fn](...args) : undefined; }
  catch { return undefined; }
};

const fmt = (s) => {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

/* Long titles slide instead of truncating. */
function fitMarquee() {
  const n = el.npTitle;
  n.classList.remove('is-scrolling');
  requestAnimationFrame(() => {
    const over = n.scrollWidth - n.parentElement.clientWidth;
    if (over > 8) {
      n.style.setProperty('--shift', `-${over + 8}px`);
      n.classList.add('is-scrolling');
    }
  });
}

/* Title, artist and artwork all come from YouTube. */
function syncTrack() {
  const data = call('getVideoData') || {};
  const id = data.video_id || '';
  if (!id || id === yt.lastId) return;
  yt.lastId = id;

  el.npTitle.textContent = data.title || '—';
  el.npArtist.textContent = (data.author || '').replace(/ - Topic$/, '');
  fitMarquee();
  // getVideoData() often has no title/author until playback actually starts;
  // oEmbed fills the gap so the pill isn't blank while cued.
  if (!data.title || !data.author) fillFromOEmbed(id);

  el.coverImg.onerror = () => { el.coverImg.hidden = true; };
  el.coverImg.onload  = () => { el.coverImg.hidden = false; };
  el.coverImg.src = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

  const i = call('getPlaylistIndex');
  const n = yt.ids.length;
  el.ytCount.textContent = (typeof i === 'number' && i >= 0 && n)
    ? `${String(i + 1).padStart(2, '0')}/${n}` : '';

  if ('mediaSession' in navigator && data.title) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: data.title,
      artist: (data.author || '').replace(/ - Topic$/, ''),
      artwork: [{ src: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, sizes: '480x360', type: 'image/jpeg' }],
    });
  }
}

const oembedCache = new Map();
async function fillFromOEmbed(id) {
  if (oembedCache.has(id)) return applyOEmbed(id, oembedCache.get(id));
  try {
    const r = await fetch(`https://www.youtube.com/oembed?url=https%3A//www.youtube.com/watch%3Fv%3D${id}&format=json`);
    if (!r.ok) return;
    const d = await r.json();
    oembedCache.set(id, d);
    applyOEmbed(id, d);
  } catch { /* offline or blocked — the pill just shows what the API gave us */ }
}
function applyOEmbed(id, d) {
  if (id !== yt.lastId) return;               // track changed while we waited
  if (d.title && !el.npTitle.textContent.trim()) { el.npTitle.textContent = d.title; }
  if (d.title && el.npTitle.textContent === '—') { el.npTitle.textContent = d.title; }
  if (d.author_name && !el.npArtist.textContent) {
    el.npArtist.textContent = d.author_name.replace(/ - Topic$/, '');
  }
  fitMarquee();
}

/* Progress is polled — the API has no timeupdate event. */
function startPolling() {
  clearInterval(yt.poll);
  yt.poll = setInterval(() => {
    if (!yt.ready) return;
    syncTrack();
    if (yt.seeking) return;
    const d = call('getDuration') || 0;
    const t = call('getCurrentTime') || 0;
    if (d > 0) {
      el.seekFill.style.width = `${Math.min(100, (t / d) * 100)}%`;
      el.tDur.textContent = fmt(d);
    }
    el.tCur.textContent = fmt(t);
  }, 250);
}

/* ── transport — every one of these is a proxy onto the iframe ── */
const play  = () => { call('playVideo');  el.body.classList.remove('idle'); };
const pause = () => call('pauseVideo');
const toggle = () => (el.body.classList.contains('is-playing') ? pause() : play());
const next = () => { call('nextVideo'); el.body.classList.remove('idle'); };
const prev = () => {
  // restart the track first, like every other player
  if ((call('getCurrentTime') || 0) > 3) call('seekTo', 0, true);
  else call('previousVideo');
  el.body.classList.remove('idle');
};
const seekBy = (secs) => {
  const t = call('getCurrentTime');
  if (typeof t === 'number') call('seekTo', Math.max(0, t + secs), true);
};

function applyVolume() {
  call('setVolume', state.volume);
  if (state.muted) call('mute'); else call('unMute');
  el.volFill.style.width = `${state.muted ? 0 : state.volume}%`;
  el.body.classList.toggle('is-muted', state.muted);
  store.set('volume', state.volume);
  store.set('muted', state.muted);
}
function setVolume(v) {
  state.volume = Math.min(100, Math.max(0, Math.round(v)));
  if (state.volume > 0) state.muted = false;
  applyVolume();
}

function applyShuffle() {
  call('setShuffle', state.shuffle);
  el.shuffleBtn.classList.toggle('is-on', state.shuffle);
  store.set('shuffle', state.shuffle);
}

/* ── drag helper for the two rails ──────────────────────── */
function draggable(rail, onFrac) {
  const frac = (e) => {
    const r = rail.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    return Math.min(1, Math.max(0, x / r.width));
  };
  const move = (e) => { onFrac(frac(e), false); e.preventDefault(); };
  const up   = (e) => {
    yt.seeking = false;
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    onFrac(frac(e), true);
  };
  rail.addEventListener('pointerdown', (e) => {
    yt.seeking = true;
    onFrac(frac(e), false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    e.preventDefault();
  });
}

async function initPlayer() {
  yt.ids = buildIds();
  if (!yt.ids.length) {
    el.npTitle.textContent = 'playlist খালি';
    el.npArtist.textContent = 'config.js দেখুন';
    return;
  }

  try {
    await loadYouTubeAPI();
  } catch {
    el.npTitle.textContent = 'YouTube লোড হয়নি';
    el.npArtist.textContent = 'নেট বা অ্যাড-ব্লকার দেখুন';
    return;
  }

  yt.player = new YT.Player('ytPlayer', {
    width: 320, height: 180,
    videoId: yt.ids[0],
    playerVars: { playsinline: 1, rel: 0, controls: 0, disablekb: 1 },
    events: {
      onReady: () => {
        yt.ready = true;
        // Queue via the API rather than the `playlist` player var: that var treats
        // its list as the whole queue, which silently drops the first track.
        try {
          yt.player.cuePlaylist({ playlist: yt.ids, index: 0 });
          yt.player.setLoop(true);
        } catch { /* fall back to the single cued video */ }
        applyVolume();
        applyShuffle();
        el.body.classList.add('idle');
        [400, 1200, 2500].forEach(ms => setTimeout(syncTrack, ms));
        startPolling();
      },
      onStateChange: (e) => {
        el.body.classList.toggle('is-playing', e.data === YT.PlayerState.PLAYING);
        if (e.data === YT.PlayerState.PLAYING) el.body.classList.remove('idle');
        syncTrack();
      },
      onError: () => {
        // a video that can't be embedded shouldn't stall the set
        el.npArtist.textContent = 'এই গানটি চলছে না — পরেরটায় যাচ্ছি';
        setTimeout(next, 900);
      },
    },
  });
}

/* ── keys sheet ─────────────────────────────────────────── */
const openKeys = (on) => el.keys.classList.toggle('is-open', on);

/* ── wiring ─────────────────────────────────────────────── */
function wire() {
  el.playBtn.addEventListener('click', toggle);
  el.nextBtn.addEventListener('click', next);
  el.prevBtn.addEventListener('click', prev);
  el.muteBtn.addEventListener('click', () => { state.muted = !state.muted; applyVolume(); });
  el.shuffleBtn.addEventListener('click', () => { state.shuffle = !state.shuffle; applyShuffle(); });

  el.sceneBtn.addEventListener('click', nextScene);
  el.keysClose.addEventListener('click', () => openKeys(false));
  el.keys.addEventListener('click', (e) => { if (e.target === el.keys) openKeys(false); });

  draggable(el.seek, (f, done) => {
    const d = call('getDuration') || 0;
    if (d > 0) {
      el.seekFill.style.width = `${f * 100}%`;
      el.tCur.textContent = fmt(f * d);
      // scrub live while dragging, but only commit playback on release
      call('seekTo', f * d, done);
    }
  });
  draggable(el.volRail, (f) => setVolume(f * 100));

  window.addEventListener('resize', fitMarquee);

  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea')) return;
    switch (e.key) {
      case ' ':          e.preventDefault(); toggle(); break;
      case 'ArrowRight': e.preventDefault(); e.shiftKey ? next() : seekBy(5); break;
      case 'ArrowLeft':  e.preventDefault(); e.shiftKey ? prev() : seekBy(-5); break;
      case 'ArrowUp':    e.preventDefault(); setVolume(state.volume + 5); break;
      case 'ArrowDown':  e.preventDefault(); setVolume(state.volume - 5); break;
      case 'm': case 'M': state.muted = !state.muted; applyVolume(); break;
      case 's': case 'S': el.shuffleBtn.click(); break;
      case 'b': case 'B': nextScene(); break;
      case '?': openKeys(!el.keys.classList.contains('is-open')); break;
      case 'Escape': openKeys(false); break;
    }
  });

  // OS media keys / lock screen
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', play);
    navigator.mediaSession.setActionHandler('pause', pause);
    navigator.mediaSession.setActionHandler('nexttrack', next);
    navigator.mediaSession.setActionHandler('previoustrack', prev);
  }
}

/* ── boot ───────────────────────────────────────────────── */
paintChrome();
startClock();
initScenes();
wire();
initPlayer();
el.body.classList.add('is-live');
})();
