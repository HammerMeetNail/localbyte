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

  function getId() {
    var params = new URLSearchParams(window.location.search);
    return params.get("id") || "";
  }

  function displayDifficulty(diff) {
    var map = { easy: "Easy", medium: "Medium", hard: "Hard" };
    return map[diff] || diff;
  }

  function resolveRecipeImage(src) {
    if (!src) return "";
    if (src.indexOf("assets/") === 0) return "../" + src;
    return src;
  }

  function init() {
    if (!window.ByteBitesData || !window.ByteBitesCore || !window.ByteBitesStorage) return;

    var id = getId();
    var recipe = window.ByteBitesData.getRecipeById(id);

    var shell = qs("[data-recipe-shell]");
    var error = qs("[data-error]");
    var title = qs("[data-recipe-title]");
    var desc = qs("[data-recipe-desc]");
    var total = qs("[data-recipe-total]");
    var difficulty = qs("[data-recipe-difficulty]");
    var cuisine = qs("[data-recipe-cuisine]");
    var kicker = qs("[data-recipe-kicker]");
    var img = qs("[data-recipe-img]");
    var favorite = qs("[data-favorite]");
    var cook = qs("[data-cook]");
    var printBtn = qs("[data-print]");
    var servings = qs("[data-servings]");
    var ingredientsList = qs("[data-ingredients]");
    var stepsList = qs("[data-steps]");

    if (!recipe) {
      if (shell) shell.hidden = true;
      if (error) error.hidden = false;
      return;
    }

    if (error) error.hidden = true;
    if (shell) shell.hidden = false;

    document.title = recipe.title + " | ByteBites";

    if (kicker) kicker.textContent = "Recipe";
    if (title) title.textContent = recipe.title;
    if (desc) desc.textContent = recipe.description;
    if (total) total.textContent = window.ByteBitesCore.formatDurationMinutes(window.ByteBitesCore.getTotalMinutes(recipe));
    if (difficulty) difficulty.textContent = displayDifficulty(recipe.difficulty);
    if (cuisine) cuisine.textContent = recipe.cuisine;

    if (img) {
      img.src = resolveRecipeImage(recipe.image.src);
      img.alt = recipe.image.alt;
    }

    if (cook) cook.href = "../cook.html?id=" + encodeURIComponent(recipe.id);

    function syncFavorite() {
      if (!favorite) return;
      var isFav = window.ByteBitesStorage.isFavorite(recipe.id);
      favorite.setAttribute("aria-pressed", isFav ? "true" : "false");
      favorite.textContent = isFav ? "Saved" : "Save";
    }

    if (favorite) {
      syncFavorite();
      favorite.addEventListener("click", function () {
        window.ByteBitesStorage.toggleFavorite(recipe.id);
        syncFavorite();
      });
    }

    if (printBtn) {
      printBtn.addEventListener("click", function () {
        window.print();
      });
    }

    function renderIngredients(currentServings) {
      if (!ingredientsList) return;
      ingredientsList.innerHTML = "";

      var base = recipe.servings || 1;
      var safeCurrent = Math.max(1, Number(currentServings) || base);
      var factor = safeCurrent / base;

      var ings = recipe.ingredients || [];
      for (var i = 0; i < ings.length; i++) {
        var ing = ings[i];
        var li = el("li");

        var amountText = "";
        if (ing.amount !== null && typeof ing.amount !== "undefined" && ing.scalable !== false) {
          var scaled = window.ByteBitesCore.scaleAmount(ing.amount, factor);
          amountText = window.ByteBitesCore.formatAmount(scaled);
        } else if (ing.amount !== null && typeof ing.amount !== "undefined") {
          amountText = window.ByteBitesCore.formatAmount(ing.amount);
        }

        var amount = el("span", { class: "amount" });
        amount.textContent = amountText || "";
        li.appendChild(amount);

        var parts = [];
        if (ing.unit) parts.push(ing.unit);
        parts.push(ing.name);
        if (ing.note) parts.push("— " + ing.note);
        li.appendChild(el("span", { text: parts.join(" ").replace(/\s+/g, " ").trim() }));

        ingredientsList.appendChild(li);
      }
    }

    function renderSteps() {
      if (!stepsList) return;
      stepsList.innerHTML = "";
      var steps = recipe.steps || [];
      for (var i = 0; i < steps.length; i++) {
        var li = el("li");
        li.textContent = steps[i];
        stepsList.appendChild(li);
      }
    }

    if (servings) {
      servings.value = String(recipe.servings || 1);
      renderIngredients(recipe.servings || 1);
      servings.addEventListener("input", function () {
        var value = Number(servings.value);
        if (!value || value < 1) return;
        renderIngredients(value);
      });
      servings.addEventListener("change", function () {
        var value = Number(servings.value);
        if (!value || value < 1) {
          servings.value = String(recipe.servings || 1);
          renderIngredients(recipe.servings || 1);
          return;
        }
        if (value > 20) value = 20;
        servings.value = String(value);
        renderIngredients(value);
      });
    } else {
      renderIngredients(recipe.servings || 1);
    }

    renderSteps();

    var jsonLd = window.ByteBitesCore.buildRecipeJsonLd(recipe, window.location.href);
    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }

  document.addEventListener("DOMContentLoaded", init);
})();

