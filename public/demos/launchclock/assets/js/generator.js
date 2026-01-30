(function () {
  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function getInputValue(el) {
    return el ? String(el.value || "").trim() : "";
  }

  function defaultDatetimeValue() {
    var now = new Date();
    var d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    d.setMinutes(0, 0, 0);
    d.setHours(Math.min(23, Math.max(0, d.getHours() + 1)));
    return window.LaunchClock.formatTsForDatetimeLocal(d.getTime());
  }

  function getSelectedRadioValue(name) {
    var checked = document.querySelector("input[name=\"" + name + "\"]:checked");
    return checked ? checked.value : "";
  }

  function clearErrors() {
    var summary = window.LaunchClock.qs("[data-error-summary]");
    if (summary) {
      summary.hidden = true;
      summary.textContent = "";
    }

    ["event-name", "event-datetime", "event-desc", "cta-label", "cta-url"].forEach(function (id) {
      var input = document.getElementById(id);
      if (!input) return;
      input.removeAttribute("aria-invalid");
      var err = document.getElementById(id + "-error");
      if (err && err.parentNode) err.parentNode.removeChild(err);

      var described = (input.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
      described = described.filter(function (tok) { return tok !== (id + "-error"); });
      if (described.length) input.setAttribute("aria-describedby", described.join(" "));
      else input.removeAttribute("aria-describedby");
    });
  }

  function setFieldError(inputId, message) {
    var input = document.getElementById(inputId);
    if (!input) return;

    input.setAttribute("aria-invalid", "true");

    var errId = inputId + "-error";
    var err = document.getElementById(errId);
    if (!err) {
      err = document.createElement("p");
      err.id = errId;
      err.className = "field-error small";
      err.style.margin = "0.35rem 0 0";
      input.insertAdjacentElement("afterend", err);
    }
    err.textContent = message;

    var described = (input.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
    if (described.indexOf(errId) === -1) described.push(errId);
    input.setAttribute("aria-describedby", described.join(" "));
  }

  function showErrorSummary(errors) {
    var summary = window.LaunchClock.qs("[data-error-summary]");
    if (!summary) return;

    summary.hidden = false;
    summary.innerHTML = "";

    var title = document.createElement("strong");
    title.textContent = "Please fix the following:";
    summary.appendChild(title);

    var list = document.createElement("ul");
    list.style.margin = "0.6rem 0 0";
    list.style.paddingLeft = "1.25rem";

    errors.forEach(function (e) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + e.inputId;
      a.textContent = e.message;
      a.addEventListener("click", function (ev) {
        ev.preventDefault();
        var input = document.getElementById(e.inputId);
        if (input) input.focus();
      });
      li.appendChild(a);
      list.appendChild(li);
    });

    summary.appendChild(list);
    summary.focus();
  }

  function validateDraft(draft) {
    var errors = [];

    if (!draft.name) errors.push({ inputId: "event-name", message: "Event name is required." });
    if (!draft.ts) errors.push({ inputId: "event-datetime", message: "Event date/time is required." });

    if (draft.desc && draft.desc.length > 180) errors.push({ inputId: "event-desc", message: "Description must be 180 characters or less." });

    var ctaHasAny = !!(draft.ctaLabel || draft.ctaUrl);
    if (ctaHasAny) {
      if (!draft.ctaLabel) errors.push({ inputId: "cta-label", message: "Button label is required when a URL is provided." });
      if (!draft.ctaUrl) errors.push({ inputId: "cta-url", message: "Button URL is required when a label is provided." });
      var urlCheck = window.LaunchClock.validateHttpsUrl(draft.ctaUrl);
      if (!urlCheck.ok) errors.push({ inputId: "cta-url", message: urlCheck.message });
    }

    return errors;
  }

  function readDraft() {
    var name = getInputValue(document.getElementById("event-name"));
    var datetimeValue = getInputValue(document.getElementById("event-datetime"));
    var ts = window.LaunchClock.parseDatetimeLocalToTs(datetimeValue);
    var desc = getInputValue(document.getElementById("event-desc"));
    var tpl = getSelectedRadioValue("tpl") || "minimal";
    var pal = getSelectedRadioValue("pal") || "teal";
    var ctaLabel = getInputValue(document.getElementById("cta-label"));
    var ctaUrl = getInputValue(document.getElementById("cta-url"));

    return {
      name: name,
      ts: ts,
      desc: desc,
      tpl: tpl,
      pal: pal,
      ctaLabel: ctaLabel,
      ctaUrl: ctaUrl
    };
  }

  function writeShareLink(isValid, url) {
    var shareInput = document.getElementById("share-url");
    var open = window.LaunchClock.qs("[data-open-link]");
    var copyBtn = window.LaunchClock.qs("[data-copy-link]");

    if (shareInput) shareInput.value = isValid ? url : "";

    if (open) {
      open.href = isValid ? url : "countdown.html";
      open.setAttribute("aria-disabled", isValid ? "false" : "true");
      if (isValid) open.removeAttribute("tabindex");
      else open.setAttribute("tabindex", "-1");
    }

    if (copyBtn) copyBtn.disabled = !isValid;
  }

  function setShareStatus(message) {
    var status = window.LaunchClock.qs("[data-share-status]");
    if (!status) return;
    status.textContent = message || "";
  }

  function init() {
    var form = window.LaunchClock.qs("[data-generator-form]");
    if (!form) return;

    if (!getInputValue(document.getElementById("event-name"))) {
      document.getElementById("event-name").value = "Beacon v2 Launch";
    }

    if (!getInputValue(document.getElementById("event-datetime"))) {
      document.getElementById("event-datetime").value = defaultDatetimeValue();
    }

    if (!getInputValue(document.getElementById("event-desc"))) {
      document.getElementById("event-desc").value = "A streamlined product update — join the live reveal and Q&A.";
    }

    if (!document.querySelector("input[name=\"tpl\"]:checked")) {
      document.querySelector("input[name=\"tpl\"][value=\"minimal\"]").checked = true;
    }

    if (!document.querySelector("input[name=\"pal\"]:checked")) {
      document.querySelector("input[name=\"pal\"][value=\"teal\"]").checked = true;
    }

    var previewHost = window.LaunchClock.qs("[data-preview-root]");
    var landing = null;
    if (previewHost) {
      landing = window.LaunchClock.createLanding(previewHost, { showShare: false, showSignup: false, titleTag: "h2" });
      landing.root.setAttribute("data-context", "preview");
    }

    var intervalId = null;

    function stopTimer() {
      if (intervalId) window.clearInterval(intervalId);
      intervalId = null;
    }

    function startTimer(update) {
      stopTimer();
      intervalId = window.setInterval(update, 1000);
    }

    function renderPreview(config) {
      if (!landing) return;

      window.LaunchClock.applyTheme(landing.root, config.tpl, config.pal);
      landing.titleEl.textContent = config.name || "Your event";
      landing.dateEl.textContent = config.ts ? window.LaunchClock.formatEventDate(config.ts) : "Pick a date/time to start the countdown.";

      landing.descEl.hidden = !config.desc;
      landing.descEl.textContent = config.desc || "";

      if (config.ctaLabel && config.ctaUrl) {
        landing.ctaWrapEl.hidden = false;
        landing.ctaEl.textContent = config.ctaLabel;
        landing.ctaEl.href = config.ctaUrl;
      } else {
        landing.ctaWrapEl.hidden = true;
        landing.ctaEl.textContent = "";
        landing.ctaEl.removeAttribute("href");
      }

      function updateCountdown() {
        var parts = config.ts ? window.LaunchClock.getTimeParts(config.ts) : null;
        if (!parts) {
          landing.timeEls.days.textContent = "0";
          landing.timeEls.hours.textContent = "00";
          landing.timeEls.minutes.textContent = "00";
          landing.timeEls.seconds.textContent = "00";
          landing.expiredEl.hidden = true;
          return;
        }

        landing.timeEls.days.textContent = String(parts.days);
        landing.timeEls.hours.textContent = pad2(parts.hours);
        landing.timeEls.minutes.textContent = pad2(parts.minutes);
        landing.timeEls.seconds.textContent = pad2(parts.seconds);
        landing.expiredEl.hidden = !parts.isExpired;
      }

      updateCountdown();
      stopTimer();
      if (config.ts) startTimer(updateCountdown);

      if (landing.refreshBtn) {
        landing.refreshBtn.onclick = function () {
          updateCountdown();
          window.LaunchClock.showToast({ title: "Updated", message: "Countdown refreshed." });
        };
      }
    }

    function updateAll() {
      clearErrors();
      setShareStatus("");

      var draft = readDraft();
      var errors = validateDraft(draft);

      errors.forEach(function (e) {
        setFieldError(e.inputId, e.message);
      });

      renderPreview(draft);

      var heroMetric = window.LaunchClock.qs("[data-hero-metric]");
      if (heroMetric && draft.ts) {
        var parts = window.LaunchClock.getTimeParts(draft.ts);
        heroMetric.textContent = pad2(Math.max(0, Math.min(99, parts.days)));
      }

      if (errors.length) {
        writeShareLink(false, "");
        return { ok: false, errors: errors, draft: draft };
      }

      var base = new URL("countdown.html", window.location.href).toString();
      var shareUrl = window.LaunchClock.buildShareUrl(draft, base);
      writeShareLink(true, shareUrl);
      return { ok: true, errors: [], draft: draft, shareUrl: shareUrl };
    }

    var initial = updateAll();
    if (initial.ok) setShareStatus("Ready to copy.");

    form.addEventListener("input", function () {
      updateAll();
    });

    form.addEventListener("change", function () {
      updateAll();
    });

    var copyBtn = window.LaunchClock.qs("[data-copy-link]");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var res = updateAll();
        if (!res.ok) {
          showErrorSummary(res.errors);
          setShareStatus("Fix errors to generate a link.");
          return;
        }

        window.LaunchClock.copyTextToClipboard(res.shareUrl)
          .then(function () {
            setShareStatus("Link copied.");
            window.LaunchClock.showToast({ title: "Copied", message: "Share link copied to clipboard." });
          })
          .catch(function () {
            var input = document.getElementById("share-url");
            if (input) window.LaunchClock.selectInputForCopy(input);
            setShareStatus("Select the URL and press Ctrl/Cmd+C to copy.");
          });
      });
    }

    var openLink = window.LaunchClock.qs("[data-open-link]");
    if (openLink) {
      openLink.addEventListener("click", function (event) {
        var res = updateAll();
        if (!res.ok) {
          event.preventDefault();
          showErrorSummary(res.errors);
          setShareStatus("Fix errors to open the countdown page.");
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
