(function () {
  "use strict";

  var doc = document;
  var nav = doc.getElementById("site-nav");
  var menuButton = doc.querySelector(".menu-toggle");
  var mobileQuery = window.matchMedia("(max-width: 760px)");

  function closeMenu(restoreFocus) {
    if (!nav || !menuButton) {
      return;
    }
    nav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    if (restoreFocus) {
      menuButton.focus();
    }
  }

  if (nav && menuButton) {
    doc.documentElement.classList.add("js");
    menuButton.addEventListener("click", function () {
      var isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("is-open", !isOpen);
      if (!isOpen && mobileQuery.matches) {
        var firstLink = nav.querySelector("a");
        if (firstLink) {
          firstLink.focus();
        }
      }
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        closeMenu(false);
      }
    });
    doc.addEventListener("click", function (event) {
      if (
        nav.classList.contains("is-open") &&
        !nav.contains(event.target) &&
        !menuButton.contains(event.target)
      ) {
        closeMenu(false);
      }
    });
    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        closeMenu(true);
      }
    });
    mobileQuery.addEventListener("change", function () {
      var focusWouldBeHidden =
        mobileQuery.matches && nav.contains(doc.activeElement);
      closeMenu(false);
      if (focusWouldBeHidden) {
        menuButton.focus();
      }
    });
  }

  var form = doc.querySelector("[data-preview-form]");
  if (form) {
    var submitButton = form.querySelector('button[type="submit"]');
    var preview = form.querySelector("[data-preview]");
    var fields = form.querySelectorAll("input, select, textarea");

    if (submitButton && preview) {
      Array.prototype.forEach.call(fields, function (field) {
        field.addEventListener("input", clearPreview);
        field.addEventListener("change", clearPreview);
      });
      form.addEventListener("reset", clearPreview);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!form.reportValidity()) {
          return;
        }
        var name = form.elements.name.value.trim();
        var email = form.elements.email.value.trim();
        var message = form.elements.message.value.trim();
        var select = form.querySelector("select");
        var optional = select ? select.value : "";
        preview.replaceChildren();
        var heading = doc.createElement("h3");
        heading.textContent = "Inquiry preview";
        var note = doc.createElement("p");
        note.textContent =
          "This is a local preview only. No message was sent or saved.";
        var list = doc.createElement("dl");
        addPreviewItem(list, "Name", name);
        addPreviewItem(list, "Email", email);
        if (optional) {
          addPreviewItem(list, "Project type", optional);
        }
        addPreviewItem(list, "Details", message);
        preview.append(heading, note, list);
        preview.hidden = false;
      });
      submitButton.disabled = false;
    }

    function clearPreview() {
      if (preview && !preview.hidden) {
        preview.replaceChildren();
        preview.hidden = true;
      }
    }

    function addPreviewItem(list, labelText, valueText) {
      var term = doc.createElement("dt");
      term.textContent = labelText;
      var value = doc.createElement("dd");
      value.textContent = valueText;
      list.append(term, value);
    }
  }
})();
