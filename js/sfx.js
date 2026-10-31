/* Sons d'ouverture : home / settings / launch (.m4a, .mp3, .wav ou .ogg).
   Le site cherche d'abord les chemins de `sounds` (data.js), puis dans les dossiers courants
   (assets/audio, assets/sounds, assets, audio, sounds, racine).
   Respecte le réglage « Sons du menu ». Si un son est introuvable ou refusé, un bip est joué
   et (tant que sounds.debug n'est pas false) un message explique pourquoi. */
(() => {
  const cfg = (window.SITE && window.SITE.sounds) || {};
  const DIRS = ['assets/audio/', 'assets/sounds/', 'assets/', 'audio/', 'sounds/', ''], EXTS = ['m4a', 'mp3', 'wav', 'ogg'];
  const files = {}, info = {}, warned = {};
  const short = u => decodeURIComponent((u || '').split('/').slice(-3).join('/'));
  const configured = name => [].concat(cfg[name] || []);
  function sources(name) {
    const base = configured(name); if (!base.length) return [];
    const extra = []; DIRS.forEach(d => EXTS.forEach(x => extra.push(d + name + '.' + x)));
    return [...new Set([...base, ...extra])];
  }
  function warn(name, msg) {
    console.warn('[SFX]', name, msg);
    if (cfg.debug !== false && !warned[name] && window.APP) { warned[name] = 1; window.APP.toast('Son « ' + name + ' » : ' + msg, 5000); }
  }
  function get(name) {
    if (name in files) return files[name];
    const srcs = sources(name); info[name] = { err: '' };
    if (!srcs.length || name === 'volume') return files[name] = null;
    const a = document.createElement('audio');
    a.preload = 'auto'; a.volume = typeof cfg.volume === 'number' ? cfg.volume : 0.8;
    srcs.forEach((s, i) => {
      const el = document.createElement('source'); el.src = s;
      if (i === srcs.length - 1) el.addEventListener('error', () => { files[name] = null; });   // plus aucun candidat
      a.appendChild(el);
    });
    a.load();
    return files[name] = a;
  }
  const vol = () => typeof cfg.volume === 'number' ? cfg.volume : 0.8;
  const missing = name => 'fichier introuvable (mets ' + name + '.m4a ou ' + name + '.mp3 dans assets/audio/)';
  window.SFX = {
    has: name => !!get(name),
    play(name) {
      if (!window.PREFS.get('sound')) return true;               // son coupé : rien à jouer
      const a = get(name); if (!a) { warn(name, missing(name)); return false; }
      a.__f = (a.__f || 0) + 1; a.volume = vol();                // annule un éventuel fondu de sortie en cours
      try { a.currentTime = 0; } catch (_) {}
      const p = a.play();
      if (p && p.catch) p.catch(e => {                           // refus ou fichier illisible : bip à la place
        info[name].err = e.name;
        warn(name, files[name] === null ? missing(name) : 'lecture impossible (' + e.name + ')');
        if (window.APP) window.APP.snd(1000);
      });
      return true;
    },
    stop(name, ms = 250) {                                       // coupe le son avec un court fondu (sons longs)
      const a = files[name]; if (!a || a.paused) return;
      const id = a.__f = (a.__f || 0) + 1, v0 = a.volume, t0 = performance.now();
      (function fade() {
        if (a.__f !== id) return;
        const k = (performance.now() - t0) / ms;
        if (k >= 1) { a.pause(); try { a.currentTime = 0; } catch (_) {} a.volume = v0; } else { a.volume = v0 * (1 - k); requestAnimationFrame(fade); }
      })();
    },
    duration: name => { const a = get(name); return a && isFinite(a.duration) ? a.duration * 1000 : 0; },
    status(name) {
      get(name); const a = files[name];
      if (!window.PREFS.get('sound')) return 'Sons désactivés (Paramètres → Affichage et son)';
      if (!a) return 'Introuvable — cherché : ' + configured(name).join(' ou ') + ' et dans assets/, audio/, sounds/';
      if (info[name].err) return 'Lecture impossible (' + info[name].err + ') — ' + short(a.currentSrc);
      if (a.readyState < 1) return 'Chargement… ' + short(a.currentSrc);
      return 'Prêt — ' + short(a.currentSrc) + ' (' + a.duration.toFixed(1) + ' s)';
    }
  };
  ['home', 'settings', 'launch'].forEach(get);                    // préchargement
})();
