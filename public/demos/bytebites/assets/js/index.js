(function () {
  "use strict";

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === "text") node.textContent = attrs[key];
        else if (key === "html") node.innerHTML = attrs[key];
        else node.setAttribute(key, attrs[key]);
      });
    }
    return node;
  }

  function debounce(fn, wait) {
    var t = null;
    return function () {
      var args = arguments;
      if (t) window.clearTimeout(t);
      t = window.setTimeout(function () {
        t = null;
        fn.apply(null, args);
      }, wait);
    };
  }

  function uniqSorted(list, preferredOrder) {
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var v = list[i];
      if (!v) continue;
      if (out.indexOf(v) !== -1) continue;
      out.push(v);
    }

    if (preferredOrder && preferredOrder.length) {
      out.sort(function (a, b) {
        var ai = preferredOrder.indexOf(a);
        var bi = preferredOrder.indexOf(b);
        if (ai !== -1 || bi !== -1) {
          if (ai === -1) return 1;
          if (bi === -1) return -1;
          return ai - bi;
        }
        return a.localeCompare(b);
      });
      return out;
    }

    out.sort(function (a, b) {
      return a.localeCompare(b);
    });
    return out;
  }

  function displayDietTag(tag) {
    var map = {
      vegan: "Vegan",
      vegetarian: "Vegetarian",
      "gluten-free": "Gluten-free",
      "dairy-free": "Dairy-free"
    };
    return map[tag] || tag;
  }

  function displayDifficulty(diff) {
    var map = { easy: "Easy", medium: "Medium", hard: "Hard" };
    return map[diff] || diff;
  }

  function makeChip(label, value, active) {
    var btn = el("button", {
      type: "button",
      class: "chip",
      "aria-pressed": active ? "true" : "false",
      "data-value": value,
      text: label
    });
    return btn;
  }

  function encodeId(id) {
    return encodeURIComponent(id);
  }

  function init() {
    if (!window.ByteBitesData || !window.ByteBitesCore || !window.ByteBitesStorage) return;

    var core = window.ByteBitesCore;
    var storage = window.ByteBitesStorage;
    var recipes = window.ByteBitesData.getRecipes();

    var state = storage.loadFilters();
    var favoritesList = storage.loadFavorites();

    var searchInput = qs("[data-search]");
    var cuisineWrap = qs("[data-cuisine-chips]");
    var dietWrap = qs("[data-diet-options]");
    var difficultyWrap = qs("[data-difficulty-chips]");
    var maxMinutesSelect = qs("[data-max-minutes]");
    var favoritesOnlyInput = qs("[data-favorites-only]");
    var cardsWrap = qs("[data-cards]");
    var resultsCount = qs("[data-results-count]");
    var resultsLive = qs("[data-results-live]");
    var empty = qs("[data-empty]");
    var activeFiltersWrap = qs("[data-active-filters]");
    var clearAll = qs("[data-clear-all]");
    var clearAllEmpty = qs("[data-clear-all-empty]");

    if (searchInput) searchInput.value = state.query || "";
    if (maxMinutesSelect) maxMinutesSelect.value = state.maxMinutes || "";
    if (favoritesOnlyInput) favoritesOnlyInput.checked = !!state.favoritesOnly;

    var cuisines = uniqSorted(recipes.map(function (r) { return r.cuisine; }));
    var dietTags = uniqSorted(
      recipes.reduce(function (acc, r) {
        return acc.concat(r.dietTags || []);
      }, []),
      ["vegan", "vegetarian", "gluten-free", "dairy-free"]
    );

    var difficulties = ["easy", "medium", "hard"];

    function getFavoritesSet() {
      favoritesList = storage.loadFavorites();
      var map = {};
      for (var i = 0; i < favoritesList.length; i++) {
        map[favoritesList[i]] = true;
      }
      return map;
    }

    function persist() {
      storage.saveFilters(state);
    }

    function clearAllFilters() {
      state = storage.loadFilters();
      state.query = "";
      state.cuisine = "";
      state.difficulty = "";
      state.dietTags = [];
      state.maxMinutes = "";
      state.favoritesOnly = false;
      persist();
      syncUiFromState();
      render();
    }

    function syncUiFromState() {
      if (searchInput) searchInput.value = state.query || "";
      if (maxMinutesSelect) maxMinutesSelect.value = state.maxMinutes || "";
      if (favoritesOnlyInput) favoritesOnlyInput.checked = !!state.favoritesOnly;

      qsa("[data-cuisine-chips] .chip").forEach(function (chip) {
        var value = chip.getAttribute("data-value");
        chip.setAttribute("aria-pressed", value === state.cuisine ? "true" : "false");
      });

      qsa("[data-difficulty-chips] .chip").forEach(function (chip) {
        var value = chip.getAttribute("data-value");
        chip.setAttribute("aria-pressed", value === state.difficulty ? "true" : "false");
      });

      qsa("[data-diet-options] input[type=\"checkbox\"]").forEach(function (checkbox) {
        var v = checkbox.value;
        checkbox.checked = state.dietTags.indexOf(v) !== -1;
      });

      renderActiveFilters();
    }

    function renderChips() {
      if (cuisineWrap) {
        cuisineWrap.innerHTML = "";
        cuisineWrap.appendChild(makeChip("Any", "", !state.cuisine));
        cuisines.forEach(function (c) {
          cuisineWrap.appendChild(makeChip(c, c, state.cuisine === c));
        });
      }

      if (difficultyWrap) {
        difficultyWrap.innerHTML = "";
        difficultyWrap.appendChild(makeChip("Any", "", !state.difficulty));
        difficulties.forEach(function (d) {
          difficultyWrap.appendChild(makeChip(displayDifficulty(d), d, state.difficulty === d));
        });
      }

      if (dietWrap) {
        dietWrap.innerHTML = "";
        dietTags.forEach(function (tag) {
          var id = "diet-" + tag;
          var label = el("label", { class: "check", for: id });
          var checkbox = el("input", { type: "checkbox", id: id, value: tag });
          checkbox.checked = state.dietTags.indexOf(tag) !== -1;
          label.appendChild(checkbox);
          label.appendChild(el("span", { text: displayDietTag(tag) }));
          dietWrap.appendChild(label);
        });
      }
    }

    function renderActiveFilters() {
      if (!activeFiltersWrap) return;
      activeFiltersWrap.innerHTML = "";

      function add(label, onClear) {
        var chip = el("div", { class: "active-filter" });
        chip.appendChild(el("span", { text: label }));
        var btn = el("button", { type: "button", "aria-label": "Remove filter: " + label, text: "×" });
        btn.addEventListener("click", function () {
          onClear();
          persist();
          syncUiFromState();
          render();
        });
        chip.appendChild(btn);
        activeFiltersWrap.appendChild(chip);
      }

      if (state.query) add("Search: " + state.query, function () { state.query = ""; });
      if (state.favoritesOnly) add("Favorites only", function () { state.favoritesOnly = false; });
      if (state.cuisine) add("Cuisine: " + state.cuisine, function () { state.cuisine = ""; });
      if (state.difficulty) add("Difficulty: " + displayDifficulty(state.difficulty), function () { state.difficulty = ""; });
      if (state.maxMinutes) add("Max: " + state.maxMinutes + " min", function () { state.maxMinutes = ""; });
      (state.dietTags || []).forEach(function (tag) {
        add("Diet: " + displayDietTag(tag), function () {
          state.dietTags = state.dietTags.filter(function (t) { return t !== tag; });
        });
      });

      if (!activeFiltersWrap.childNodes.length) {
        activeFiltersWrap.appendChild(el("span", { class: "muted small", text: "None" }));
      }
    }

    function render() {
      var favoritesSet = getFavoritesSet();
      var filtered = recipes.filter(function (r) {
        return core.recipeMatchesFilters(r, state, favoritesSet);
      });

      filtered.sort(function (a, b) {
        return a.title.localeCompare(b.title);
      });

      if (resultsCount) resultsCount.textContent = String(filtered.length);
      if (resultsLive) resultsLive.textContent = "Showing " + filtered.length + " recipes.";

      if (empty) empty.hidden = filtered.length !== 0;

      if (!cardsWrap) return;
      cardsWrap.innerHTML = "";

      var frag = document.createDocumentFragment();

      filtered.forEach(function (recipe) {
        var card = el("article", { class: "card recipe-card" });

        var thumb = el("div", { class: "thumb" });
        var img = el("img", {
          src: recipe.image.src,
          alt: recipe.image.alt,
          width: "960",
          height: "640",
          loading: "lazy"
        });
        thumb.appendChild(img);

        var isFav = !!favoritesSet[recipe.id];
        var favBtn = el("button", {
          type: "button",
          class: "favorite-btn",
          "data-fav": recipe.id,
          "aria-pressed": isFav ? "true" : "false",
          "aria-label": (isFav ? "Remove from favorites: " : "Save to favorites: ") + recipe.title,
          text: isFav ? "Saved" : "Save"
        });

        thumb.appendChild(favBtn);
        card.appendChild(thumb);

        var body = el("div", { class: "body" });
        var h3 = el("h3");
        var link = el("a", { href: "recipes/recipe.html?id=" + encodeId(recipe.id) });
        link.textContent = recipe.title;
        h3.appendChild(link);
        body.appendChild(h3);

        body.appendChild(el("p", { class: "muted small", text: recipe.description }));

        var meta = el("div", { class: "meta-inline" });
        meta.appendChild(el("span", { text: core.formatDurationMinutes(core.getTotalMinutes(recipe)) }));
        meta.appendChild(el("span", { text: "•" }));
        meta.appendChild(el("span", { text: displayDifficulty(recipe.difficulty) }));
        meta.appendChild(el("span", { text: "•" }));
        meta.appendChild(el("span", { text: recipe.cuisine }));
        body.appendChild(meta);

        var tags = el("div", { class: "tag-row", "aria-label": "Tags" });
        var shown = (recipe.tags || []).slice(0, 3);
        shown.forEach(function (t) {
          tags.appendChild(el("span", { class: "tag", text: t }));
        });
        (recipe.dietTags || []).slice(0, 2).forEach(function (t) {
          tags.appendChild(el("span", { class: "tag", text: displayDietTag(t) }));
        });
        body.appendChild(tags);

        body.appendChild(el("a", { class: "button subtle", href: "recipes/recipe.html?id=" + encodeId(recipe.id), text: "View recipe" }));
        card.appendChild(body);

        frag.appendChild(card);
      });

      cardsWrap.appendChild(frag);
      renderActiveFilters();
    }

    renderChips();
    render();

    var onQueryInput = debounce(function () {
      state.query = searchInput ? searchInput.value : "";
      persist();
      render();
    }, 160);

    if (searchInput) {
      searchInput.addEventListener("input", onQueryInput);
    }

    if (cuisineWrap) {
      cuisineWrap.addEventListener("click", function (e) {
        var target = e.target;
        if (!(target instanceof HTMLElement)) return;
        if (!target.classList.contains("chip")) return;
        var value = target.getAttribute("data-value") || "";
        state.cuisine = value === state.cuisine ? "" : value;
        persist();
        syncUiFromState();
        render();
      });
    }

    if (difficultyWrap) {
      difficultyWrap.addEventListener("click", function (e) {
        var target = e.target;
        if (!(target instanceof HTMLElement)) return;
        if (!target.classList.contains("chip")) return;
        var value = target.getAttribute("data-value") || "";
        state.difficulty = value === state.difficulty ? "" : value;
        persist();
        syncUiFromState();
        render();
      });
    }

    if (dietWrap) {
      dietWrap.addEventListener("change", function (e) {
        var target = e.target;
        if (!target || target.tagName !== "INPUT") return;
        var input = /** @type {HTMLInputElement} */ (target);
        var tag = input.value;
        var next = state.dietTags.slice();
        if (input.checked) {
          if (next.indexOf(tag) === -1) next.push(tag);
        } else {
          next = next.filter(function (t) { return t !== tag; });
        }
        state.dietTags = next;
        persist();
        render();
        renderActiveFilters();
      });
    }

    if (maxMinutesSelect) {
      maxMinutesSelect.addEventListener("change", function () {
        state.maxMinutes = maxMinutesSelect.value || "";
        persist();
        render();
        renderActiveFilters();
      });
    }

    if (favoritesOnlyInput) {
      favoritesOnlyInput.addEventListener("change", function () {
        state.favoritesOnly = !!favoritesOnlyInput.checked;
        persist();
        render();
        renderActiveFilters();
      });
    }

    function onFavoriteToggle(e) {
      var target = e.target;
      if (!target) return;
      if (!target.classList.contains("favorite-btn")) return;
      var id = target.getAttribute("data-fav") || "";
      if (!id) return;
      var result = storage.toggleFavorite(id);
      if (!result.ok) return;
      render();
    }

    if (cardsWrap) cardsWrap.addEventListener("click", onFavoriteToggle);

    if (clearAll) clearAll.addEventListener("click", clearAllFilters);
    if (clearAllEmpty) clearAllEmpty.addEventListener("click", clearAllFilters);

    syncUiFromState();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
