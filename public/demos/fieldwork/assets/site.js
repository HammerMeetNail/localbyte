(function () {
  "use strict";

  var form = document.getElementById("inquiry-form");
  if (form) {
    var requestType = document.getElementById("request-type");
    var branches = form.querySelectorAll("[data-request]");
    var nextToggle = document.getElementById("add-next-step");
    var nextFields = document.getElementById("next-step-fields");
    var nextStep = document.getElementById("next-step");
    var review = document.getElementById("inquiry-review");
    var summary = document.getElementById("review-summary");
    var status = document.getElementById("form-status");
    var reviewButton = document.getElementById("review-button");
    var editButton = document.getElementById("edit-inquiry");

    function clearReview() {
      summary.textContent = "";
      review.hidden = true;
      form.hidden = false;
      status.textContent = "";
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
      nextFields.hidden = !nextToggle.checked;
      nextStep.disabled = !nextToggle.checked;
    }

    function addSummary(label, value) {
      var item = document.createElement("div");
      var term = document.createElement("dt");
      var detail = document.createElement("dd");
      term.textContent = label;
      detail.textContent = value;
      item.appendChild(term);
      item.appendChild(detail);
      summary.appendChild(item);
    }

    // Register the local-only submit handler before enabling the control.
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearReview();
      syncFields();
      if (!form.reportValidity()) {
        status.textContent =
          "Please complete the required sample details before reviewing.";
        return;
      }
      Array.prototype.forEach.call(form.elements, function (control) {
        if (
          !control.name ||
          control.disabled ||
          control.type === "checkbox" ||
          control.tagName === "FIELDSET"
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
      });
      form.hidden = true;
      review.hidden = false;
      document.getElementById("review-heading").focus();
    });

    form.addEventListener("input", clearReview);
    form.addEventListener("change", function () {
      clearReview();
      syncFields();
    });
    form.addEventListener("invalid", clearReview, true);
    form.addEventListener("reset", function (event) {
      // Reset synchronously so no delayed callback can restore old state.
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
      requestType.focus();
    });
    editButton.addEventListener("click", function () {
      clearReview();
      syncFields();
      requestType.focus();
    });
    window.addEventListener("pageshow", function () {
      clearReview();
      syncFields();
    });
    syncFields();
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
          " illustrations" +
          (filter === "all"
            ? " across all spaces."
            : " in " + button.textContent.toLowerCase() + ".");
      });
    });
    galleryTools.hidden = false;
  }
})();
