const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

if (menuToggle && primaryNav) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    primaryNav.classList.toggle("is-open", !isExpanded);
  });

  primaryNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      primaryNav.classList.remove("is-open");
    });
  });
}

const billingOptions = document.querySelectorAll(".billing-toggle__option");
const prices = document.querySelectorAll(".plan-card__amount");

billingOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const period = option.dataset.period;
    if (!period) return;

    billingOptions.forEach((item) => {
      const isActive = item === option;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    prices.forEach((price) => {
      const amount = price.dataset[period];
      if (!amount) return;
      price.textContent = `£${Number(amount).toLocaleString("en-GB")}`;
      const planCard = price.closest(".plan-card");
      const pricePeriod = planCard?.querySelector(".plan-card__period");
      if (pricePeriod) pricePeriod.textContent = period === "yearly" ? " / month, billed yearly" : " / month";
    });
  });
});

document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    if (!panel) return;
    button.setAttribute("aria-expanded", String(!isExpanded));
    panel.hidden = isExpanded;
  });
});

const signupForm = document.querySelector("#signup-form");
const formStatus = document.querySelector("#form-status");

if (signupForm && formStatus) {
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
}

const currentYear = document.querySelector("#current-year");
if (currentYear) currentYear.textContent = String(new Date().getFullYear());
