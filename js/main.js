(() => {
const S = window.SITE, P = S.projects;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const url = p => `https://github.com/${S.gh}/${p.repo}`;
const REPOS = `https://github.com/${S.gh}?tab=repositories`;
const NAV = P.length + 1;               // projets + « Tous les projets »
const ls = (k, v) => { try { return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch (_) {} };

const DOCK = [
  { id: 'projets', t: 'Projets', i: 'grid', c: '#e60012', f: 1 },
  { id: 'apropos', t: 'À propos', i: 'user', c: '#f08a1c' },
  { id: 'competences', t: 'Compétences', i: 'list', c: '#2fb34a' },
  { id: 'contact', t: 'Contact', i: 'mail', c: '#ee3a43' },
  { id: 'github', t: 'GitHub', i: 'code', c: '#2b5fd0', href: `https://github.com/${S.gh}` },
  { id: 'cv', t: 'CV', i: 'doc', c: '#12b5d4', href: S.cv },
  { id: 'commandes', t: 'Commandes', i: 'pad' },
  { id: 'plein', t: 'Plein écran', i: 'screen', act: fullscreen },
  { id: 'parametres', t: 'Paramètres', i: 'gear' },
  { id: 'veille', t: 'Veille', i: 'power', act: sleep }
];

let view = 'projets', zone = 'row', sel = 0, di = 0, oi = 0;
let launched = -1, optsOn = false, sleeping = false, ac;
let soundOn = ls('sound') !== 'off', pref = ls('theme') || 'auto';

/* ---------- sons (synthétisés, très discrets) ---------- */
function snd(f = 800) {
  if (!soundOn) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.frequency.value = f; g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.0001, t + .06);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + .07);
  } catch (_) {}
}

/* ---------- rangée de tuiles ---------- */
$('#row').innerHTML =
  P.map((p, i) => `<button class="tile" aria-label="${p.name}"><span class="art ${p.fit || 'icon'}" style="--a:${p.bg[0]};--b:${p.bg[1]};--i:${i}"><img src="${p.img}" alt="">${p.fit === 'cover' ? '' : `<b>${p.name}</b>`}${p.state ? `<em>${p.state}</em>` : ''}</span></button>`).join('') +
  '<button class="tile all" aria-label="Tous les projets"><span class="ball"><svg class="ic"><use href="#i-grid"/></svg></span></button>' +
  '<span class="tile" aria-hidden="true"></span>'.repeat(7);
const T = $$('#row .tile');
T.forEach((t, i) => { if (i < NAV) t.onclick = () => (i === sel && zone === 'row') ? act() : select(i); });

function cap() {
  const p = P[sel];
  $('#cap').innerHTML = p ? `<span>${p.name}</span><small>${p.tags.join(', ')}${p.state ? ' — ' + p.state : ''}</small>` : '<span>Tous les projets</span><small>Voir mes dépôts sur GitHub</small>';
}
function select(i, quiet) {
  sel = clamp(i, 0, NAV - 1); zone = 'row'; cap();
  T[sel].scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
  paint(); if (!quiet) snd(700);
}

/* ---------- dock ---------- */
$('#dock').innerHTML = DOCK.map((d, i) => `<button class="d${d.f ? ' fill' : ''}" ${d.c ? `style="--c:${d.c}"` : ''} data-i="${i}" aria-label="${d.t}"><svg class="ic"><use href="#i-${d.i}"/></svg></button>`).join('');
$$('.d').forEach(b => b.onclick = () => { di = +b.dataset.i; zone = 'dock'; snd(1000); go(DOCK[di].id); paint(); });
$('#u-me').onclick = () => { zone = 'dock'; go('apropos'); };

function label() {
  const l = $('#dlabel');
  if (zone !== 'dock') { l.style.opacity = 0; return; }
  const r = $$('.d')[di].getBoundingClientRect();
  l.textContent = DOCK[di].t; l.style.left = (r.left + r.width / 2) + 'px'; l.style.opacity = 1;
}
function paint() {
  const rowOn = view === 'projets' && zone === 'row';
  T.forEach((t, i) => t.classList.toggle('sel', rowOn && i === sel));
  $$('.d').forEach((b, i) => b.classList.toggle('sel', zone === 'dock' && i === di));
  $('#cap').style.visibility = rowOn ? 'visible' : 'hidden';
  label();
}
function go(id) {
  const d = DOCK.find(x => x.id === id);
  if (d.href) { open(d.href, '_blank', 'noopener'); return; }
  if (d.act) { d.act(); return; }
  view = id; di = DOCK.indexOf(d); zone = id === 'projets' ? 'row' : 'dock';
  $$('.view').forEach(e => e.hidden = e.id !== 'v-' + id);
  const pg = $('#v-' + id); if (pg) pg.scrollTop = 0;
  try { history.replaceState(null, '', '#' + id); } catch (_) {}
  paint();
}

/* ---------- lancement d'un projet : la tuile s'agrandit en plein écran ---------- */
const clip = r => `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 12px)`;
function launch(i) {
  const p = P[i], L = $('#launch');
  L.style.setProperty('--a', p.bg[0]); L.style.setProperty('--b', p.bg[1]); L.className = p.light ? 'light' : '';
  L.innerHTML = `<div class="lc"><img class="limg ${p.fit}" src="${p.img}" alt="${p.name}">${p.fit === 'cover' ? '' : `<h1>${p.name}</h1>`}<p>${p.desc}</p>
    <div class="tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</div>
    <div class="acts"><a class="btn main" href="${url(p)}" target="_blank" rel="noopener">Voir sur GitHub</a>${p.live ? `<a class="btn" href="${p.live}" target="_blank" rel="noopener">Ouvrir le site</a>` : ''}</div></div>`;
  const from = clip(T[i].getBoundingClientRect());
  L.hidden = false; launched = i;
  L.animate([{ clipPath: from }, { clipPath: 'inset(0 0 0 0 round 0px)' }], { duration: 450, easing: 'cubic-bezier(.2,.8,.2,1)' });
}
function unlaunch() {
  const L = $('#launch'), to = clip(T[launched].getBoundingClientRect()); launched = -1;
  L.firstElementChild.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' });
  L.animate([{ clipPath: 'inset(0 0 0 0 round 0px)' }, { clipPath: to }], { duration: 350, easing: 'ease-in', fill: 'forwards' })
    .onfinish = () => { if (launched < 0) L.hidden = true; };
}

/* ---------- panneau Options (+) ---------- */
function optItems() {
  const p = P[sel];
  return [['Voir sur GitHub', () => open(url(p), '_blank', 'noopener')],
    ...(p.live ? [['Ouvrir le site', () => open(p.live, '_blank', 'noopener')]] : []),
    ['Copier le lien', () => navigator.clipboard && navigator.clipboard.writeText(url(p))],
    ['Fermer', () => {}]];
}
const renderOpts = () => $('#optl').innerHTML = optItems().map((x, i) => `<li class="${i === oi ? 'on' : ''}" data-i="${i}">${x[0]}</li>`).join('');
function openOpts() {
  if (view !== 'projets' || sel >= P.length || launched >= 0 || optsOn) return;
  optsOn = true; oi = 0; renderOpts(); $('#opts').classList.add('on'); snd(1000);
}
function closeOpts() { optsOn = false; $('#opts').classList.remove('on'); }
function runOpt() { const it = optItems()[oi]; closeOpts(); it[1](); }
$('#optl').onclick = e => { const li = e.target.closest('li'); if (li) { oi = +li.dataset.i; runOpt(); } };
$('#scr').addEventListener('click', e => { if (optsOn && !e.target.closest('#ko')) closeOpts(); });

/* ---------- actions A / B ---------- */
function act() {
  snd(1000);
  if (launched >= 0) open(url(P[launched]), '_blank', 'noopener');
  else if (zone === 'row' && view === 'projets') sel < P.length ? launch(sel) : open(REPOS, '_blank', 'noopener');
  else if (zone === 'dock') { go(DOCK[di].id); paint(); }
}
function back() {
  snd(500);
  if (optsOn) closeOpts();
  else if (launched >= 0) unlaunch();
  else if (view !== 'projets') go('projets');
  else { zone = 'row'; paint(); }
}
$('#ka').onclick = act; $('#kb').onclick = back; $('#ko').onclick = openOpts;

addEventListener('keydown', e => {
  if (sleeping) { wake(); e.preventDefault(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (optsOn) {
    if (k === 'arrowdown' || k === 'arrowup') { oi = clamp(oi + (k === 'arrowdown' ? 1 : -1), 0, optItems().length - 1); renderOpts(); snd(700); }
    else if (k === 'enter' || k === ' ' || k === 'a') runOpt();
    else if (['escape', 'backspace', 'b', 'o', '+'].includes(k)) closeOpts();
    else return;
    e.preventDefault(); return;
  }
  const ae = document.activeElement, idle = launched < 0;
  const free = !ae || ae === document.body || ae.matches('.d,.tile,.key,.av');
  if (k.startsWith('arrow') || (k === ' ' && free)) e.preventDefault();
  if (free && ae && ae.blur && k.startsWith('arrow')) ae.blur();
  if ((k === 'arrowright' || k === 'arrowleft') && idle) {
    const d = k === 'arrowright' ? 1 : -1;
    if (zone === 'row' && view === 'projets') select(sel + d);
    else if (zone === 'dock') { di = clamp(di + d, 0, DOCK.length - 1); paint(); snd(700); }
    e.preventDefault();
  } else if (k === 'arrowdown' && zone === 'row' && idle) { zone = 'dock'; paint(); snd(700); e.preventDefault(); }
  else if (k === 'arrowup' && zone === 'dock' && view === 'projets' && idle) { zone = 'row'; paint(); snd(700); e.preventDefault(); }
  else if ((k === 'enter' || k === ' ' || k === 'a') && free) { act(); e.preventDefault(); }
  else if (k === 'o' || k === '+' || k === '=') openOpts();
  else if (k === 'escape' || k === 'backspace' || k === 'b') back();
});
document.addEventListener('click', e => { const b = e.target.closest('.d,.tile,.key,.av'); if (b) b.blur(); }, true);
$$('.d').forEach((b, i) => b.addEventListener('focus', () => { if (b.matches(':focus-visible')) { di = i; zone = 'dock'; paint(); } }));
T.forEach((t, i) => { if (i < NAV) t.addEventListener('focus', () => { if (t.matches(':focus-visible')) select(i, true); }); });
addEventListener('resize', label);
document.fonts && document.fonts.ready.then(label);

/* ---------- veille et plein écran ---------- */
function sleep() { sleeping = true; $('#sleep').classList.add('on'); }
function wake() { sleeping = false; $('#sleep').classList.remove('on'); }
$('#sleep').onclick = wake;
function fullscreen() {
  const el = document.documentElement;
  document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen && el.requestFullscreen();
}

/* ---------- paramètres : thème et sons ---------- */
const mq = matchMedia('(prefers-color-scheme: dark)');
function theme() {
  document.documentElement.dataset.theme = pref === 'auto' ? (mq.matches ? 'dark' : 'light') : pref;
  $$('#set [data-t]').forEach(b => b.setAttribute('aria-checked', b.dataset.t === pref));
  $('#snd').setAttribute('aria-checked', soundOn);
  $('meta[name=theme-color]').content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
}
$('#set').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.id === 'snd') { soundOn = !soundOn; ls('sound', soundOn ? 'on' : 'off'); }
  else { pref = b.dataset.t; ls('theme', pref); }
  theme(); snd(900);
};
mq.addEventListener && mq.addEventListener('change', theme);

/* ---------- barre d'état : heure, Wi-Fi, batterie ---------- */
function tick() {
  const t = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  $('#clock').textContent = t; $('#sclock').textContent = t;
}
function bat(pct, charging) {
  $('#batv').textContent = pct + '%';
  $('#bfill').setAttribute('width', 20 * pct / 100);
  $('.bat').style.color = charging ? '#2fb34a' : '';
}
const net = () => $('#wifi').classList.toggle('off', !navigator.onLine);
tick(); setInterval(tick, 1000); net();
addEventListener('online', net); addEventListener('offline', net);
if (navigator.getBattery) navigator.getBattery().then(b => {
  const u = () => bat(Math.round(b.level * 100), b.charging); u(); b.onlevelchange = b.onchargingchange = u;
}).catch(() => {});

/* ---------- démarrage ---------- */
theme(); select(0, true);
const h = location.hash.slice(1);
if (DOCK.some(d => d.id === h && !d.href && !d.act && d.id !== 'projets')) go(h);
})();
