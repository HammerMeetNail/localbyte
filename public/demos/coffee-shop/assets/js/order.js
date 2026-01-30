(function () {
  var STORAGE_KEY = "cedarsteam.orderItems";

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return (root || document).querySelectorAll(selector);
  }

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
    } catch (e) {
    }
  }

  function safeRemove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
    }
  }

  function parseIds(value) {
    if (!value) return [];
    try {
      var parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function loadMenuIndex() {
    if (!window.fetch) return Promise.resolve({});
    return fetch("assets/data/menu.json", { credentials: "same-origin" })
      .then(function (res) {
        if (!res.ok) throw new Error("bad response");
        return res.json();
      })
      .then(function (data) {
        var out = {};
        if (!data || !data.items) return out;
        for (var i = 0; i < data.items.length; i++) {
          var item = data.items[i];
          if (item && item.id) out[item.id] = item;
        }
        return out;
      })
      .catch(function () {
        return {};
      });
  }

  function renderSelectedItems(menuIndex) {
    var section = qs("[data-selected-items]");
    if (!section) return;

    var empty = qs("[data-selected-empty]", section);
    var list = qs("[data-selected-list]", section);
    var clearBtn = qs("[data-clear-items]", section);

    var ids = parseIds(safeGet(STORAGE_KEY));
    if (!list) return;
    list.innerHTML = "";

    if (!ids.length) {
      if (empty) empty.hidden = false;
      if (clearBtn) clearBtn.disabled = true;
      return;
    }

    if (empty) empty.hidden = true;
    if (clearBtn) clearBtn.disabled = false;

    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      var item = menuIndex[id];
      var name = item && item.name ? item.name : id;
      var li = document.createElement("li");
      li.innerHTML = ""
        + "<div>"
        + "<div class=\"selected-item-name\">" + name + "</div>"
        + (item && item.price ? "<div class=\"small muted\">" + item.price + "</div>" : "")
        + "</div>"
        + "<button class=\"button small secondary\" type=\"button\" data-remove-item=\"" + id + "\">Remove</button>";
      list.appendChild(li);
    }
  }

  function syncItemsTextarea(menuIndex) {
    var textarea = qs("#order-items");
    if (!textarea) return;

    var ids = parseIds(safeGet(STORAGE_KEY));
    if (!ids.length) return;

    var lines = [];
    for (var i = 0; i < ids.length; i++) {
      var item = menuIndex[ids[i]];
      lines.push("1x " + (item && item.name ? item.name : ids[i]));
    }
    if (!textarea.value.trim()) textarea.value = lines.join("\n");
  }

  function setError(input, message) {
    if (!input) return;
    var id = input.id;
    if (!id) return;
    var error = qs("#error-" + id);
    if (!error) return;

    error.textContent = message;
    error.hidden = false;
    input.setAttribute("aria-invalid", "true");

    var describedBy = (input.getAttribute("aria-describedby") || "").split(" ").filter(Boolean);
    if (describedBy.indexOf(error.id) === -1) describedBy.push(error.id);
    input.setAttribute("aria-describedby", describedBy.join(" "));
  }

  function clearError(input) {
    if (!input || !input.id) return;
    var error = qs("#error-" + input.id);
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
    input.removeAttribute("aria-invalid");

    if (error && error.id) {
      var describedBy = (input.getAttribute("aria-describedby") || "").split(" ").filter(Boolean);
      var next = describedBy.filter(function (x) { return x !== error.id; });
      if (next.length) input.setAttribute("aria-describedby", next.join(" "));
      else input.removeAttribute("aria-describedby");
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  }

  function showErrorSummary(errors) {
    var summary = qs("[data-error-summary]");
    var list = qs("[data-error-list]");
    if (!summary || !list) return;

    list.innerHTML = "";
    for (var i = 0; i < errors.length; i++) {
      var err = errors[i];
      var li = document.createElement("li");
      li.innerHTML = "<a class=\"text-link\" href=\"#" + err.id + "\">" + err.message + "</a>";
      list.appendChild(li);
    }

    summary.hidden = false;
    summary.focus();
  }

  function hideErrorSummary() {
    var summary = qs("[data-error-summary]");
    var list = qs("[data-error-list]");
    if (list) list.innerHTML = "";
    if (summary) summary.hidden = true;
  }

  function getMode(form) {
    var mode = form.elements.mode ? form.elements.mode.value : "order";
    return mode === "reserve" ? "reserve" : "order";
  }

  function setMode(form, next) {
    var sections = qsa("[data-mode]");
    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      var mode = section.getAttribute("data-mode");
      section.toggleAttribute("hidden", mode !== next);
    }
  }

  function validate(form, mode) {
    var errors = [];

    function req(id, message) {
      var input = qs("#" + id, form);
      if (!input) return;
      clearError(input);
      if (!input.value || !String(input.value).trim()) {
        errors.push({ id: id, message: message });
        setError(input, message);
      }
    }

    var honeypot = qs("#website", form);
    if (honeypot && honeypot.value) {
      errors.push({ id: "name", message: "Submission blocked." });
      return errors;
    }

    if (mode === "order") {
      req("pickup-time", "Pickup time is required.");
      req("order-items", "Items are required.");
    } else {
      req("res-date", "Reservation date is required.");
      req("res-time", "Reservation time is required.");
      req("party-size", "Party size is required.");
    }

    req("name", "Name is required.");
    req("email", "Email is required.");

    var email = qs("#email", form);
    if (email && email.value && !isValidEmail(email.value)) {
      errors.push({ id: "email", message: "Email must be a valid address." });
      setError(email, "Email must be a valid address.");
    }

    if (mode === "reserve") {
      var party = qs("#party-size", form);
      if (party && party.value) {
        var n = Number(party.value);
        if (!isFinite(n) || n < 1 || n > 12) {
          errors.push({ id: "party-size", message: "Party size must be between 1 and 12." });
          setError(party, "Party size must be between 1 and 12.");
        }
      }
    }

    return errors;
  }

  function initForm(menuIndex) {
    var form = qs("#order-form");
    if (!form) return;

    setMode(form, getMode(form));

    form.addEventListener("change", function (event) {
      if (!event.target || event.target.name !== "mode") return;
      hideErrorSummary();
      setMode(form, getMode(form));
    });

    form.addEventListener("input", function (event) {
      if (!event.target) return;
      if (event.target.getAttribute && event.target.getAttribute("aria-invalid") === "true") {
        clearError(event.target);
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      hideErrorSummary();

      var mode = getMode(form);
      var errors = validate(form, mode);
      if (errors.length) {
        showErrorSummary(errors);
        return;
      }

      var success = qs("[data-success]");
      var formCard = form.closest(".card");
      if (formCard) formCard.hidden = true;
      if (success) success.hidden = false;

      safeRemove(STORAGE_KEY);
    });

    var resetBtn = qs("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        window.location.reload();
      });
    }

    var clearBtn = qs("[data-clear-items]");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        safeRemove(STORAGE_KEY);
        renderSelectedItems(menuIndex);
        var textarea = qs("#order-items");
        if (textarea) textarea.value = "";
      });
    }

    document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-remove-item]");
      if (!btn) return;
      var id = btn.getAttribute("data-remove-item");
      if (!id) return;
      var ids = parseIds(safeGet(STORAGE_KEY)).filter(function (x) { return x !== id; });
      safeSet(STORAGE_KEY, JSON.stringify(ids));
      renderSelectedItems(menuIndex);
      syncItemsTextarea(menuIndex);
    });
  }

  function init() {
    loadMenuIndex().then(function (menuIndex) {
      renderSelectedItems(menuIndex);
      syncItemsTextarea(menuIndex);
      initForm(menuIndex);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
