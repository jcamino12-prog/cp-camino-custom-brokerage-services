const menuButton = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");
const navLinks = document.querySelectorAll("#site-nav a");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const year = document.querySelector("#year");
const serviceCards = document.querySelectorAll(".service-card");
const submitButton = contactForm?.querySelector('button[type="submit"]');

menuButton?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

const selectService = (selectedCard) => {
  serviceCards.forEach((card) => {
    const isSelected = card === selectedCard;
    card.classList.toggle("service-card-active", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });
};

serviceCards.forEach((card) => {
  card.addEventListener("click", () => selectService(card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectService(card);
    }
  });
});

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!submitButton) return;

  const originalButtonText = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.innerHTML = "Sending...";
  formStatus.textContent = "Sending...";
  formStatus.dataset.state = "sending";
  contactForm.setAttribute("aria-busy", "true");

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: new FormData(contactForm),
      headers: { Accept: "application/json" },
    });

    let result = {};
    try {
      result = await response.json();
    } catch {
      result = {};
    }

    if (!response.ok || result.success === false) {
      throw new Error(result.message || "The email service could not accept the enquiry.");
    }

    const name = String(new FormData(contactForm).get("name") || "").trim();
    formStatus.textContent = `Thanks${name ? `, ${name}` : ""}! Your enquiry was sent successfully.`;
    formStatus.dataset.state = "success";
    contactForm.reset();
  } catch (error) {
    formStatus.textContent = error instanceof Error
      ? `Unable to send your enquiry: ${error.message}`
      : "Unable to send your enquiry. Please try again.";
    formStatus.dataset.state = "error";
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
    contactForm.setAttribute("aria-busy", "false");
  }
});

if (year) year.textContent = String(new Date().getFullYear());
