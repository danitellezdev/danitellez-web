(() => {
  const storageKey = "danitellez-cookie-consent-v1";
  const consentDuration = 180 * 24 * 60 * 60 * 1000;
  // Add a GA4 measurement ID only after updating the privacy and cookie notices.
  const analyticsMeasurementId = "";
  const policyUrl = "politica-cookies.html";
  let consent = null;
  let storageAvailable = true;
  let analyticsLoaded = false;
  let focusReturnTarget = null;

  try {
    const savedConsent = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (
      savedConsent
      && savedConsent.version === 1
      && typeof savedConsent.optional === "boolean"
      && Number.isFinite(savedConsent.expiresAt)
      && savedConsent.expiresAt > Date.now()
    ) {
      consent = savedConsent;
    } else if (savedConsent) {
      localStorage.removeItem(storageKey);
    }
  } catch (error) {
    storageAvailable = false;
    console.warn("No se pudo leer la preferencia de cookies; se mantendrán bloqueados los servicios opcionales.", error);
  }

  const banner = document.createElement("section");
  banner.className = "cookie-banner";
  banner.setAttribute("aria-labelledby", "cookie-banner-title");
  banner.setAttribute("aria-live", "polite");
  banner.hidden = true;
  banner.innerHTML = `
    <div class="cookie-banner-copy">
      <h2 id="cookie-banner-title">Tu privacidad importa</h2>
      <p>Usamos almacenamiento esencial para recordar tu elección. Vimeo solo se activa si aceptas las cookies opcionales y reproduces el vídeo. <a href="${policyUrl}">Lee la política de cookies</a>.</p>
    </div>
    <div class="cookie-banner-actions">
      <button class="cookie-button cookie-button-accept" type="button" data-cookie-choice="accept">Aceptar opcionales</button>
      <button class="cookie-button" type="button" data-cookie-choice="reject">Rechazar opcionales</button>
      <a href="${policyUrl}">Más información</a>
    </div>`;
  document.body.append(banner);

  const loadAnalytics = () => {
    if (!analyticsMeasurementId || !consent?.optional || analyticsLoaded) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    window.gtag("js", new Date());
    window.gtag("config", analyticsMeasurementId);

    const analyticsScript = document.createElement("script");
    analyticsScript.async = true;
    analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsMeasurementId)}`;
    analyticsScript.onerror = () => console.error("No se pudo cargar Google Analytics.");
    document.head.append(analyticsScript);
    analyticsLoaded = true;
  };

  const updateVisibility = () => {
    banner.hidden = consent !== null;
    if (banner.hidden && banner.contains(document.activeElement)) document.activeElement.blur();
    if (consent?.optional) loadAnalytics();
  };

  const saveChoice = (optional) => {
    consent = {
      version: 1,
      optional,
      savedAt: Date.now(),
      expiresAt: Date.now() + consentDuration,
    };

    if (storageAvailable) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(consent));
      } catch (error) {
        storageAvailable = false;
        console.warn("No se pudo guardar la preferencia de cookies; la elección solo durará en esta página.", error);
      }
    }

    updateVisibility();
    if (focusReturnTarget?.isConnected) focusReturnTarget.focus();
    focusReturnTarget = null;
    window.dispatchEvent(new CustomEvent("cookieconsentchange", { detail: { optional } }));
  };

  const openSettings = () => {
    focusReturnTarget = document.activeElement;
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      storageAvailable = false;
      console.warn("No se pudo retirar la preferencia guardada; los servicios opcionales seguirán desactivados hasta una nueva elección.", error);
    }
    consent = null;
    banner.hidden = false;
    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }
    window.dispatchEvent(new CustomEvent("cookieconsentchange", { detail: { optional: false } }));
    banner.querySelector("[data-cookie-choice='accept']").focus();
  };

  banner.addEventListener("click", (event) => {
    const choiceButton = event.target.closest("[data-cookie-choice]");
    if (!choiceButton) return;
    saveChoice(choiceButton.dataset.cookieChoice === "accept");
  });

  document.querySelectorAll("[data-cookie-settings]").forEach((control) => {
    control.addEventListener("click", (event) => {
      event.preventDefault();
      openSettings();
    });
  });

  window.siteCookieConsent = {
    hasConsent: (service) => service === "vimeo" || service === "analytics" ? Boolean(consent?.optional) : false,
    openSettings,
  };

  updateVisibility();
})();
