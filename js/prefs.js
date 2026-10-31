/* Préférences enregistrées dans le navigateur (localStorage) et appliquées à la page. */
(() => {
  const root = document.documentElement;
  const D = { theme: 'auto', wall: 'plain', accent: 'cyan', clock24: true, sound: true, anim: true, depth: true, intro: true };
  let v = { ...D }; const subs = [];
  try { Object.assign(v, JSON.parse(localStorage.getItem('prefs') || '{}')); } catch (_) {}
  const mq = matchMedia('(prefers-color-scheme: dark)');
  function apply() {
    root.dataset.theme = v.theme === 'auto' ? (mq.matches ? 'dark' : 'light') : v.theme;
    root.dataset.accent = v.accent; root.dataset.anim = v.anim ? 'on' : 'off';
    const fx = document.getElementById('bgfx'); if (fx) fx.className = 'wp-' + v.wall;
    const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = getComputedStyle(root).getPropertyValue('--bg').trim();
  }
  const save = () => { try { localStorage.setItem('prefs', JSON.stringify(v)); } catch (_) {} };
  window.PREFS = {
    D, get: k => v[k], on: f => subs.push(f),
    set(k, x) { v[k] = x; save(); apply(); subs.forEach(f => f(k)); },
    reset() { v = { ...D }; save(); apply(); subs.forEach(f => f('*')); }
  };
  mq.addEventListener && mq.addEventListener('change', apply);
  apply();
  // filet de sécurité : si js/sfx.js n'est pas chargé, les appels aux sons ne font plus planter le site
  window.SFX = { has: () => false, play: () => false, stop() {}, duration: () => 0, status: () => 'js/sfx.js non chargé : ajoute-le aux scripts de index.html (voir la ligne js/sfx.js)' };
  // effet de profondeur : le fond suit légèrement la souris
  addEventListener('mousemove', e => {
    if (!v.depth || !v.anim) return;
    root.style.setProperty('--mx', (e.clientX / innerWidth - .5).toFixed(3));
    root.style.setProperty('--my', (e.clientY / innerHeight - .5).toFixed(3));
  }, { passive: true });
})();
