(function () {
  "use strict";

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === "text") node.textContent = attrs[key];
        else node.setAttribute(key, attrs[key]);
      });
    }
    return node;
  }

  function getParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function parseStepFromHash() {
    var raw = (window.location.hash || "").replace("#", "").trim();
    if (!raw) return null;
    if (!/^\d+$/.test(raw)) return null;
    var n = Number(raw);
    if (!isFinite(n) || n < 1) return null;
    return n - 1;
  }

  function truncate(text, maxLen) {
    var t = String(text || "");
    if (t.length <= maxLen) return t;
    return t.slice(0, maxLen - 1).trim() + "…";
  }

  function init() {
    if (!window.ByteBitesData) return;

    var id = getParam("id");
    var recipe = window.ByteBitesData.getRecipeById(id);

    var title = qs("[data-cook-title]");
    var badge = qs("[data-cook-step-badge]");
    var stepText = qs("[data-cook-step]");
    var card = qs("[data-cook-card]");
    var error = qs("[data-error]");
    var exit = qs("[data-exit]");
    var prevBtn = qs("[data-prev]");
    var nextBtn = qs("[data-next]");
    var openJump = qs("[data-open-jump]");
    var jump = qs("[data-jump]");
    var stepList = qs("[data-step-list]");

    if (!recipe || !recipe.steps || !recipe.steps.length) {
      if (card) card.hidden = true;
      if (error) error.hidden = false;
      if (title) title.textContent = "Cooking mode";
      return;
    }

    if (error) error.hidden = true;
    if (card) card.hidden = false;
    if (jump) jump.hidden = false;

    if (title) title.textContent = recipe.title;
    document.title = "Cooking Mode — " + recipe.title + " | ByteBites";

    var exitHref = "recipes/recipe.html?id=" + encodeURIComponent(recipe.id);
    if (exit) exit.href = exitHref;

    var index = parseStepFromHash();
    if (index === null) index = 0;

    var total = recipe.steps.length;
    index = Math.min(Math.max(index, 0), total - 1);
    var jumpSummary = jump ? qs("summary", jump) : null;
    var jumpReturnFocus = openJump || jumpSummary;

    function closeJump() {
      if (jump) jump.open = false;
      if (jumpReturnFocus) jumpReturnFocus.focus();
    }

    function renderStepList(activeIndex) {
      if (!stepList) return;
      stepList.innerHTML = "";

      for (var i = 0; i < total; i++) {
        var li = el("li");
        var btn = el("button", {
          type: "button",
          class: "button subtle",
          "data-step": String(i),
          "aria-current": i === activeIndex ? "step" : "false",
          text: "Step " + (i + 1) + ": " + truncate(recipe.steps[i], 64)
        });
        li.appendChild(btn);
        stepList.appendChild(li);
      }
    }

    function syncControls() {
      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= total - 1;
    }

    function render() {
      if (badge) badge.textContent = "Step " + (index + 1) + " of " + total;
      if (stepText) stepText.textContent = recipe.steps[index];
      syncControls();
      renderStepList(index);
      window.location.hash = String(index + 1);
    }

    function next() {
      if (index >= total - 1) return;
      index += 1;
      render();
    }

    function prev() {
      if (index <= 0) return;
      index -= 1;
      render();
    }

    function exitToRecipe() {
      window.location.href = exitHref;
    }

    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);

    if (stepList) {
      stepList.addEventListener("click", function (e) {
        var target = e.target;
        if (!target || target.tagName !== "BUTTON") return;
        var btn = /** @type {HTMLButtonElement} */ (target);
        var raw = btn.getAttribute("data-step") || "";
        var n = Number(raw);
        if (!isFinite(n) || Math.floor(n) !== n) return;
        if (n < 0 || n >= total) return;
        index = n;
        render();
        closeJump();
      });
    }

    if (openJump) {
      openJump.addEventListener("click", function () {
        if (!jump) return;
        jumpReturnFocus = openJump;
        jump.open = true;
        var behavior = "smooth";
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) behavior = "auto";
        jump.scrollIntoView({ block: "start", behavior: behavior });
        var activeStep = stepList ? qs("[aria-current='step']", stepList) : null;
        if (activeStep) activeStep.focus();
      });
    }

    if (jumpSummary) {
      jumpSummary.addEventListener("click", function () {
        jumpReturnFocus = jumpSummary;
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.defaultPrevented) return;
      if (e.key === "Escape") {
        if (jump && jump.open) {
          e.preventDefault();
          closeJump();
        } else {
          e.preventDefault();
          exitToRecipe();
        }
        return;
      }
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      var target = e.target;
      if (target && target.closest && target.closest(
        "input, textarea, select, button, a, summary, nav, [contenteditable], [role='textbox'], [role='button'], [role='link']"
      )) return;
      e.preventDefault();
      if (e.key === "ArrowRight") next();
      else prev();
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
