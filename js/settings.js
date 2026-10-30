/* Page Paramètres plein écran (sidebar + volet de droite, comme les réglages de la console). */
(() => {
  const P = window.PREFS, $ = s => document.querySelector(s);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const WALLS = [['plain', 'Uni'], ['dots', 'Points'], ['lines', 'Rayures'], ['glow', 'Aurore']];
  const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="m7 12.5 3.2 3.2L17 9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CATS = [
    { t: 'Thèmes', rows: [
      { type: 'choice', k: 'theme', t: 'Thème', d: 'Clair, sombre, ou selon les réglages de votre appareil.', opts: [['auto', 'Automatique'], ['light', 'Clair'], ['dark', 'Sombre']] },
      { type: 'wall', k: 'wall', t: 'Fond d’écran' },
      { type: 'choice', k: 'accent', t: 'Couleur du curseur', d: 'Cadre de sélection et accents du menu.', opts: [['cyan', 'Cyan'], ['green', 'Vert'], ['pink', 'Rose'], ['violet', 'Violet']] }] },
    { t: 'Affichage et son', rows: [
      { type: 'toggle', k: 'clock24', t: 'Horloge 24 heures', d: 'Désactivez pour un affichage 12 heures (am / pm).' },
      { type: 'toggle', k: 'sound', t: 'Sons de navigation', d: 'De petits bips discrets quand vous vous déplacez dans les menus.' },
      { type: 'toggle', k: 'anim', t: 'Animations', d: 'Transitions, curseur animé et ouverture des projets.' },
      { type: 'toggle', k: 'depth', t: 'Effet de profondeur', d: 'Le fond d’écran suit légèrement la souris.' }] },
    { t: 'Démarrage', rows: [
      { type: 'toggle', k: 'intro', t: 'Écran de démarrage', d: 'Chargement puis page d’accueil à l’ouverture du site, une fois par onglet.' }] },
    { t: 'Système', rows: [
      { type: 'action', t: 'Commandes', d: 'Afficher les touches du clavier.', run: () => { closeS(); window.APP.go('commandes'); } },
      { type: 'action', t: 'Rétablir les paramètres par défaut', d: 'Thème, fond d’écran, couleur, affichage et son.', run: () => { P.reset(); window.APP.toast('Paramètres rétablis'); } }] }
  ];
  let open = false, zone = 'nav', ci = 0, ri = 0;
  const el = $('#settings'), nav = $('#snav'), pane = $('#spane'), cur = () => CATS[ci];
  const lab = r => (r.opts.find(o => o[0] === P.get(r.k)) || [])[1];

  function rowHTML(r, i) {
    const sel = zone === 'pane' && i === ri ? ' sel' : '';
    if (r.type === 'wall') return `<div class="sr${sel}" data-i="${i}"><div class="st">${r.t}</div><div class="wgrid">${WALLS.map(([k, n]) => `<button class="wt${P.get('wall') === k ? ' on' : ''}" data-w="${k}"><span class="wp-${k}"></span><em>${n}</em>${P.get('wall') === k ? CHECK : ''}</button>`).join('')}</div></div>`;
    const right = r.type === 'toggle' ? `<i class="sw${P.get(r.k) ? ' on' : ''}"></i>` : r.type === 'choice' ? `<b>${lab(r)}</b>` : '<b>›</b>';
    return `<div class="sr${sel}" data-i="${i}"><div class="srow"><span>${r.t}${r.d ? `<small>${r.d}</small>` : ''}</span>${right}</div></div>`;
  }
  function render(keep) {
    const sc = pane.scrollTop; el.dataset.zone = zone;
    nav.innerHTML = CATS.map((c, i) => `<button class="sn${i === ci ? ' on' : ''}" data-i="${i}">${c.t}</button>`).join('');
    pane.innerHTML = cur().rows.map(rowHTML).join(''); pane.scrollTop = keep ? sc : 0;
    const s = pane.querySelector('.sel'); if (s) s.scrollIntoView({ block: 'nearest' });
  }
  function step(r, d) {
    const list = r.type === 'wall' ? WALLS : r.opts, k = list.findIndex(o => o[0] === P.get(r.k));
    P.set(r.k, list[(k + d + list.length) % list.length][0]);
  }
  function activate(i) {
    const r = cur().rows[i]; if (!r) return;
    if (r.type === 'toggle') P.set(r.k, !P.get(r.k)); else if (r.type === 'action') r.run(); else step(r, 1);
    render(true); window.APP.snd(1000);
  }
  function openS() { open = true; zone = 'nav'; ci = 0; ri = 0; el.hidden = false; document.body.dataset.settings = '1'; render(); window.APP.snd(1000); }
  function closeS() { open = false; el.hidden = true; delete document.body.dataset.settings; }
  const back = () => { window.APP.snd(500); if (zone === 'pane') { zone = 'nav'; render(true); } else closeS(); };
  window.openSettings = openS;

  nav.onclick = e => { const b = e.target.closest('.sn'); if (b) { ci = +b.dataset.i; zone = 'nav'; ri = 0; render(); window.APP.snd(700); } };
  pane.onclick = e => {
    const w = e.target.closest('.wt'); if (w) { P.set('wall', w.dataset.w); zone = 'pane'; ri = cur().rows.findIndex(r => r.type === 'wall'); render(true); window.APP.snd(700); return; }
    const r = e.target.closest('.sr'); if (r) { zone = 'pane'; ri = +r.dataset.i; activate(ri); }
  };
  // boutons B / A du pied de page
  document.addEventListener('click', e => {
    if (!open) return; const k = e.target.closest('#ka,#kb'); if (!k) return;
    e.stopPropagation(); k.id === 'kb' ? back() : (zone === 'nav' ? (zone = 'pane', ri = 0, render(true)) : activate(ri));
  }, true);

  addEventListener('keydown', e => {
    if (!open || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase(), n = cur().rows.length, r = cur().rows[ri], pick = r && (r.type === 'choice' || r.type === 'wall');
    if (k === 'arrowdown' || k === 'arrowup') {
      const d = k === 'arrowdown' ? 1 : -1;
      if (zone === 'nav') { ci = clamp(ci + d, 0, CATS.length - 1); ri = 0; render(); } else { ri = clamp(ri + d, 0, n - 1); render(true); }
    } else if (k === 'arrowright') {
      if (zone === 'nav') { zone = 'pane'; ri = 0; render(true); } else if (pick) { step(r, 1); render(true); }
    } else if (k === 'arrowleft') {
      if (zone === 'pane' && pick) { step(r, -1); render(true); } else if (zone === 'pane') { zone = 'nav'; render(true); }
    } else if (k === 'enter' || k === ' ' || k === 'a') {
      if (zone === 'nav') { zone = 'pane'; ri = 0; render(true); } else activate(ri);
    } else if (k === 'escape' || k === 'backspace' || k === 'b') back();
    else return;
    if (k.startsWith('arrow')) window.APP.snd(700);
    e.preventDefault(); e.stopImmediatePropagation();
  }, true);
})();
