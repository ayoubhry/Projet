# 🌐 PK Hub - Hub Interactif de Projets Web

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](#)

Bienvenue sur le dépôt **PK Hub** par [@ayoubhry](https://github.com/ayoubhry). 

**PK Hub** est une plateforme Web centrale regroupant un portfolio interactif, des applications web autonomes et des études de cas détaillées. Elle sert de vitrine pour présenter différents projets techniques, prototypes UI/UX et outils interactifs développés en JavaScript.

---

## 📸 Aperçu des Projets Integrés

| Projet | Description | Captures / Médias |
| :--- | :--- | :--- |
| **Portfolio Interactif** | Vitrine personnelle présentant le profil, le parcours, les compétences et l'ensemble des créations. | `assets/img/portfolio.png` |
| **McDo Tracker** | Outil de suivi et d'analyse interactif permettant de catégoriser et suivre les données/commandes. | `assets/img/mcdo-tracker.png` |
| **Xbox Breakdown** | Étude de cas interactive et décomposition visuelle/technique des composants d'une console Xbox. | `assets/img/xbox-breakdown.jpg` |
| **Documentation & Hub Docs** | Espace de documentation technique pour expliciter l'architecture des projets et leurs guides d'utilisation. | `assets/img/docs.png` |

---

## ✨ Fonctionnalités Principales

- 🗂️ **Gestion Dynamique des Données** : Les projets et leurs métadonnées sont séparés de la vue et chargés dynamiquement depuis `js/data.js`.
- ⚡ **Navigation Fluide & Fast-Loading** : Conçu sans dépendances lourdes pour une vitesse de chargement optimale et une expérience utilisateur réactive.
- 📱 **Design Fully Responsive** : Interface adaptée pour tous les écrans (smartphones, tablettes, ordinateurs de bureau).
- 🎨 **Interface Moderne & Épurée** : Thème sombre/moderne avec une organisation modulaire sous forme de cartes d'exploration.

---

## 📁 Structure du Répertoire

```text
Hub/
├── assets/
│   └── img/
│       ├── docs.png             # Visuel de l'espace de documentation
│       ├── mcdo-tracker.png     # Interface de l'application McDo Tracker
│       ├── portfolio.png        # Capture principale du Portfolio
│       └── xbox-breakdown.jpg   # Graphique / Éclaté technique Xbox Breakdown
├── css/
│   └── style.css                # Style global, mise en page et responsive design
├── js/
│   ├── data.js                  # Base de données des projets (titres, tags, liens, desc)
│   └── main.js                  # Logique d'affichage et dynamique JS
├── index.html                   # Point d'entrée principal de l'application
└── README.md                    # Documentation du dépôt
```

---

## 🚀 Installation & Utilisation

Aucune installation complexe ou serveur Node.js n'est nécessaire pour exécuter ce projet localement.

### 1. Cloner le dépôt
```bash
git clone https://github.com/ayoubhry/hub.git
cd hub/Hub
```

### 2. Lancer le projet
- **Directement** : Ouvrez simplement le fichier `index.html` dans votre navigateur.
- **Avec VS Code** : Utilisez l'extension **Live Server** (clic droit sur `index.html` > *Open with Live Server*).

---

## 🛠️ Modifier ou Ajouter un Projet

Pour ajouter un nouveau projet au Hub :
1. Déposez l'image d'illustration dans `assets/img/`.
2. Ouvrez `js/data.js` et ajoutez un nouvel objet dans le tableau des projets :
   ```javascript
   {
     id: "nouveau-projet",
     title: "Titre du Projet",
     category: "Web App / Design",
     description: "Brève description du projet...",
     image: "assets/img/votre-image.png",
     link: "https://lien-vers-le-projet.com"
   }
   ```
3. Sauvegardez : `js/main.js` prendra automatiquement en charge l'affichage !

---

## 🧰 Technologies & Outils

- **Frontend** : HTML5, CSS3 (Flexbox/Grid), JavaScript ES6+
- **Assets & Visuels** : PNG / JPG personnalisés
- **Hébergement suggéré** : GitHub Pages / Vercel / Netlify

---

## 👤 Auteur

- **Ayoub Hry** - [@ayoubhry](https://github.com/ayoubhry)

---

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.