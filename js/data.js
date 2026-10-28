/* ---- À MODIFIER : le contenu du site se règle ici ----
   img   : visuel de la tuile (dossier assets/img)
   fit   : 'icon' = icône centrée sur le dégradé, 'cover' = visuel plein cadre
   light : true si le dégradé est clair (texte foncé sur la page du projet) */
window.SITE = {
  gh: 'ayoubhry',
  projects: [
    { repo: 'portfolio', name: 'Portfolio', img: 'assets/img/portfolio.png', fit: 'icon', bg: ['#0f3057', '#2a8fd6'],
      live: 'https://ayoubhry.github.io/portfolio',
      desc: 'Mon portfolio personnel en une seule page : animation canvas, effet machine à écrire, animations au scroll et affichage adapté au mobile.',
      tags: ['HTML', 'CSS', 'JavaScript'] },
    { repo: 'docs', name: 'Docs', img: 'assets/img/docs.png', fit: 'icon', bg: ['#eef2fb', '#b9cbf2'], light: true,
      desc: 'Dépôt de documentation en HTML, CSS et JavaScript.',
      tags: ['HTML', 'CSS', 'JavaScript'] },
    { repo: 'mcdo-tracker', name: 'Mcdo Tracker', img: 'assets/img/mcdo-tracker.png', fit: 'icon', bg: ['#ffc72c', '#ffe58a'], light: true,
      desc: "Interface web locale qui récupère les menus UberEats des McDonald's de Caen et les affiche sur une carte interactive, avec recherche d'un produit dans tous les restaurants.",
      tags: ['Python', 'Flask', 'Playwright', 'Leaflet'] },
    { repo: 'Xbox-Breakdown', name: 'Xbox Breakdown', img: 'assets/img/xbox-breakdown.jpg', fit: 'cover', bg: ['#000', '#000'], state: 'En développement',
      desc: "Application Windows d'aide au diagnostic des consoles Xbox : à partir des symptômes, elle guide les tests et fait évoluer les causes possibles.",
      tags: ['C#', '.NET', 'SQLite'] }
  ],
  cv: 'https://ayoubhry.github.io/portfolio/assets/cv/CV_Houraoui.pdf'
};
