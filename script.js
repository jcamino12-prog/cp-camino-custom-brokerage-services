const menuButton = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");
const navLinks = document.querySelectorAll("#site-nav a");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const year = document.querySelector("#year");
const serviceCards = document.querySelectorAll(".service-card");
const submitButton = contactForm?.querySelector('button[type="submit"]');
const galleryTabs = document.querySelectorAll(".gallery-tab");
const photoGrid = document.querySelector("#photo-grid");
const videoGrid = document.querySelector("#video-grid");
const lightbox = document.querySelector("#gallery-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const photoItems = Array.from({ length: 60 }, (_, index) => ({
  src: `assets/images/shipments/photo-${String(index + 1).padStart(2, "0")}.jpg`,
  alt: `CP Camino shipment photo ${index + 1}`,
}));
const videoItems = Array.from({ length: 30 }, (_, index) => ({
  src: `assets/videos/shipments/video-${String(index + 1).padStart(2, "0")}.mp4`,
  poster: `assets/images/shipments/video-${String(index + 1).padStart(2, "0")}-poster.jpg`,
  title: `CP Camino shipment video ${index + 1}`,
}));
const galleryState = { photosShown: 12, videosShown: 6, lightboxIndex: 0 };

menuButton?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });

  const createPhotoCard = (item, index) => {
    const card = document.createElement("button");
    card.className = "gallery-card gallery-photo-card";
    card.type = "button";
    card.dataset.photoIndex = String(index);
    card.innerHTML = `<img src="${item.src}" alt="${item.alt}" loading="lazy" /><span class="gallery-card-caption">Shipment ${String(index + 1).padStart(2, "0")} <b>↗</b></span>`;
    card.querySelector("img").addEventListener("error", () => card.classList.add("is-missing"));
    card.addEventListener("click", () => openLightbox(index));
    return card;
  };

  const createVideoCard = (item, index) => {
    const card = document.createElement("article");
    card.className = "gallery-card gallery-video-card";
    card.innerHTML = `<video controls preload="none" poster="${item.poster}" aria-label="${item.title}"><source data-src="${item.src}" type="video/mp4" /></video><p>${item.title}</p>`;
    const video = card.querySelector("video");
    video.addEventListener("play", () => {
      const source = video.querySelector("source");
      if (!source.src) {
        source.src = source.dataset.src;
        video.load();
        video.play().catch(() => {});
      }
    }, { once: true });
    video.addEventListener("error", () => card.classList.add("is-missing"));
    return card;
  };

  const renderGallery = () => {
    if (photoGrid) {
      photoGrid.replaceChildren(...photoItems.slice(0, galleryState.photosShown).map(createPhotoCard));
    }
    if (videoGrid) {
      videoGrid.replaceChildren(...videoItems.slice(0, galleryState.videosShown).map(createVideoCard));
    }
    document.querySelector('[data-gallery-load="photos"]')?.toggleAttribute("hidden", galleryState.photosShown >= photoItems.length);
    document.querySelector('[data-gallery-load="videos"]')?.toggleAttribute("hidden", galleryState.videosShown >= videoItems.length);
  };

  const openLightbox = (index) => {
    if (!lightbox || !lightboxImage) return;
    galleryState.lightboxIndex = index;
    lightboxImage.src = photoItems[index].src;
    lightboxImage.alt = photoItems[index].alt;
    lightbox.showModal();
  };

  const moveLightbox = (step) => {
    galleryState.lightboxIndex = (galleryState.lightboxIndex + step + photoItems.length) % photoItems.length;
    openLightbox(galleryState.lightboxIndex);
  };

  galleryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      galleryTabs.forEach((item) => {
        const selected = item === tab;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-selected", String(selected));
      });
      document.querySelectorAll(".gallery-panel").forEach((panel) => {
        panel.hidden = panel.id !== tab.getAttribute("aria-controls");
        panel.classList.toggle("is-active", !panel.hidden);
      });
    });
  });

  document.querySelector('[data-gallery-load="photos"]')?.addEventListener("click", () => {
    galleryState.photosShown = Math.min(galleryState.photosShown + 12, photoItems.length);
    renderGallery();
  });
  document.querySelector('[data-gallery-load="videos"]')?.addEventListener("click", () => {
    galleryState.videosShown = Math.min(galleryState.videosShown + 6, videoItems.length);
    renderGallery();
  });
  document.querySelector(".lightbox-close")?.addEventListener("click", () => lightbox?.close());
  document.querySelector(".lightbox-prev")?.addEventListener("click", () => moveLightbox(-1));
  document.querySelector(".lightbox-next")?.addEventListener("click", () => moveLightbox(1));
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  renderGallery();
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
