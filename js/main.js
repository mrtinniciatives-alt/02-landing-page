/**
 * Initializes the responsive navigation and its keyboard behavior.
 */
const initMobileMenu = () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const primaryNav = document.querySelector("#primary-nav");

  if (!menuToggle || !primaryNav) return;

  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    primaryNav.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    primaryNav.classList.toggle("is-open", !isExpanded);
  });

  primaryNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || menuToggle.getAttribute("aria-expanded") !== "true") return;
    closeMenu();
    menuToggle.focus();
  });
};

/**
 * Expands or collapses a FAQ panel while keeping its height animatable.
 * @param {HTMLButtonElement} button - The FAQ trigger.
 * @param {HTMLElement} panel - The associated answer panel.
 * @param {boolean} expanded - Whether the panel should be open.
 */
const setAccordionPanel = (button, panel, expanded) => {
  button.setAttribute("aria-expanded", String(expanded));

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    panel.hidden = !expanded;
    panel.style.height = expanded ? "auto" : "0px";
    return;
  }

  if (expanded) {
    panel.hidden = false;
    panel.style.height = "0px";
    panel.getBoundingClientRect();
    panel.style.height = `${panel.scrollHeight}px`;
    panel.addEventListener("transitionend", (event) => {
      if (event.propertyName === "height" && button.getAttribute("aria-expanded") === "true") {
        panel.style.height = "auto";
      }
    }, { once: true });
    return;
  }

  panel.style.height = `${panel.scrollHeight}px`;
  panel.getBoundingClientRect();
  panel.style.height = "0px";
  panel.addEventListener("transitionend", (event) => {
    if (event.propertyName === "height" && button.getAttribute("aria-expanded") === "false") {
      panel.hidden = true;
    }
  }, { once: true });
};

/**
 * Initializes the FAQ accordion and ensures only one answer is open at a time.
 */
const initAccordion = () => {
  const questions = document.querySelectorAll(".faq-question");

  questions.forEach((button) => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    if (!panel) return;

    const isExpanded = button.getAttribute("aria-expanded") === "true";
    panel.hidden = !isExpanded;
    panel.style.height = isExpanded ? "auto" : "0px";

    button.addEventListener("click", () => {
      const shouldExpand = button.getAttribute("aria-expanded") !== "true";

      if (shouldExpand) {
        questions.forEach((otherButton) => {
          if (otherButton === button) return;
          const otherPanel = document.getElementById(otherButton.getAttribute("aria-controls"));
          if (otherPanel && otherButton.getAttribute("aria-expanded") === "true") {
            setAccordionPanel(otherButton, otherPanel, false);
          }
        });
      }

      setAccordionPanel(button, panel, shouldExpand);
    });
  });
};

/**
 * Initializes the billing switch and updates displayed prices.
 */
const initPricingToggle = () => {
  const billingSwitch = document.querySelector("#billing-yearly");
  const savingsLabel = document.querySelector("#billing-savings");
  const prices = document.querySelectorAll(".plan-card__amount");

  if (!billingSwitch) return;

  const updatePrices = () => {
    const period = billingSwitch.checked ? "yearly" : "monthly";

    prices.forEach((price) => {
      const amount = price.dataset[period];
      if (!amount) return;

      price.textContent = `£${Number(amount).toLocaleString("en-GB")}`;
      const pricePeriod = price.closest(".plan-card")?.querySelector(".plan-card__period");
      if (pricePeriod) {
        pricePeriod.textContent = billingSwitch.checked ? " / month, billed yearly" : " / month";
      }
    });

    if (savingsLabel) savingsLabel.hidden = !billingSwitch.checked;
  };

  billingSwitch.addEventListener("change", updatePrices);
  updatePrices();
};

/**
 * Adds a shadow treatment to the header after the page is scrolled.
 */
const initHeaderShadow = () => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const updateHeader = () => {
    header.classList.toggle("site-header--scrolled", window.scrollY > 10);
  };

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
};

/**
 * Initializes the demo enquiry form while preserving native validation.
 */
const initSignupForm = () => {
  const signupForm = document.querySelector("#signup-form");
  const formStatus = document.querySelector("#form-status");

  if (!signupForm || !formStatus) return;

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!signupForm.reportValidity()) return;

    const name = new FormData(signupForm).get("name")?.toString().trim();
    if (!name) {
      formStatus.textContent = "Please enter your name so I know who to reply to.";
      signupForm.elements.namedItem("name")?.focus();
      return;
    }

    formStatus.textContent = `Thanks, ${name.split(/\s+/)[0]} — this demo form isn't connected to an inbox yet. Please email hello@mrtinniciatives.com and I'll get back to you within two working days.`;
    signupForm.reset();
  });
};

/**
 * Updates the copyright year in the footer.
 */
const initFooterYear = () => {
  const currentYear = document.querySelector("#current-year");
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
};

/**
 * Initializes all page interactions once the document has been parsed.
 */
const init = () => {
  initMobileMenu();
  initAccordion();
  initPricingToggle();
  initHeaderShadow();
  initSignupForm();
  initFooterYear();
};

document.addEventListener("DOMContentLoaded", init, { once: true });
