(function () {
  "use strict";

  var draftKey = "localbyte-contact-draft";
  var submissionKey = draftKey + "-submitted";
  var storageReadable = true;

  function clearSubmission() {
    try {
      sessionStorage.removeItem(submissionKey);
    } catch (e) {}
  }

  if (document.querySelector("[data-contact-success]")) {
    try {
      var submitted = JSON.parse(sessionStorage.getItem(submissionKey));
      var referrer = new URL(document.referrer);
      if (submitted && submitted.version === 1 &&
          referrer.origin === window.location.origin &&
          referrer.pathname === "/contact.html" && submitted.source === referrer.href &&
          typeof submitted.draft === "string" &&
          submitted.draft === sessionStorage.getItem(draftKey)) {
        sessionStorage.removeItem(draftKey);
      }
    } catch (e) {}
    clearSubmission();
    return;
  }

  var form = document.querySelector('form[name="contact"]');
  if (!form) return;

  var fieldNames = ["name", "email", "company", "service", "message"];
  var service = form.elements.namedItem("service");
  var draftNote = document.getElementById("contact-draft-note");
  var hasDraft = false;
  var unsavedEdits = false;
  var historyRestore = null;
  var historyRevision = 0;
  var serviceValues = [];
  var services = {
    "website": "Website",
    "single-page": "Single-page website",
    "business-website": "Business website",
    "business-plus": "Business Plus",
    "web-app": "Web App",
    "mobile-app": "Mobile App",
    "automation": "Automation",
    "discovery": "Discovery",
    "hosting": "Hosting",
    "website-care": "Website Care",
    "care-plus": "Care Plus",
    "application-care": "Application Care",
    "payment-plan": "Payment plan",
    "assessment": "Website assessment"
  };

  for (var i = 0; i < service.options.length; i++) {
    serviceValues.push(service.options[i].value);
  }

  function readDraft() {
    var raw;
    try {
      raw = sessionStorage.getItem(draftKey);
    } catch (e) {
      storageReadable = false;
      return null;
    }
    try {
      if (!raw) return null;
      var draft = JSON.parse(raw);
      if (!draft || draft.version !== 1 || !draft.fields) return null;
      for (var j = 0; j < fieldNames.length; j++) {
        if (typeof draft.fields[fieldNames[j]] !== "string") return null;
      }
      if (serviceValues.indexOf(draft.fields.service) === -1) return null;
      return draft.fields;
    } catch (e) {
      // A malformed draft must not prevent using the form.
      return null;
    }
  }

  function saveDraft() {
    var fields = {};
    for (var j = 0; j < fieldNames.length; j++) {
      fields[fieldNames[j]] = form.elements.namedItem(fieldNames[j]).value;
    }
    var serialized = JSON.stringify({ version: 1, fields: fields });
    hasDraft = true;
    try {
      sessionStorage.setItem(draftKey, serialized);
      unsavedEdits = false;
      if (draftNote) draftNote.hidden = false;
      return serialized;
    } catch (e) {
      unsavedEdits = true;
      if (draftNote) draftNote.hidden = true;
      return null;
    }
  }

  // Check storage separately so a blocked API is distinct from an invalid draft.
  try {
    sessionStorage.getItem(draftKey);
  } catch (e) {
    storageReadable = false;
  }

  function preselectService() {
    var requested = new URLSearchParams(window.location.search).get("service");
    if (Object.prototype.hasOwnProperty.call(services, requested)) {
      service.value = services[requested];
    }
  }

  clearSubmission();
  var saved = readDraft();
  if (saved) {
    for (var j = 0; j < fieldNames.length; j++) {
      form.elements.namedItem(fieldNames[j]).value = saved[fieldNames[j]];
    }
    hasDraft = true;
    if (draftNote) draftNote.hidden = false;
  } else {
    preselectService();
  }

  function cancelHistoryRestore() {
    historyRevision++;
    if (historyRestore !== null) {
      window.clearTimeout(historyRestore);
      historyRestore = null;
    }
  }

  function saveEdit() {
    cancelHistoryRestore();
    clearSubmission();
    saveDraft();
  }

  form.addEventListener("input", saveEdit);
  form.addEventListener("change", saveEdit);
  // The native POST owns only this submitted snapshot, never a subsequent draft.
  form.addEventListener("submit", function () {
    cancelHistoryRestore();
    if (!form.checkValidity()) return;
    clearSubmission();
    var submittedDraft = saveDraft();
    if (!submittedDraft) return;
    try {
      var source = new URL(window.location.href);
      source.hash = "";
      sessionStorage.setItem(submissionKey, JSON.stringify({
        version: 1, draft: submittedDraft, source: source.href
      }));
    } catch (e) {}
  });
  window.addEventListener("pagehide", function () {
    var reconciliationPending = historyRestore !== null;
    cancelHistoryRestore();
    // A cached form awaiting reconciliation can be older than the shared draft.
    if (hasDraft && !reconciliationPending) saveDraft();
  });
  window.addEventListener("pageshow", function (event) {
    var navigation = window.performance.getEntriesByType("navigation")[0];
    if (!event.persisted && (!navigation || navigation.type !== "back_forward")) return;
    clearSubmission();
    cancelHistoryRestore();
    var revision = historyRevision;
    // Browsers may restore native form state after pageshow even without BFCache.
    // Reconcile afterwards; any edit, submit, or navigation cancels this task.
    historyRestore = window.setTimeout(function () {
      historyRestore = null;
      if (revision !== historyRevision || !storageReadable || unsavedEdits) return;
      var current = readDraft();
      if (!storageReadable) return;
      if (current) {
        for (var j = 0; j < fieldNames.length; j++) {
          form.elements.namedItem(fieldNames[j]).value = current[fieldNames[j]];
        }
        hasDraft = true;
        if (draftNote) draftNote.hidden = false;
      } else {
        // A submitted draft must not reappear through native history restoration.
        form.reset();
        preselectService();
        hasDraft = false;
        if (draftNote) draftNote.hidden = true;
      }
    }, 0);
  });
})();
