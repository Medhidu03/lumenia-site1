// Particules interactives
tsParticles.load("tsparticles", {
  fpsLimit: 60,
  particles: {
    number: { value: 80, density: { enable: true, value_area: 800 } },
    color: { value: ["#ff6ec4", "#7873f5", "#00ffff"] },
    shape: { type: "circle" },
    opacity: { value: 0.5, random: true },
    size: { value: { min:1, max:4 }, random: true },
    move: { enable: true, speed:0.8, direction:"none", random:true, out_mode:"out" }
  },
  interactivity: {
    events: { 
      onhover: { enable: true, mode: "repulse" }, 
      onclick: { enable: true, mode: "push" },
      onmousemove: { enable: true, mode: "trail" }
    },
    modes: { repulse: { distance: 150 }, push: { quantity: 4 }, trail: { delay: 0.005, quantity: 2 } }
  },
  detectRetina: true
});

// Date et heure dynamiques
function updateDateTime() {
  const dt = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = dt.toLocaleDateString('fr-FR', options);
  const timeStr = dt.toLocaleTimeString('fr-FR');
  const dateEl = document.getElementById("date-time");
  if(dateEl) dateEl.innerText = `${dateStr} - ${timeStr}`;
}
setInterval(updateDateTime, 1000);
updateDateTime();

// ----- TRAIL LUMINEUX DERRIERE LE CURSEUR -----
document.addEventListener("mousemove", function(e) {
    const trail = document.createElement("div");
    trail.className = "cursor-trail";
    trail.style.left = e.pageX + "px";
    trail.style.top = e.pageY + "px";
    document.body.appendChild(trail);
    setTimeout(() => {
        trail.remove();
    }, 800); // disparition après 0.8s
});
