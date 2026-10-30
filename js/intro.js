/* Écran de chargement -> page d'accueil -> menu.
   Passée automatiquement si : déjà vue dans cet onglet, lien direct (#page) ou ?skip. */
(() => {
  const S = window.SITE, root = document.documentElement, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  if (root.dataset.stage !== 'boot') return;

  const P = S.projects, GH = `https://github.com/${S.gh}`;
  const target = p => (p.open === 'live' && p.live) ? p.live : `${GH}/${p.repo}`;
  const others = P.filter(p => p.repo !== 'portfolio'), folio = P.find(p => p.repo === 'portfolio');
  let recent = others.find(p => p.repo === S.recent) || others[others.length - 1];
  let zone = 'center', gi = 0, starting = false;
  const read = new Set();

  /* ---------- cartes « À la une » : projet récent, GitHub, Portfolio ---------- */
  const art = p => `<span class="nart" style="--a:${p.bg[0]};--b:${p.bg[1]}"><img class="${p.fit || ''}" src="${p.img}" alt=""></span>`;
  const items = () => [
    { href: target(recent), badge: 'Récent', title: recent.name, sub: 'Projet le plus récent', art: art(recent) },
    { href: GH, badge: 'GitHub', title: 'GitHub', sub: `github.com/${S.gh}`, art: '<span class="nart" style="--a:#0d1117;--b:#394150"><svg class="ic"><use href="#i-github"/></svg></span>' },
    folio && { href: target(folio), badge: 'Site', title: 'Portfolio', sub: 'Mon site personnel', art: art(folio) }
  ].filter(Boolean);
  function paintNews() {
    $$('.ncard').forEach((c, i) => c.classList.toggle('sel', zone === 'news' && i === gi));
    $$('.ndot').forEach((d, i) => d.classList.toggle('read', read.has(i)));
  }
  function renderNews() {
    $('#nlist').innerHTML = items().map(c => `<a class="ncard" href="${c.href}" target="_blank" rel="noopener">${c.art}<span class="nbadge">${c.badge}</span><span class="ncap"><b>${c.title}</b><small>${c.sub}</small></span></a><i class="ndot"></i>`).join('');
    paintNews();
  }
  renderNews();
  $('#nlist').addEventListener('click', e => { const c = e.target.closest('.ncard'); if (c) { read.add($$('.ncard').indexOf(c)); paintNews(); } });

  // le « projet récent » = le dépôt (hors portfolio) poussé le plus récemment ; sinon valeur par défaut de data.js
  Promise.all(others.map(p => fetch(`https://api.github.com/repos/${S.gh}/${p.repo}`).then(r => r.ok ? r.json() : null).catch(() => null)))
    .then(rs => {
      let best = null;
      rs.forEach((d, i) => { if (d && d.pushed_at && (!best || d.pushed_at > best.t)) best = { t: d.pushed_at, p: others[i] }; });
      if (best && best.p !== recent) { recent = best.p; renderNews(); }
    });

  /* ---------- enchaînement : chargement -> accueil -> menu ---------- */
  const bootMs = S.bootMs || 3600;
  root.style.setProperty('--boot', bootMs + 'ms');
  setTimeout(() => {
    $('#boot').classList.add('out');
    setTimeout(() => { root.dataset.stage = 'gate'; sync(); }, 400);
  }, bootMs);

  function start() {
    if (starting) return; starting = true;
    $('#gate').classList.add('leaving');
    setTimeout(() => {
      root.dataset.stage = 'menu';
      try { sessionStorage.setItem('booted', '1'); } catch (_) {}
      dispatchEvent(new Event('resize'));      // recale l'étiquette de la barre du bas
    }, 450);
  }
  $('#ghome').onclick = $('#gstart').onclick = start;
  $('#gy').onclick = () => setZone('news');

  function setZone(z) { zone = z; paintNews(); }

  addEventListener('keydown', e => {
    if (root.dataset.stage !== 'gate' || starting) return;
    const k = e.key.toLowerCase(), ae = document.activeElement, free = !ae || ae === document.body;
    const n = $$('.ncard').length;
    if (k === 'y' || (k === 'arrowleft' && zone === 'center')) setZone(zone === 'news' && k === 'y' ? 'center' : 'news');
    else if (zone === 'news' && (k === 'arrowdown' || k === 'arrowup')) { gi = Math.max(0, Math.min(n - 1, gi + (k === 'arrowdown' ? 1 : -1))); paintNews(); }
    else if (zone === 'news' && (k === 'escape' || k === 'b' || k === 'arrowright')) setZone('center');
    else if (zone === 'news' && free && (k === 'enter' || k === ' ' || k === 'a')) { const c = $$('.ncard')[gi]; if (c) c.click(); }
    else if (zone === 'center' && free && (k === 'enter' || k === ' ' || k === 'a')) start();
    else return;
    e.preventDefault();
  });

  /* ---------- heure, Wi-Fi, batterie : copie de la barre d'état du menu ---------- */
  function sync() {
    $('#gclock').textContent = $('#clock').textContent;
    const b = $('#bat'), g = $('#gbat');
    g.hidden = b.hidden; $('#gbatv').textContent = $('#batv').textContent;
    $('#gbfill').setAttribute('width', $('#bfill').getAttribute('width')); g.style.color = b.style.color;
    $('#gwifi').classList.toggle('off', $('#wifi').classList.contains('off'));
  }
  setInterval(() => { if (root.dataset.stage === 'gate') sync(); }, 1000);
})();
