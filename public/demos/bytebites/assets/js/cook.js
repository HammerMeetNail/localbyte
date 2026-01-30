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
    var m = raw.match(/(\d+)/);
    if (!m) return null;
    var n = Number(m[1]);
    if (!n || n < 1) return null;
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
        if (!isFinite(n)) return;
        if (n < 0 || n >= total) return;
        index = n;
        render();
        if (jump) jump.open = false;
      });
    }

    if (openJump) {
      openJump.addEventListener("click", function () {
        if (!jump) return;
        jump.open = true;
        var behavior = "smooth";
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) behavior = "auto";
        jump.scrollIntoView({ block: "start", behavior: behavior });
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") {
        next();
      } else if (e.key === "ArrowLeft") {
        prev();
      } else if (e.key === "Escape") {
        exitToRecipe();
      }
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
