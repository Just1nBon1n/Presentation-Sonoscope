let currentIndex = 0;
let isAnimating = false;

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
    }
  });

  // 5. Animation interne du SVG (Panneau Flux)
  if (index === 1) {
    // Exclure les deux premiers (Logo et fond)
    const components = "#panel-flux svg g > *:nth-child(n+3)";

    gsap.killTweensOf(components);

    // On réinitialise pour éviter les bugs si on clique plusieurs fois
    gsap.set(components, { clearProps: "all" });

    gsap.from(components, {
      opacity: 0,
      scale: 0.8,
      transformOrigin: "center",
      duration: 0.6,
      stagger: 0.03, 
      ease: "back.out(1.5)",
      delay: 1, 
    });
  }
}

// Gestion du scroll pour changer de panneau
window.addEventListener("wheel", (e) => {
  if (isAnimating) return;

  if (e.deltaY > 0) {
    // Scroll vers le bas -> Panneau suivant
    if (currentIndex < 2) changePanel(currentIndex + 1);
  } else {
    // Scroll vers le haut -> Panneau précédent
    if (currentIndex > 0) changePanel(currentIndex - 1);
  }
});

// Initialisation au chargement de la page
window.addEventListener("DOMContentLoaded", () => {
  // On s'assure que seul le premier panneau est visible au départ
  const activePanel = document.querySelector(".panel.active");
  if (activePanel) {
    gsap.set(activePanel, { visibility: "visible", opacity: 1 });
  }
});
