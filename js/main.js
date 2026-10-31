(() => {
const S = window.SITE, P = S.projects;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const url = p => `https://github.com/${S.gh}/${p.repo}`;
const target = p => (p.open === 'live' && p.live) ? p.live : url(p);   // destination de « A »
const REPOS = `https://github.com/${S.gh}?tab=repositories`;
const NAV = P.length + 1;               // projets + « Tous les projets »
const ls = (k, v) => { try { return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch (_) {} };

const DOCK = [
  { id: 'projets', t: 'Projets', i: 'grid', c: '#e60012', f: 1 },
  { id: 'apropos', t: 'À propos', i: 'user', c: '#f08a1c' },
  { id: 'competences', t: 'Compétences', i: 'list', c: '#2fb34a' },
  { id: 'contact', t: 'Contact', i: 'mail', c: '#ee3a43' },
  { id: 'commandes', t: 'Commandes', i: 'pad' },
  { id: 'parametres', t: 'Paramètres', i: 'gear', act: () => window.openSettings() },
  { id: 'veille', t: 'Veille', i: 'power', act: sleep }
];

let view = 'projets', zone = 'row', sel = 0, di = 0, oi = 0;
let launched = -1, mode = '', goTimer, optsOn = false, sleeping = false, ac;
const D = ms => PREFS.get('anim') ? ms : 1;     // durées des animations (réglage « Animations »)

/* ---------- sons (synthétisés, très discrets) ---------- */
function snd(f = 800) {
  if (!PREFS.get('sound')) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.frequency.value = f; g.gain.setValueAtTime(.09, t); g.gain.exponentialRampToValueAtTime(.0001, t + .06);
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
$$('.d').forEach(b => b.onclick = () => { di = +b.dataset.i; zone = 'dock'; if (DOCK[di].id !== 'parametres') snd(1000); go(DOCK[di].id); paint(); });
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
function launch(i, m) {          // m = 'go' : écran d'ouverture puis redirection | 'info' : page de détails
  const p = P[i], L = $('#launch'), go = m === 'go';
  L.style.setProperty('--a', p.bg[0]); L.style.setProperty('--b', p.bg[1]); L.className = p.light ? 'light' : '';
  const head = `<img class="limg ${p.fit}" src="${p.img}" alt="${p.name}">${p.fit === 'cover' ? '' : `<h1>${p.name}</h1>`}`;
  L.innerHTML = `<div class="lc">${head}` + (go
    ? `<p class="opening"><i class="spin"></i>Ouverture de ${new URL(target(p)).hostname}…</p></div>`
    : `<p>${p.desc}</p><div class="tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</div>
       <div class="acts"><a class="btn main" href="${url(p)}" target="_blank" rel="noopener">Voir sur GitHub</a>${p.live ? `<a class="btn" href="${p.live}" target="_blank" rel="noopener">Ouvrir le site</a>` : ''}</div></div>`);
  const from = clip(T[i].getBoundingClientRect());
  L.getAnimations().forEach(a => a.cancel());
  L.hidden = false; launched = i; mode = m; document.body.dataset.launch = p.light ? 'light' : 'dark';
  L.animate([{ clipPath: from }, { clipPath: 'inset(0 0 0 0 round 0px)' }], { duration: D(450), easing: 'cubic-bezier(.2,.8,.2,1)' });
  SFX.play('launch');
  if (go) goTimer = setTimeout(() => { location.href = target(p); }, Math.min(2500, Math.max(1100, SFX.duration('launch') + 150)));
}
function unlaunch() {
  clearTimeout(goTimer); SFX.stop('launch');
  const L = $('#launch'), to = clip(T[launched].getBoundingClientRect()); launched = -1;
  delete document.body.dataset.launch;
  L.firstElementChild.animate([{ opacity: 1 }, { opacity: 0 }], { duration: D(120), fill: 'forwards' });
  const a = L.animate([{ clipPath: 'inset(0 0 0 0 round 0px)' }, { clipPath: to }], { duration: D(350), easing: 'ease-in', fill: 'forwards' });
  a.onfinish = () => { if (launched < 0) L.hidden = true; a.cancel(); };   // cancel : évite un rognage à la prochaine ouverture
}

/* ---------- panneau Options (+) ---------- */
let toastT;
function toast(msg, ms = 1800) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), ms); }
function copyLink(p) {
  const u = target(p);
  (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => toast('Lien copié'), () => toast(u));
}
const pageItems = () => $$('.page:not([hidden]) a.rl, .page:not([hidden]) button.rl');
function optItems() {
  const p = P[sel];
  return [['Ouvrir', () => launch(sel, 'go')],
    ...(p.live && target(p) !== p.live ? [['Ouvrir le site', () => open(p.live, '_blank', 'noopener')]] : []),
    ...(target(p) !== url(p) ? [['Voir sur GitHub', () => open(url(p), '_blank', 'noopener')]] : []),
    ['Détails', () => launch(sel, 'info')],
    ['Copier le lien', () => copyLink(p)],
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
  const tileLaunch = launched < 0 && zone === 'row' && view === 'projets' && sel < P.length;
  const toSettings = launched < 0 && zone === 'dock' && DOCK[di].id === 'parametres';
  if (!(tileLaunch && SFX.has('launch')) && !toSettings) snd(1000);   // un seul son par action
  if (launched >= 0) { if (mode === 'info') open(url(P[launched]), '_blank', 'noopener'); }
  else if (zone === 'row' && view === 'projets') sel < P.length ? launch(sel, 'go') : open(REPOS, '_blank', 'noopener');
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
  const st = document.documentElement.dataset.stage;
  if ((st && st !== 'menu') || document.body.dataset.settings) return;          // écran de chargement / d'accueil
  if (sleeping) { if (!e.repeat) wake(); e.preventDefault(); return; }
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
  const li = ae && ae.closest && ae.closest('.page a.rl, .page button.rl');
  if (li && (k === 'arrowup' || k === 'arrowdown')) {   // navigation dans les listes (Contact, Paramètres)
    const it = pageItems(), n = it.indexOf(li) + (k === 'arrowdown' ? 1 : -1);
    if (n >= it.length) { li.blur(); zone = 'dock'; paint(); } else if (n >= 0) it[n].focus();
    snd(700); e.preventDefault(); return;
  }
  if (k.startsWith('arrow') || (k === ' ' && free)) e.preventDefault();
  if (free && ae && ae.blur && k.startsWith('arrow')) ae.blur();
  if ((k === 'arrowright' || k === 'arrowleft') && idle) {
    const d = k === 'arrowright' ? 1 : -1;
    if (zone === 'row' && view === 'projets') select(sel + d);
    else if (zone === 'dock') { di = clamp(di + d, 0, DOCK.length - 1); paint(); snd(700); }
    e.preventDefault();
  } else if (k === 'arrowdown' && zone === 'row' && idle) { zone = 'dock'; paint(); snd(700); e.preventDefault(); }
  else if (k === 'arrowup' && zone === 'dock' && view === 'projets' && idle) { zone = 'row'; paint(); snd(700); e.preventDefault(); }
  else if (k === 'arrowup' && zone === 'dock' && view !== 'projets' && idle) {
    const it = pageItems(); if (it.length) { it[it.length - 1].focus(); zone = 'page'; paint(); snd(700); }
  }
  else if ((k === 'enter' || k === ' ' || k === 'a') && free) { act(); e.preventDefault(); }
  else if (k === 'o' || k === '+' || k === '=') openOpts();
  else if (k === 'escape' || k === 'backspace' || k === 'b') back();
});
document.addEventListener('click', e => { const b = e.target.closest('.d,.tile,.key,.av'); if (b) b.blur(); }, true);
$$('.d').forEach((b, i) => b.addEventListener('focus', () => { if (b.matches(':focus-visible')) { di = i; zone = 'dock'; paint(); } }));
T.forEach((t, i) => { if (i < NAV) t.addEventListener('focus', () => { if (t.matches(':focus-visible')) select(i, true); }); });
$('#row').addEventListener('wheel', e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { e.currentTarget.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });
addEventListener('resize', label);
document.fonts && document.fonts.ready.then(label);

/* ---------- veille et plein écran ---------- */
function sleep() { sleeping = true; $('#sleep').classList.add('on'); }
function wake() { sleeping = false; $('#sleep').classList.remove('on'); }
$('#sleep').onclick = wake;
PREFS.on(k => { if (k === 'clock24' || k === '*') tick(); });

/* ---------- barre d'état : heure, Wi-Fi, batterie ---------- */
function tick() {
  const t = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: !PREFS.get('clock24') });
  $('#clock').textContent = t; $('#sclock').textContent = t;
}
function bat(pct, charging) {
  $('#bat').hidden = false;      // affichée seulement si le navigateur fournit la vraie valeur
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

/* ---------- compétences et retour arrière du navigateur ---------- */
$('#skills').innerHTML = (S.skills || []).map(k => `<div class="sk"><h3>${k.t}</h3><p>${k.n || ''}</p><div class="tags">${k.items.map(x => `<span>${x}</span>`).join('')}</div></div>`).join('');
addEventListener('pageshow', e => {
  if (!e.persisted) return;
  clearTimeout(goTimer); launched = -1; delete document.body.dataset.launch;
  const L = $('#launch'); L.getAnimations().forEach(a => a.cancel()); L.hidden = true;
});

window.APP = { go, snd, toast };

/* ---------- démarrage ---------- */
select(0, true);
const h = location.hash.slice(1);
if (DOCK.some(d => d.id === h && !d.href && !d.act && d.id !== 'projets')) go(h);
})();
