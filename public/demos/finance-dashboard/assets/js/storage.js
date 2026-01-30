(function () {
  if (!window.ClearLedger) window.ClearLedger = {};

  var STORAGE_KEY = "lb.financeDashboard";

  function safeGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  function safeRemove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function normalizeState(state) {
    var seed = window.ClearLedger.seed;
    var empty = seed && seed.getEmptyState ? seed.getEmptyState() : null;
    if (!empty) return state;

    var normalized = state && typeof state === "object" ? state : empty;
    if (!normalized.meta) normalized.meta = empty.meta;
    if (typeof normalized.meta.schemaVersion !== "number") normalized.meta.schemaVersion = 1;
    if (!normalized.meta.createdAt) normalized.meta.createdAt = empty.meta.createdAt;
    normalized.meta.updatedAt = nowIso();

    if (!normalized.settings) normalized.settings = empty.settings;
    if (typeof normalized.settings.currency !== "string") normalized.settings.currency = "USD";
    if (typeof normalized.settings.weekStartsOn !== "number") normalized.settings.weekStartsOn = 0;
    if (typeof normalized.settings.seededOnce !== "boolean") normalized.settings.seededOnce = true;
    if (typeof normalized.settings.isSampleData !== "boolean") normalized.settings.isSampleData = false;

    if (!normalized.categories || !normalized.categories.length) normalized.categories = empty.categories;
    if (!normalized.transactions) normalized.transactions = [];
    if (!normalized.budgets) normalized.budgets = [];

    return normalized;
  }

  function load() {
    var raw = safeGet(STORAGE_KEY);
    var seed = window.ClearLedger.seed;
    var readOnly = false;
    var state;

    if (!raw) {
      state = seed && seed.getSeedState ? seed.getSeedState(new Date()) : null;
      state = normalizeState(state);
      var ok = safeSet(STORAGE_KEY, JSON.stringify(state));
      if (!ok) readOnly = true;
      return { state: state, readOnly: readOnly, seeded: true };
    }

    try {
      state = JSON.parse(raw);
    } catch (e) {
      state = seed && seed.getEmptyState ? seed.getEmptyState() : { meta: { schemaVersion: 1 } };
    }

    state = normalizeState(state);
    if (!safeSet(STORAGE_KEY, JSON.stringify(state))) readOnly = true;

    return { state: state, readOnly: readOnly, seeded: !!(state.settings && state.settings.isSampleData) };
  }

  function save(nextState) {
    var state = normalizeState(nextState);
    var ok = safeSet(STORAGE_KEY, JSON.stringify(state));
    return { ok: ok, state: state };
  }

  function resetToEmpty() {
    var seed = window.ClearLedger.seed;
    var empty = seed && seed.getEmptyState ? seed.getEmptyState() : null;
    return save(empty);
  }

  function loadSample() {
    var seed = window.ClearLedger.seed;
    var seeded = seed && seed.getSeedState ? seed.getSeedState(new Date()) : null;
    return save(seeded);
  }

  function clearAll() {
    var ok = safeRemove(STORAGE_KEY);
    return { ok: ok };
  }

  window.ClearLedger.storage = {
    STORAGE_KEY: STORAGE_KEY,
    load: load,
    save: save,
    resetToEmpty: resetToEmpty,
    loadSample: loadSample,
    clearAll: clearAll
  };
})();

