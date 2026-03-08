// === Gestion changement de panneaux ==========================================
let currentIndex = 0;
let isAnimating = false;
let isOverlayOpen = false;

function animatePanelComponents(panel, delay = 1) {
  if (!panel) return;

  const svg = panel.querySelector("svg");
  if (!svg) return;

  const components = Array.from(svg.children).filter((element, index) => {
    const tag = element.tagName.toLowerCase();
    // Ignore l'arriere-plan (2 premiers noeuds) et les blocs non visuels.
    return index >= 2 && tag !== "defs" && tag !== "style";
  });

  if (components.length === 0) return;

  gsap.killTweensOf(components);
  gsap.set(components, { clearProps: "all" });

  gsap.from(components, {
    opacity: 0,
    scale: 0.8,
    transformOrigin: "center",
    duration: 1,
    stagger: 0.03,
    ease: "back.out(1.5)",
    delay,
  });
}

function changePanel(index, btn) {
  const panels = document.querySelectorAll(".panel");
  const currentPanel = document.querySelector(".panel.active");
  const targetPanel = panels[index];
  const buttons = document.querySelectorAll(".nav-btn");

  // if bouton déjà actif, ne rien faire
  if (currentPanel === targetPanel) return;

  // Si une animation est déjà en cours, on ignore les clics
  if (isAnimating) return;

  // Si aniamtion en cours
  isAnimating = true;

  // 1. Détermine la direction de l'animation
  const direction = index > currentIndex ? 1 : -1;

  // 2. Mise à jour bouton actif
  buttons.forEach((b) => b.classList.remove("active"));
  buttons[index].classList.add("active");
  currentIndex = index;

  // 3. Animation de sortie du panneau actuel
  if (currentPanel) {
    gsap.to(currentPanel, {
      yPercent: -100 * direction, // Note: yPercent pour les %
      duration: 1.2,
      ease: "power2.inOut",
      onComplete: () => {
        currentPanel.classList.remove("active");
        gsap.set(currentPanel, { visibility: "hidden" });
      },
    });
  }

  // 4. Animation d'entrée du nouveau panneau
  targetPanel.classList.add("active");

  gsap.set(targetPanel, {
    visibility: "visible",
    yPercent: 100 * direction,
    opacity: 1,
  });

  gsap.to(targetPanel, {
    yPercent: 0,
    duration: 1.2,
    ease: "power2.inOut",
    onComplete: () => {
      isAnimating = false;
    },
  });

  animatePanelComponents(targetPanel, 1);
}

// Gestion du scroll pour changer de panneau
window.addEventListener("wheel", (e) => {
  if (isAnimating || isOverlayOpen) return; // BLOQUE si l'overlay est ouvert

  if (e.deltaY > 0) {
    if (currentIndex < 2) changePanel(currentIndex + 1);
  } else {
    if (currentIndex > 0) changePanel(currentIndex - 1);
  }
});

// Initialisation au chargement de la page
window.addEventListener("DOMContentLoaded", () => {
  // On s'assure que seul le premier panneau est visible au départ
  const activePanel = document.querySelector(".panel.active");
  if (activePanel) {
    gsap.set(activePanel, { visibility: "visible", opacity: 1 });
    animatePanelComponents(activePanel);
  }
});
// =============================================================================

// === JS pour gérer le Overlay ================================================
// 1. Définition des contenus pour chaque case
const contentData = {
  "source-audio": {
    title: "Source Audio",
    text: [
      "- Analyse des fichiers sources pour extraire les métadonnées et préparer le flux de traitement numérique",
      "PROBLÈME 1 : ",
      "- DRM: Digital Rights Management - Protection contre la copie pour les fichiers protégés",
      "- Les DRM bloquent l'analyse du flux audio",
      "- Oblige un loopback",
    ],
    images: ["images/image_carteSon.png"],
  },
  traitement: {
    title: "Moteur de Traitement",
    text: [
      "- Capture du flux audio après le loopback",
      "- Application des filtres audio et normalisation du gain avant le rendu final du signal vers l'interface",
      "- Filtres : 1. compression, 2. noise-gate, 3. auto-gain et 4. high-shelf",
    ],
    images: [
      "images/image_traitementAudio.png",
      "images/image_traitementAudio2.png",
      "images/image_traitementAudio3.png",
    ],
  },
  requete: {
    title: "Requête des APIs (Polling)",
    text: [
      "- Mécanisme de polling pour interroger régulièrement les APIs externes afin d'obtenir les métadonnées",
      "PROBLÈME 2 : ",
      "- L'API de Spotify impose un quota de requêtes très strict",
      "- Le support de plusieurs commande à arrêté (Audio Features)",
      "- Nécessite l'utilisation de OAuth2 (Gérer les connexions utilisateurs et les tokens d'accès pour authentifier les requêtes à l'API Spotify)",
      "- Grosse perte de temps sur cette section au début du projet, j'ai dû revoir toute la logique de récupération des données et d'authentification pour contourner les limitations de l'API",
    ],
    images: [
      "images/image_requete.jpg",
      "images/image_requete2.png",
      "images/image_requete3.png",
    ],
  },
  "last.fm": {
    title: "Last.fm API Scrobbling",
    text: [
      "- Utilise un pseudo Last.fm pour faire une requête via l'API Last.fm et récuperer le nom de la chanson et l'artiste",
    ],
    images: ["images/image_lastFm.png"],
  },
  deezer: {
    title: "Deezer API",
    text: [
      "- Intégration de l'API Deezer pour récuperer la pochette de l'album et le ISRC",
      "- ISRC : Identifiant unique sur chaque morceau musicale (Ex : DJ1234567890)",
      "- Un ISRC ouvre beaucoup de porte",
      "PROBLÈME 3 : ",
      "- Les métadonnées brutes sont souvent imprécises",
      "- Environs 5% des chaonsons ne marchait pas",
      "- Je doit utiliser un proxy (serveur intermédiaire) pour faire les requêtes à l'API Deezer, car elle ne supporte pas les requêtes directes depuis le navigateur (CORS)",
      "- Utilisation de corsproxy.io qui foncitonne bien tant qu'on respecte les limites d'utilisation (Rate Limit)",
      "CORS : Cross-Origin Resource Sharing - Mécanisme de sécurité qui bloque les requêtes vers des domaines différents de celui de la page web, nécessitant un proxy pour contourner cette restriction", 
    ],
    images: ["images/image_deezer.png"],
  },
  "recco-beats": {
    title: "Algorithme ReccoBeats",
    text: [
      "- Obtenir les Audio Features que Spotify ne donnait plus (Danceability, Energy, Valence, etc.)",
    ],
    images: ["images/image_reccoBeats.png"],
  },
  rendu: {
    title: "Rendu Three.js",
    text: [
      "- Reception du flux audio en temps réel",
      "- Reception de toute les métadonnées à chaque nouvelle chanson",
      "- Création du rendu 3D",
    ],
    images: [],
  },

  evolution: {
    title: "Évolution du projet",
    text: [],
    images: [
      "images/image_evo.png",
      "images/image_evo2.png",
      "images/image_evo3.png",
      "images/image_evo4.png",
      "images/image_evo5.png",
      "images/image_evo6.png",
    ],
  },
};

document.querySelectorAll(".case-cliquable").forEach((groupe) => {
  groupe.addEventListener("click", () => {
    const key = groupe.getAttribute("data-info");
    const data = contentData[key];

    if (data) {
      isOverlayOpen = true;

      // Générer le HTML pour les textes (plusieurs balises <p>)
      const textHtml = data.text
        .map(
          (t) =>
            `<p style="font-family: sans-serif; font-size: 1.4rem; line-height: 1.6; opacity: 0.9; margin-bottom: 20px;">${t}</p>`,
        )
        .join("");

      // Générer le HTML pour les images
      const imagesHtml = data.images
        .map(
          (url) => `
          <div style="display: flex; justify-content: center; width: 100%; margin-bottom: 30px;">
            <img src="${url}" style="max-width: 100%; max-height: 500px; width: auto; height: auto; border-radius: 10px; border: 1px solid #333;">
          </div>
        `,
        )
        .join("");

      document.getElementById("info-content").innerHTML = `
        <div class="modal-inner-content" style="width: 100%; margin: 0 auto;">
          <h1 style="color: white; font-size: 3rem; margin-bottom: 30px;">${data.title}</h1>
          
          <div class="text-section" style="margin-bottom: 40px;">
            ${textHtml}
          </div>

          <div class="image-gallery">
            ${imagesHtml}
          </div>
        </div>
      `;

      const overlay = document.getElementById("info-overlay");
      overlay.style.display = "flex";
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        ".info-panel",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
      );
    }
  });
});

function closeInfo() {
  gsap.to("#info-overlay", {
    opacity: 0,
    duration: 0.3,
    onComplete: () => {
      document.getElementById("info-overlay").style.display = "none";
      isOverlayOpen = false;
    },
  });
}

// Fermer l'overlay avec la touche Échap (Escape)
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isOverlayOpen) {
    closeInfo();
  }
});

// Fermer aussi si on clique en dehors du panneau blanc
document.getElementById("info-overlay").addEventListener("click", (e) => {
  if (e.target.id === "info-overlay") closeInfo();
});
// =============================================================================
