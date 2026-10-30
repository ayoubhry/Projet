/* ---- À MODIFIER : le contenu du site se règle ici ----
   img   : visuel de la tuile (dossier assets/img)
   fit   : 'icon' = icône centrée sur le dégradé, 'cover' = visuel plein cadre
   light : true si le dégradé est clair (texte foncé sur la page du projet)
   open  : où mène « A » / le clic sur la tuile. Par défaut le dépôt GitHub ; 'live' = le site du projet (si `live` existe) */
window.SITE = {
  gh: 'ayoubhry',
  bootMs: 3600,              // durée de l'écran de chargement (ms)
  recent: 'Xbox-Breakdown',  // projet « récent » par défaut (remplacé automatiquement par le dépôt mis à jour le plus récemment)
  projects: [
    { repo: 'portfolio', name: 'Portfolio', img: 'assets/img/portfolio.png', fit: 'icon', bg: ['#0f3057', '#2a8fd6'],
      live: 'https://ayoubhry.github.io/portfolio/', open: 'live',
      desc: 'Mon portfolio personnel en une seule page : animation canvas, effet machine à écrire, animations au scroll et affichage adapté au mobile.',
      tags: ['HTML', 'CSS', 'JavaScript'] },
    { repo: 'docs', name: 'Docs', img: 'assets/img/docs.svg', fit: 'icon', bg: ['#eef2fb', '#b9cbf2'], light: true,
      live: 'https://ayoubhry.github.io/docs/', open: 'live',
      desc: 'Site de documentation en HTML, CSS et JavaScript.',
      tags: ['HTML', 'CSS', 'JavaScript'] },
    { repo: 'mcdo-tracker', name: 'Mcdo Tracker', img: 'assets/img/mcdo-tracker.png', fit: 'icon', bg: ['#070d24', '#1a2d66'],
      desc: "Interface web locale qui récupère les menus UberEats des McDonald's de Caen et les affiche sur une carte interactive, avec recherche d'un produit dans tous les restaurants.",
      tags: ['Python', 'Flask', 'Playwright', 'Leaflet'] },
    { repo: 'Xbox-Breakdown', name: 'Xbox Breakdown', img: 'assets/img/xbox-breakdown.jpg', fit: 'cover', bg: ['#000', '#000'], state: 'En développement',
      live: 'https://ayoubhry.github.io/Xbox-Breakdown/', open: 'live',
      desc: "Application Windows d'aide au diagnostic des consoles Xbox : à partir des symptômes, elle guide les tests et fait évoluer les causes possibles.",
      tags: ['C#', '.NET', 'SQLite'] }
  ],
  /* Compétences : une ligne = un bloc. Colle ici celles de ton profil LinkedIn (Profil > Compétences). */
  skills: [
    { t: 'Développement web', n: 'Portfolio, Docs et interface de Mcdo Tracker', items: ['HTML 5', 'CSS 3', 'JavaScript', 'GitHub Pages'] },
    { t: 'Python', n: 'Serveur, scraping et carte dans Mcdo Tracker', items: ['Flask', 'Playwright', 'API REST', 'Leaflet'] },
    { t: 'Applications Windows', n: 'Xbox Breakdown, en développement', items: ['C#', '.NET', 'SQLite'] },
    { t: 'BTS SIO option SISR', n: "Les 3 blocs de compétences du diplôme", items: ['Support et services informatiques', 'Administration systèmes et réseaux', 'Cybersécurité'] }
  ]
};
