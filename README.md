# BrawlStars Tracker

📊 **BrawlStars Tracker** — Application Next.js 15 + TypeScript permettant de consulter en détail les statistiques d’un joueur et de ses brawlers.
Affiche les complétions (Star Powers, Gadgets, Gears), analyse des 20 dernières parties pour chaque brawler, historique de trophées, winrate, et plus.
Mode **Dark/Light**, images officielles via **Brawlify**, et API proxifiée via `/api` pour protéger la clé Brawl Stars.

---

## ✨ Fonctionnalités

* **Profil joueur complet**

  * Niveau, club, trophées actuels & record
  * Liste des brawlers possédés et non possédés
  * Skins disponibles (sélection locale)
* **Stats par brawler**

  * Trophées, rang, power level
  * Complétions Star Powers / Gadgets / Gears
  * Analyse des 20 dernières parties avec ce brawler
  * Winrate global & par mode
  * Série de victoires/défaites
* **Cosmétiques**

  * Liste complète des skins
  * Gestion locale de la possession
* **Interface**

  * Mode sombre & clair
  * Cartes visuelles avec icônes
  * Responsive desktop/mobile
* **Backend**

  * Proxy API Brawl Stars via `/api` (protection clé)
  * Récupération données via [Brawlify](https://brawlify.com/) pour les assets/images

---

## 📸 Aperçu

![Player Dashboard](docs/screenshots/player-dashboard.png)
![Brawler Details](docs/screenshots/brawler-details.png)
![Skins List](docs/screenshots/skins-list.png)

---

## 🚀 Installation

### 1️⃣ Cloner le repo

```bash
git clone https://github.com/ton-user/brawlstars-tracker.git
cd brawlstars-tracker
```

### 2️⃣ Installer les dépendances

```bash
npm install
```

### 3️⃣ Configurer les variables d’environnement

Créer un fichier `.env.local` :

```env
BRAWL_API_TOKEN=ta_cle_api_brawlstars
BRAWL_API_BASE=https://api.brawlstars.com/v1
```

> ⚠️ Clé API à créer sur [developer.brawlstars.com](https://developer.brawlstars.com/) et configurer l’adresse IP autorisée.

### 4️⃣ Lancer en développement

```bash
npm run dev
```

Site accessible sur [http://localhost:3000](http://localhost:3000).

---

## 🛠 Technologies

* **Next.js 15** (App Router)
* **TypeScript**
* **TailwindCSS**
* **Brawl Stars API**
* **Brawlify** (images & assets)
* **Chart.js** (stats graphiques)

---

## 📌 TODO / Améliorations

* [ ] Gestion des Hypercharges
* [ ] Filtre avancé battlelog par mode
* [ ] Affichage des meilleures performances
* [ ] Classements globaux & clubs
* [ ] Comparateur multi-joueurs

---

## 📜 Licence

MIT © 2025 — Projet personnel non affilié à Supercell.
Les marques et assets appartiennent à **Supercell**.

---