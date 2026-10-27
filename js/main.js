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
 * Initializes validation, duplicate detection, and localStorage persistence.
 */
const initSignupForm = () => {
  const signupForm = document.querySelector("#signup-form");
  const formStatus = document.querySelector("#form-status");

  if (!signupForm || !formStatus) return;

  const fields = {
    name: signupForm.querySelector('[name="name"]'),
    email: signupForm.querySelector('[name="email"]'),
    plan: signupForm.querySelector('[name="plan"]'),
    terms: signupForm.querySelector('[name="terms"]')
  };
  const errors = {
    name: document.querySelector("#name-error"),
    email: document.querySelector("#email-error"),
    plan: document.querySelector("#plan-error"),
    terms: document.querySelector("#terms-error")
  };

  const missingFields = Object.values(fields).some((field) => !field);
  if (missingFields) return;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validationMessages = {
    name: "Enter your name using at least 2 characters.",
    email: "Enter a valid email address.",
    plan: "Choose a plan to continue.",
    terms: "Please agree to the terms before continuing."
  };

  const getFieldError = (fieldName) => {
    const field = fields[fieldName];
    if (fieldName === "name" && field.value.trim().length < 2) return validationMessages.name;
    if (fieldName === "email" && !emailPattern.test(field.value.trim())) return validationMessages.email;
    if (fieldName === "plan" && !field.value) return validationMessages.plan;
    if (fieldName === "terms" && !field.checked) return validationMessages.terms;
    return "";
  };

  const updateFieldError = (fieldName) => {
    const field = fields[fieldName];
    const error = errors[fieldName];
    const message = getFieldError(fieldName);
    if (!field || !error) return !message;

    field.setAttribute("aria-invalid", String(Boolean(message)));
    error.textContent = message;
    error.hidden = !message;
    return !message;
  };

  const clearStatusWhenEdited = () => {
    formStatus.textContent = "";
  };

  Object.keys(fields).forEach((fieldName) => {
    const field = fields[fieldName];
    const eventName = fieldName === "terms" || fieldName === "plan" ? "change" : "input";

    field.addEventListener(eventName, () => {
      if (field.hasAttribute("aria-invalid")) updateFieldError(fieldName);
      clearStatusWhenEdited();
    });
  });

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.textContent = "";

    const fieldNames = Object.keys(fields);
    const isValid = fieldNames
      .map((fieldName) => updateFieldError(fieldName))
      .every(Boolean);

    if (!isValid) {
      const firstInvalidField = fieldNames.find((fieldName) => getFieldError(fieldName));
      if (firstInvalidField) fields[firstInvalidField].focus();
      return;
    }

    const name = fields.name.value.trim();
    const email = fields.email.value.trim();
    const plan = fields.plan.value;

    try {
      const savedSignups = localStorage.getItem("signups");
      const signups = savedSignups ? JSON.parse(savedSignups) : [];
      if (!Array.isArray(signups)) throw new Error("Stored signups are not an array.");

      const alreadySignedUp = signups.some((signup) =>
        signup && typeof signup.email === "string" && signup.email.toLowerCase() === email.toLowerCase()
      );
      if (alreadySignedUp) {
        formStatus.textContent = "You've already signed up";
        fields.email.setAttribute("aria-invalid", "true");
        errors.email.textContent = "You've already signed up with this email address.";
        errors.email.hidden = false;
        fields.email.focus();
        return;
      }

      signups.push({ name, email, plan, createdAt: new Date().toISOString() });
      localStorage.setItem("signups", JSON.stringify(signups));
    } catch (error) {
      console.error("Unable to save signup to localStorage.", error);
      formStatus.textContent = "We couldn't save your enquiry in this browser. Please try again or email hello@mrtinniciatives.com.";
      return;
    }

    signupForm.reset();
    fieldNames.forEach((fieldName) => {
      fields[fieldName].removeAttribute("aria-invalid");
      errors[fieldName].textContent = "";
      errors[fieldName].hidden = true;
    });
    formStatus.textContent = "Thanks for signing up. Your enquiry has been saved in this browser.";
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
