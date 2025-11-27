// Validación simple del formulario de contacto
document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      const name = contactForm.querySelector('input[name="name"]');
      const email = contactForm.querySelector('input[name="email"]');
      if (!name.value.trim() || !email.value.trim()) {
        alert("Por favor, completa tu nombre y correo electrónico.");
        e.preventDefault();
      } else {
        alert("¡Mensaje enviado correctamente!");
      }
    });
  }

  // Menú hamburguesa para móviles
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("active");
    });
  }

  // Scroll suave para enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Acordeón simple para preguntas frecuentes (FAQ)
  document.querySelectorAll(".faq-item h4").forEach((question) => {
    question.style.cursor = "pointer";
    question.addEventListener("click", function () {
      const answer = this.nextElementSibling;
      if (answer && answer.style.display !== "block") {
        answer.style.display = "block";
      } else if (answer) {
        answer.style.display = "none";
      }
    });
  });
});
