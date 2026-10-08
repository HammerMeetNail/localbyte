(function () {
  "use strict";

  var form = document.getElementById("inquiry-form");
  if (form) {
    var requestType = document.getElementById("request-type");
    var branches = form.querySelectorAll("[data-request]");
    var nextToggle = document.getElementById("add-next-step");
    var nextFields = document.getElementById("next-step-fields");
    var nextStep = document.getElementById("next-step");
    var guestWrap = document.getElementById("guest-wrap");
    var guests = document.getElementById("guests");
    var period = document.getElementById("period");
    var draft = document.getElementById("draft-layout");
    var snapshot = document.getElementById("planning-snapshot");
    var snapshotStatus = document.getElementById("snapshot-status");
    var review = document.getElementById("inquiry-review");
    var summary = document.getElementById("review-summary");
    var status = document.getElementById("form-status");
    var reviewButton = document.getElementById("review-button");

    function selectedText(control, fallback) {
      return control.value
        ? control.options[control.selectedIndex].textContent
        : fallback;
    }

    function syncFields() {
      Array.prototype.forEach.call(branches, function (branch) {
        var active = branch.getAttribute("data-request") === requestType.value;
        branch.hidden = !active;
        branch.disabled = !active;
        Array.prototype.forEach.call(
          branch.querySelectorAll("input, select, textarea"),
          function (control) {
            control.disabled = !active;
            control.required = active && control.hasAttribute("data-required");
          },
        );
      });
      var hasGuests =
        requestType.value === "celebration" || requestType.value === "meeting";
      guestWrap.hidden = !hasGuests;
      guests.disabled = !hasGuests;
      nextFields.hidden = !nextToggle.checked;
      nextStep.disabled = !nextToggle.checked;
    }

    function updateSnapshot() {
      var occasion = "Choose your starting point";
      if (requestType.value === "celebration") {
        occasion = selectedText(
          document.getElementById("occasion"),
          "A celebration — details to come",
        );
      } else if (requestType.value === "meeting") {
        occasion = selectedText(
          document.getElementById("meeting-format"),
          "A meeting — details to come",
        );
      } else if (requestType.value === "visit") {
        occasion = selectedText(
          document.getElementById("visit-focus"),
          "A first look at the venue",
        );
      }
      document.getElementById("snapshot-occasion").textContent = occasion;
      document.getElementById("snapshot-guests").textContent =
        requestType.value === "visit"
          ? "A venue visit"
          : !guests.disabled && guests.value && guests.validity.valid
            ? guests.value + " people, approximately"
            : "Add a guest count if useful";
      document.getElementById("snapshot-period").textContent =
        period.value.trim() || "Open for discussion";
      document.getElementById("snapshot-next").textContent = nextToggle.checked
        ? selectedText(nextStep, "Not specified")
        : "Not specified";
    }

    function clearReview() {
      summary.textContent = "";
      review.hidden = true;
      form.hidden = false;
      draft.hidden = false;
      status.textContent = "";
    }

    function addSummary(label, value) {
      var row = document.createElement("div");
      var term = document.createElement("dt");
      var detail = document.createElement("dd");
      term.textContent = label;
      detail.textContent = value;
      row.appendChild(term);
      row.appendChild(detail);
      summary.appendChild(row);
    }

    // Attach the local-only handler before enabling submission.
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearReview();
      syncFields();
      if (!form.reportValidity()) {
        status.textContent =
          "Please complete the required sample details before reviewing.";
        return;
      }
      Array.prototype.forEach.call(
        form.querySelectorAll("input, select, textarea"),
        function (control) {
          if (
            !control.name ||
            control.disabled ||
            control.type === "checkbox"
          ) {
            return;
          }
          var value = control.value.trim();
          if (!value) {
            return;
          }
          if (control.tagName === "SELECT") {
            value = control.options[control.selectedIndex].textContent;
          }
          var label = control.labels && control.labels[0];
          addSummary(label ? label.textContent.trim() : control.name, value);
        },
      );
      form.hidden = true;
      draft.hidden = true;
      review.hidden = false;
      document.getElementById("review-heading").focus();
    });
    form.addEventListener("input", function () {
      clearReview();
      syncFields();
      updateSnapshot();
    });
    form.addEventListener("change", function () {
      clearReview();
      syncFields();
      updateSnapshot();
      snapshotStatus.textContent =
        "Your local planning notes now reflect the current details.";
    });
    form.addEventListener(
      "invalid",
      function () {
        clearReview();
        syncFields();
        updateSnapshot();
      },
      true,
    );
    form.addEventListener("reset", function (event) {
      event.preventDefault();
      clearReview();
      Array.prototype.forEach.call(
        form.querySelectorAll("input, select, textarea"),
        function (control) {
          if (control.type === "checkbox") {
            control.checked = false;
          } else if (control.tagName === "SELECT") {
            control.selectedIndex = 0;
          } else {
            control.value = "";
          }
        },
      );
      syncFields();
      updateSnapshot();
      snapshotStatus.textContent =
        "Planning notes cleared. Begin with a new occasion.";
      requestType.focus();
    });
    document
      .getElementById("edit-inquiry")
      .addEventListener("click", function () {
        clearReview();
        syncFields();
        updateSnapshot();
        requestType.focus();
      });
    document
      .getElementById("reset-review")
      .addEventListener("click", function () {
        form.reset();
      });
    window.addEventListener("pageshow", function () {
      clearReview();
      syncFields();
      updateSnapshot();
      snapshotStatus.textContent = "";
    });
    syncFields();
    updateSnapshot();
    snapshot.hidden = false;
    reviewButton.disabled = false;
  }

  var galleryTools = document.querySelector(".gallery-tools");
  if (galleryTools) {
    var galleryItems = document.querySelectorAll(".gallery-item");
    var galleryStatus = document.querySelector(".gallery-status");
    var filters = galleryTools.querySelectorAll("[data-filter]");
    Array.prototype.forEach.call(filters, function (button) {
      button.addEventListener("click", function () {
        var filter = button.getAttribute("data-filter");
        var count = 0;
        Array.prototype.forEach.call(galleryItems, function (item) {
          var visible =
            filter === "all" || item.getAttribute("data-category") === filter;
          item.hidden = !visible;
          if (visible) {
            count += 1;
          }
        });
        Array.prototype.forEach.call(filters, function (other) {
          other.setAttribute(
            "aria-pressed",
            other === button ? "true" : "false",
          );
        });
        galleryStatus.textContent =
          "Showing " +
          count +
          " concept views" +
          (filter === "all"
            ? " across all spaces."
            : " in " + button.textContent.toLowerCase() + ".");
      });
    });
    galleryTools.hidden = false;
  }
})();
