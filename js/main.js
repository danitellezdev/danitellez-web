(() => {
  document.documentElement.classList.add("js");

  const year = document.querySelector("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  const revealItems = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => observer.observe(item));
  }

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.getAttribute("data-filter");
      if (!category) return;

      document.querySelectorAll("[data-filter]").forEach((filterButton) => {
        const isActive = filterButton === button;
        filterButton.classList.toggle("is-active", isActive);
        filterButton.setAttribute("aria-pressed", String(isActive));
      });

      document.querySelectorAll("[data-category]").forEach((item) => {
        item.hidden = category !== "all" && item.getAttribute("data-category") !== category;
      });
    });
  });

  let pauseBookCarousel = () => {};
  let resumeBookCarousel = () => {};
  const bookCarousel = document.querySelector("[data-book-carousel]");
  if (bookCarousel) {
    const slides = Array.from(bookCarousel.querySelectorAll(".book-carousel-slide"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let currentSlide = 0;
    let isPaused = reducedMotion.matches;
    let autoplayTimer = 0;

    const stopAutoplayTimer = () => {
      window.clearInterval(autoplayTimer);
      autoplayTimer = 0;
    };

    const startAutoplayTimer = () => {
      if (isPaused || autoplayTimer || slides.length < 2 || document.hidden) return;
      autoplayTimer = window.setInterval(() => showSlide(currentSlide - 1), 5000);
    };

    const pauseAutoplay = () => {
      isPaused = true;
      stopAutoplayTimer();
    };

    const resumeAutoplay = () => {
      isPaused = false;
      startAutoplayTimer();
    };

    pauseBookCarousel = pauseAutoplay;
    resumeBookCarousel = () => {
      if (!reducedMotion.matches) resumeAutoplay();
    };

    function showSlide(index) {
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const isPrevious = slideIndex === (currentSlide - 1 + slides.length) % slides.length;
        const isCurrent = slideIndex === currentSlide;
        const isNext = slideIndex === (currentSlide + 1) % slides.length;

        slide.hidden = !isPrevious && !isCurrent && !isNext;
        slide.classList.toggle("is-previous", isPrevious);
        slide.classList.toggle("is-current", isCurrent);
        slide.classList.toggle("is-next", isNext);
        slide.setAttribute(
          "aria-label",
          isCurrent ? "Ampliar fotografía central" : `Seleccionar fotografía a la ${isPrevious ? "izquierda" : "derecha"}`
        );
      });
    }

    bookCarousel.querySelector("[data-carousel-previous]")?.addEventListener("click", () => {
      showSlide(currentSlide + 1);
    });

    bookCarousel.querySelector("[data-carousel-next]")?.addEventListener("click", () => {
      showSlide(currentSlide - 1);
    });

    slides.forEach((slide, index) => {
      slide.addEventListener("click", (event) => {
        if (slide.classList.contains("is-current")) {
          pauseAutoplay();
          return;
        }

        event.stopImmediatePropagation();
        showSlide(index);
      });
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAutoplayTimer();
      else startAutoplayTimer();
    });

    showSlide(currentSlide);
    startAutoplayTimer();
  }

  let pauseProjectCarousels = () => {};
  let resumeProjectCarousels = () => {};
  const projectCarouselControls = [];
  const projectReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll("[data-project-carousel]").forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll(".project-photo-slide"));
    let currentSlide = 0;
    let autoplayTimer = 0;
    let isPaused = projectReducedMotion.matches;
    let isHovered = false;
    let isFocused = false;

    const stopAutoplay = () => {
      window.clearInterval(autoplayTimer);
      autoplayTimer = 0;
    };

    const showProjectSlide = (index, direction) => {
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const isCurrent = slideIndex === currentSlide;
        slide.hidden = !isCurrent;
        slide.classList.toggle("is-entering-from-right", isCurrent && direction === "right");
        slide.classList.toggle("is-entering-from-left", isCurrent && direction === "left");
        if (isCurrent) {
          const projectName = carousel.getAttribute("aria-label").replace(/^Fotografías de /, "");
          slide.setAttribute("aria-label", `Ampliar fotografía ${slideIndex + 1} de ${projectName}`);
        }
      });
    };

    const startAutoplay = () => {
      if (isPaused || isHovered || isFocused || autoplayTimer || slides.length < 2 || document.hidden || projectReducedMotion.matches) return;
      autoplayTimer = window.setInterval(() => showProjectSlide(currentSlide + 1, "right"), 5000);
    };

    const pauseAutoplay = () => {
      isPaused = true;
      stopAutoplay();
    };

    const resumeAutoplay = () => {
      isPaused = false;
      startAutoplay();
    };

    projectCarouselControls.push({ pause: pauseAutoplay, resume: resumeAutoplay });

    carousel.querySelector("[data-project-previous]")?.addEventListener("click", () => {
      showProjectSlide(currentSlide - 1, "left");
    });

    carousel.querySelector("[data-project-next]")?.addEventListener("click", () => {
      showProjectSlide(currentSlide + 1, "right");
    });

    carousel.addEventListener("mouseenter", () => {
      isHovered = true;
      stopAutoplay();
    });

    carousel.addEventListener("mouseleave", () => {
      isHovered = false;
      startAutoplay();
    });

    carousel.addEventListener("focusin", () => {
      isFocused = true;
      stopAutoplay();
    });

    carousel.addEventListener("focusout", (event) => {
      if (carousel.contains(event.relatedTarget)) return;
      isFocused = false;
      startAutoplay();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });

    showProjectSlide(currentSlide, "right");
    startAutoplay();
  });
  pauseProjectCarousels = () => projectCarouselControls.forEach((carousel) => carousel.pause());
  resumeProjectCarousels = () => projectCarouselControls.forEach((carousel) => carousel.resume());

  const theaterCarousel = document.querySelector("[data-theater-carousel]");
  const theaterGalleryDialog = document.querySelector(".theater-gallery-dialog");
  const theaterGalleryGrid = theaterGalleryDialog?.querySelector(".theater-gallery-grid");
  const theaterTrack = theaterCarousel?.querySelector(".theater-carousel-track");
  const theaterSlides = theaterTrack ? Array.from(theaterTrack.querySelectorAll(".theater-carousel-slide")) : [];
  const theaterReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let currentTheaterSlide = 0;
  let theaterAutoplayTimer = 0;
  let theaterIsHovered = false;
  let theaterIsFocused = false;

  const stopTheaterAutoplay = () => {
    window.clearInterval(theaterAutoplayTimer);
    theaterAutoplayTimer = 0;
  };

  const showTheaterSlide = (index) => {
    if (!theaterSlides.length) return;
    currentTheaterSlide = (index + theaterSlides.length) % theaterSlides.length;
    theaterSlides.forEach((slide, slideIndex) => {
      const isPrevious = slideIndex === (currentTheaterSlide - 1 + theaterSlides.length) % theaterSlides.length;
      const isCurrent = slideIndex === currentTheaterSlide;
      const isNext = slideIndex === (currentTheaterSlide + 1) % theaterSlides.length;
      slide.hidden = !isPrevious && !isCurrent && !isNext;
      slide.classList.toggle("is-previous", isPrevious);
      slide.classList.toggle("is-current", isCurrent);
      slide.classList.toggle("is-next", isNext);
      slide.setAttribute(
        "aria-label",
        `Abrir galería de teatro desde fotografía ${slideIndex + 1}${isCurrent ? ", central" : ""}`
      );
    });
  };

  const startTheaterAutoplay = () => {
    if (theaterAutoplayTimer || theaterIsHovered || theaterIsFocused || theaterReducedMotion.matches || document.hidden || theaterSlides.length < 2) return;
    theaterAutoplayTimer = window.setInterval(() => showTheaterSlide(currentTheaterSlide - 1), 5000);
  };

  theaterCarousel?.querySelector("[data-theater-previous]")?.addEventListener("click", () => {
    showTheaterSlide(currentTheaterSlide + 1);
  });

  theaterCarousel?.querySelector("[data-theater-next]")?.addEventListener("click", () => {
    showTheaterSlide(currentTheaterSlide - 1);
  });

  theaterCarousel?.addEventListener("mouseenter", () => {
    theaterIsHovered = true;
    stopTheaterAutoplay();
  });
  theaterCarousel?.addEventListener("mouseleave", () => {
    theaterIsHovered = false;
    startTheaterAutoplay();
  });
  theaterCarousel?.addEventListener("focusin", () => {
    theaterIsFocused = true;
    stopTheaterAutoplay();
  });
  theaterCarousel?.addEventListener("focusout", (event) => {
    if (theaterCarousel.contains(event.relatedTarget)) return;
    theaterIsFocused = false;
    startTheaterAutoplay();
  });

  theaterSlides.forEach((slide, index) => {
    slide.addEventListener("click", () => {
      if (!slide.classList.contains("is-current")) {
        showTheaterSlide(index);
        return;
      }
      if (!theaterGalleryDialog || !theaterGalleryGrid) return;
      const images = Array.from(theaterCarousel.querySelectorAll(".theater-carousel-slide img"));
      theaterGalleryGrid.replaceChildren(...images.map((image) => {
        const photoButton = document.createElement("button");
        photoButton.type = "button";
        photoButton.className = "theater-gallery-photo";
        photoButton.setAttribute("aria-label", `Ampliar ${image.alt}`);
        const galleryImage = document.createElement("img");
        galleryImage.src = image.currentSrc || image.src;
        galleryImage.alt = image.alt;
        galleryImage.loading = "lazy";
        photoButton.append(galleryImage);
        return photoButton;
      }));
      pauseBookCarousel();
      pauseProjectCarousels();
      stopTheaterAutoplay();
      theaterGalleryDialog.showModal();
    });
  });

  theaterGalleryDialog?.querySelector(".lightbox-close")?.addEventListener("click", () => theaterGalleryDialog.close());
  theaterGalleryDialog?.addEventListener("click", (event) => {
    if (event.target === theaterGalleryDialog) theaterGalleryDialog.close();
  });
  theaterGalleryDialog?.addEventListener("close", () => {
    resumeBookCarousel();
    resumeProjectCarousels();
    startTheaterAutoplay();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopTheaterAutoplay();
    else startTheaterAutoplay();
  });
  showTheaterSlide(currentTheaterSlide);
  startTheaterAutoplay();

  const lightbox = document.querySelector(".lightbox");
  const lightboxImage = lightbox?.querySelector("img");
  const lightboxCaption = lightbox?.querySelector("p");

  theaterGalleryGrid?.addEventListener("click", (event) => {
    const button = event.target.closest(".theater-gallery-photo");
    const image = button?.querySelector("img");
    if (!image || !lightbox || !lightboxImage || !lightboxCaption) return;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = image.alt;
    lightbox.showModal();
  });

  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      if (item.closest("[data-theater-carousel]")) return;
      if (item.classList.contains("book-carousel-slide") && !item.classList.contains("is-current")) return;
      const image = item.querySelector("img");
      if (!image || !lightbox || !lightboxImage || !lightboxCaption) return;
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt;
      lightboxCaption.textContent = item.querySelector(".gallery-caption")?.textContent ?? "";
      pauseProjectCarousels();
      lightbox.showModal();
    });
  });

  lightbox?.querySelector(".lightbox-close")?.addEventListener("click", () => lightbox.close());
  lightbox?.addEventListener("close", () => {
    resumeBookCarousel();
    resumeProjectCarousels();
  });
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  const cnnvGallery = document.querySelector("[data-cnnv-gallery]");
  const cnnvPhotoDialog = document.querySelector(".cnnv-photo-dialog");
  const cnnvPhotoDialogImage = cnnvPhotoDialog?.querySelector("img");

  cnnvGallery?.querySelector("[data-cnnv-previous]")?.addEventListener("click", () => {
    const track = cnnvGallery.querySelector(".cnnv-press-gallery-grid");
    if (track) track.scrollBy({ left: -track.clientWidth, behavior: "smooth" });
  });
  cnnvGallery?.querySelector("[data-cnnv-next]")?.addEventListener("click", () => {
    const track = cnnvGallery.querySelector(".cnnv-press-gallery-grid");
    if (track) track.scrollBy({ left: track.clientWidth, behavior: "smooth" });
  });
  cnnvGallery?.addEventListener("click", (event) => {
    const button = event.target.closest(".cnnv-gallery-slide");
    const image = button?.querySelector("img");
    if (!image || !cnnvPhotoDialog || !cnnvPhotoDialogImage) return;
    cnnvPhotoDialogImage.src = image.currentSrc || image.src;
    cnnvPhotoDialogImage.alt = image.alt;
    cnnvPhotoDialog.showModal();
  });
  cnnvPhotoDialog?.querySelector(".lightbox-close")?.addEventListener("click", () => cnnvPhotoDialog.close());
  cnnvPhotoDialog?.addEventListener("click", (event) => {
    if (event.target === cnnvPhotoDialog) cnnvPhotoDialog.close();
  });

  const showreel = document.querySelector(".showreel-page");
  const showreelPlayButton = showreel?.querySelector(".showreel-play");
  const showreelFrame = showreel?.querySelector(".showreel-player iframe");
  const videoConsentMessage = showreel?.querySelector(".video-consent-message");
  const videoConsentSettings = showreel?.querySelector("[data-video-settings]");

  showreelPlayButton?.addEventListener("click", () => {
    const videoUrl = showreelFrame?.getAttribute("data-video-url");
    if (!videoUrl || !showreelFrame || !showreel) return;

    if (!window.siteCookieConsent?.hasConsent("vimeo")) {
      if (videoConsentMessage) videoConsentMessage.textContent = "Para reproducir el videobook, primero acepta las cookies opcionales.";
      if (videoConsentSettings) videoConsentSettings.hidden = false;
      return;
    }

    if (videoConsentMessage) videoConsentMessage.textContent = "";
    if (videoConsentSettings) videoConsentSettings.hidden = true;
    showreelFrame.src = videoUrl;
    showreel.classList.add("is-playing");
  });

  videoConsentSettings?.addEventListener("click", () => window.siteCookieConsent?.openSettings());
  document.addEventListener("cookieconsentchange", (event) => {
    if (event.detail.optional) return;
    if (showreelFrame) showreelFrame.removeAttribute("src");
    showreel?.classList.remove("is-playing");
  });

  const videoDialog = document.querySelector(".video-dialog");
  const videoFrame = videoDialog?.querySelector(".video-frame");

  document.querySelectorAll(".video-trigger").forEach((button) => {
    button.addEventListener("click", () => {
      const videoUrl = button.getAttribute("data-video-url");
      if (!videoUrl || !videoDialog || !videoFrame) return;

      const iframe = document.createElement("iframe");
      iframe.src = videoUrl;
      iframe.title = button.getAttribute("aria-label") ?? "Videobook de Dani Téllez";
      iframe.allow = "autoplay; encrypted-media; picture-in-picture";
      iframe.allowFullscreen = true;
      videoFrame.replaceChildren(iframe);
      videoDialog.showModal();
    });
  });

  const closeVideo = () => {
    if (!videoDialog || !videoFrame) return;
    videoFrame.replaceChildren();
    if (videoDialog.open) videoDialog.close();
  };

  videoDialog?.querySelector(".video-close")?.addEventListener("click", closeVideo);
  videoDialog?.addEventListener("click", (event) => {
    if (event.target === videoDialog) closeVideo();
  });
  videoDialog?.addEventListener("close", () => videoFrame?.replaceChildren());
})();
