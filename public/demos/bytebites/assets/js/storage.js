(function () {
  "use strict";

  var FAVORITES_KEY = "lb.bytebites.favorites";
  var FILTERS_KEY = "lb.bytebites.filters";
  var FILTERS_VERSION = 1;

  function canUseStorage(storage) {
    if (!storage) return false;
    try {
      var key = "__lb_test__";
      storage.setItem(key, "1");
      storage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  function safeParseJson(raw, fallback) {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function safeGetJson(storage, key, fallback) {
    try {
      return safeParseJson(storage.getItem(key), fallback);
    } catch (e) {
      return fallback;
    }
  }

  function safeSetJson(storage, key, value) {
    try {
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function normalizeFavorites(list) {
    if (!Array.isArray(list)) return [];
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var id = String(list[i] || "").trim();
      if (!id) continue;
      if (out.indexOf(id) !== -1) continue;
      out.push(id);
    }
    return out;
  }

  function normalizeFilters(obj) {
    var base = {
      version: FILTERS_VERSION,
      query: "",
      cuisine: "",
      difficulty: "",
      dietTags: [],
      maxMinutes: "",
      favoritesOnly: false
    };

    if (!obj || typeof obj !== "object") return base;
    if (obj.version !== FILTERS_VERSION) return base;

    base.query = typeof obj.query === "string" ? obj.query : "";
    base.cuisine = typeof obj.cuisine === "string" ? obj.cuisine : "";
    base.difficulty = typeof obj.difficulty === "string" ? obj.difficulty : "";
    base.maxMinutes = typeof obj.maxMinutes === "string" || typeof obj.maxMinutes === "number" ? String(obj.maxMinutes) : "";
    base.favoritesOnly = !!obj.favoritesOnly;
    base.dietTags = Array.isArray(obj.dietTags) ? obj.dietTags.filter(Boolean).map(String) : [];
    return base;
  }

  function createStorageApi(storage) {
    var available = canUseStorage(storage);

    function loadFavorites() {
      if (!available) return [];
      return normalizeFavorites(safeGetJson(storage, FAVORITES_KEY, []));
    }

    function saveFavorites(list) {
      if (!available) return false;
      return safeSetJson(storage, FAVORITES_KEY, normalizeFavorites(list));
    }

    function isFavorite(id) {
      if (!available) return false;
      var list = loadFavorites();
      return list.indexOf(id) !== -1;
    }

    function toggleFavorite(id) {
      if (!available) return { ok: false, isFavorite: false };
      var list = loadFavorites();
      var idx = list.indexOf(id);
      if (idx === -1) list.push(id);
      else list.splice(idx, 1);
      var ok = saveFavorites(list);
      return { ok: ok, isFavorite: idx === -1 };
    }

    function loadFilters() {
      if (!available) return normalizeFilters(null);
      return normalizeFilters(safeGetJson(storage, FILTERS_KEY, null));
    }

    function saveFilters(filters) {
      if (!available) return false;
      var normalized = normalizeFilters(filters);
      return safeSetJson(storage, FILTERS_KEY, normalized);
    }

    function clearFilters() {
      if (!available) return false;
      try {
        storage.removeItem(FILTERS_KEY);
        return true;
      } catch (e) {
        return false;
      }
    }

    return {
      available: available,
      loadFavorites: loadFavorites,
      saveFavorites: saveFavorites,
      isFavorite: isFavorite,
      toggleFavorite: toggleFavorite,
      loadFilters: loadFilters,
      saveFilters: saveFilters,
      clearFilters: clearFilters,
      keys: { FAVORITES_KEY: FAVORITES_KEY, FILTERS_KEY: FILTERS_KEY }
    };
  }

  var api = createStorageApi(typeof window !== "undefined" ? window.localStorage : null);

  api._createStorageApi = createStorageApi;

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.ByteBitesStorage = api;
})();

