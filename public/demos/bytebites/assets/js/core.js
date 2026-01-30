(function () {
  "use strict";

  function normalizeText(input) {
    if (!input) return "";
    return String(input)
      .toLowerCase()
      .replace(/[\u2019']/g, "'")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenizeQuery(query) {
    var normalized = normalizeText(query);
    if (!normalized) return [];
    return normalized.split(" ");
  }

  function getTotalMinutes(recipe) {
    return (recipe.prepMinutes || 0) + (recipe.cookMinutes || 0);
  }

  function formatDurationMinutes(totalMinutes) {
    var mins = Math.max(0, Number(totalMinutes) || 0);
    if (mins < 60) return mins + " min";
    var hours = Math.floor(mins / 60);
    var remainder = mins % 60;
    if (!remainder) return hours + "h";
    return hours + "h " + remainder + "m";
  }

  function buildRecipeSearchText(recipe) {
    var parts = [];
    parts.push(recipe.title);
    parts.push(recipe.description);
    parts.push(recipe.cuisine);
    parts.push((recipe.tags || []).join(" "));
    parts.push((recipe.dietTags || []).join(" "));
    var ingredients = recipe.ingredients || [];
    for (var i = 0; i < ingredients.length; i++) {
      parts.push(ingredients[i].name);
      parts.push(ingredients[i].note || "");
    }
    return normalizeText(parts.join(" "));
  }

  function recipeMatchesQuery(recipe, query) {
    var tokens = tokenizeQuery(query);
    if (!tokens.length) return true;
    var haystack = buildRecipeSearchText(recipe);
    for (var i = 0; i < tokens.length; i++) {
      if (haystack.indexOf(tokens[i]) !== -1) return true;
    }
    return false;
  }

  function recipeMatchesFilters(recipe, filters, favoritesSet) {
    var totalMinutes = getTotalMinutes(recipe);
    var maxMinutes = filters.maxMinutes ? Number(filters.maxMinutes) : null;
    if (maxMinutes && totalMinutes > maxMinutes) return false;

    if (filters.cuisine && recipe.cuisine !== filters.cuisine) return false;
    if (filters.difficulty && recipe.difficulty !== filters.difficulty) return false;

    if (filters.dietTags && filters.dietTags.length) {
      var recipeDiet = recipe.dietTags || [];
      for (var i = 0; i < filters.dietTags.length; i++) {
        if (recipeDiet.indexOf(filters.dietTags[i]) === -1) return false;
      }
    }

    if (filters.favoritesOnly) {
      if (!favoritesSet) return false;
      if (typeof favoritesSet.has === "function") {
        if (!favoritesSet.has(recipe.id)) return false;
      } else {
        if (!favoritesSet[recipe.id]) return false;
      }
    }

    if (!recipeMatchesQuery(recipe, filters.query || "")) return false;

    return true;
  }

  function clampAmount(amount) {
    if (!isFinite(amount)) return 0;
    if (Math.abs(amount) < 1e-8) return 0;
    return amount;
  }

  function toPrettyFraction(value) {
    var candidates = [
      { n: 1, d: 8 },
      { n: 1, d: 6 },
      { n: 1, d: 5 },
      { n: 1, d: 4 },
      { n: 1, d: 3 },
      { n: 3, d: 8 },
      { n: 2, d: 5 },
      { n: 1, d: 2 },
      { n: 3, d: 5 },
      { n: 5, d: 8 },
      { n: 2, d: 3 },
      { n: 3, d: 4 },
      { n: 5, d: 6 },
      { n: 7, d: 8 }
    ];

    var sign = value < 0 ? -1 : 1;
    var abs = Math.abs(value);
    var whole = Math.floor(abs);
    var frac = abs - whole;

    if (frac < 0.02) return (sign < 0 ? "-" : "") + String(whole);

    var best = null;
    for (var i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      var approx = c.n / c.d;
      var diff = Math.abs(frac - approx);
      if (diff <= 0.03 && (!best || diff < best.diff)) {
        best = { n: c.n, d: c.d, diff: diff };
      }
    }

    if (!best) return null;

    var prefix = sign < 0 ? "-" : "";
    if (!whole) return prefix + best.n + "/" + best.d;
    return prefix + whole + " " + best.n + "/" + best.d;
  }

  function formatAmount(amount) {
    var value = clampAmount(Number(amount));
    if (!isFinite(value)) return "";

    var frac = toPrettyFraction(value);
    if (frac) return frac;

    var fixed = value.toFixed(2);
    fixed = fixed.replace(/\.?0+$/, "");
    return fixed;
  }

  function scaleAmount(amount, factor) {
    if (amount === null || typeof amount === "undefined") return null;
    var n = Number(amount);
    if (!isFinite(n)) return null;
    return clampAmount(n * factor);
  }

  function buildRecipeJsonLd(recipe, pageUrl) {
    var ingredients = recipe.ingredients || [];
    var ingredientLines = [];
    for (var i = 0; i < ingredients.length; i++) {
      var ing = ingredients[i];
      var parts = [];
      if (ing.amount !== null && typeof ing.amount !== "undefined") {
        var amt = formatAmount(ing.amount);
        if (amt) parts.push(amt);
      }
      if (ing.unit) parts.push(ing.unit);
      parts.push(ing.name);
      if (ing.note) parts.push("(" + ing.note + ")");
      ingredientLines.push(parts.join(" ").replace(/\s+/g, " ").trim());
    }

    var instructions = [];
    for (var s = 0; s < (recipe.steps || []).length; s++) {
      instructions.push({
        "@type": "HowToStep",
        text: recipe.steps[s]
      });
    }

    function toIsoDuration(minutes) {
      var mins = Math.max(0, Number(minutes) || 0);
      return "PT" + mins + "M";
    }

    var obj = {
      "@context": "https://schema.org",
      "@type": "Recipe",
      name: recipe.title,
      description: recipe.description,
      recipeCuisine: recipe.cuisine,
      recipeCategory: "Main",
      keywords: (recipe.tags || []).join(", "),
      recipeYield: recipe.servings + " servings",
      prepTime: toIsoDuration(recipe.prepMinutes),
      cookTime: toIsoDuration(recipe.cookMinutes),
      totalTime: toIsoDuration(getTotalMinutes(recipe)),
      recipeIngredient: ingredientLines,
      recipeInstructions: instructions,
      author: {
        "@type": "Organization",
        name: "LocalByte LLC"
      }
    };

    if (pageUrl) obj.url = pageUrl;
    if (recipe.image && recipe.image.src) obj.image = [recipe.image.src];

    return obj;
  }

  var api = {
    normalizeText: normalizeText,
    tokenizeQuery: tokenizeQuery,
    getTotalMinutes: getTotalMinutes,
    formatDurationMinutes: formatDurationMinutes,
    buildRecipeSearchText: buildRecipeSearchText,
    recipeMatchesQuery: recipeMatchesQuery,
    recipeMatchesFilters: recipeMatchesFilters,
    formatAmount: formatAmount,
    scaleAmount: scaleAmount,
    buildRecipeJsonLd: buildRecipeJsonLd
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.ByteBitesCore = api;
})();
