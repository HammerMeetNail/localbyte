(function () {
  var TEMPLATES = ["minimal", "bold", "elegant"];
  var PALETTES = ["teal", "plum", "sunset", "slate"];

  function clampString(value, maxLen) {
    var str = (value == null ? "" : String(value)).trim();
    if (str.length > maxLen) str = str.slice(0, maxLen);
    return str;
  }

  function parseIntStrict(value) {
    if (value == null) return null;
    var str = String(value).trim();
    if (!/^\d+$/.test(str)) return null;
    var num = Number(str);
    if (!isFinite(num)) return null;
    return num;
  }

  function isAllowed(list, value) {
    return list.indexOf(value) !== -1;
  }

  function validateHttpsUrl(value) {
    var raw = (value == null ? "" : String(value)).trim();
    if (!raw) return { ok: true, value: "" };
    try {
      var u = new URL(raw);
      if (u.protocol !== "https:") return { ok: false, message: "URL must start with https://." };
      return { ok: true, value: u.toString() };
    } catch (e) {
      return { ok: false, message: "Enter a valid absolute URL starting with https://." };
    }
  }

  function parseConfig(search) {
    var params = new URLSearchParams(search && search[0] === "?" ? search.slice(1) : (search || ""));

    var name = clampString(params.get("name"), 60);
    var ts = parseIntStrict(params.get("ts"));
    var desc = clampString(params.get("desc"), 180);
    var tpl = clampString(params.get("tpl"), 16) || "minimal";
    var pal = clampString(params.get("pal"), 16) || "teal";
    var ctaLabel = clampString(params.get("ctaLabel"), 24);
    var ctaUrlRaw = clampString(params.get("ctaUrl"), 400);

    if (!isAllowed(TEMPLATES, tpl)) tpl = "minimal";
    if (!isAllowed(PALETTES, pal)) pal = "teal";

    var errors = [];

    if (!name) errors.push({ field: "name", message: "Event name is required." });
    if (name && name.length > 60) errors.push({ field: "name", message: "Event name must be 60 characters or less." });
    if (ts == null) errors.push({ field: "ts", message: "Event time is required." });

    if (desc && desc.length > 180) errors.push({ field: "desc", message: "Description must be 180 characters or less." });

    var ctaHasAny = !!(ctaLabel || ctaUrlRaw);
    if (ctaHasAny) {
      if (!ctaLabel) errors.push({ field: "ctaLabel", message: "Button label is required when a URL is provided." });
      if (!ctaUrlRaw) errors.push({ field: "ctaUrl", message: "Button URL is required when a label is provided." });
      if (ctaLabel && ctaLabel.length > 24) errors.push({ field: "ctaLabel", message: "Button label must be 24 characters or less." });
      var urlCheck = validateHttpsUrl(ctaUrlRaw);
      if (!urlCheck.ok) errors.push({ field: "ctaUrl", message: urlCheck.message });
      ctaUrlRaw = urlCheck.ok ? urlCheck.value : ctaUrlRaw;
    } else {
      ctaLabel = "";
      ctaUrlRaw = "";
    }

    var config = {
      name: name,
      ts: ts,
      desc: desc,
      tpl: tpl,
      pal: pal,
      ctaLabel: ctaLabel,
      ctaUrl: ctaUrlRaw
    };

    return { config: config, errors: errors };
  }

  function buildShareUrl(config, baseUrl) {
    var url = new URL(baseUrl);
    url.searchParams.set("name", clampString(config.name, 60));
    url.searchParams.set("ts", String(config.ts));
    if (config.desc) url.searchParams.set("desc", clampString(config.desc, 180));
    url.searchParams.set("tpl", isAllowed(TEMPLATES, config.tpl) ? config.tpl : "minimal");
    url.searchParams.set("pal", isAllowed(PALETTES, config.pal) ? config.pal : "teal");
    if (config.ctaLabel && config.ctaUrl) {
      url.searchParams.set("ctaLabel", clampString(config.ctaLabel, 24));
      url.searchParams.set("ctaUrl", clampString(config.ctaUrl, 400));
    }
    return url.toString();
  }

  function getTemplateIds() {
    return TEMPLATES.slice();
  }

  function getPaletteIds() {
    return PALETTES.slice();
  }

  var api = {
    parseConfig: parseConfig,
    buildShareUrl: buildShareUrl,
    validateHttpsUrl: validateHttpsUrl,
    getTemplateIds: getTemplateIds,
    getPaletteIds: getPaletteIds
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    window.LaunchClock = window.LaunchClock || {};
    Object.keys(api).forEach(function (k) {
      window.LaunchClock[k] = api[k];
    });
  }
})();

