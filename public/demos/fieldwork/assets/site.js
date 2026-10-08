(function () {
  "use strict";

  var form = document.getElementById("inquiry-form");
  if (!form) {
    return;
  }

  var requestType = document.getElementById("request-type");
  var steps = form.querySelectorAll("[data-step]");
  var progressItems = document.querySelectorAll("[data-progress]");
  var branches = form.querySelectorAll("[data-request]");
  var controls = form.querySelectorAll("input, select, textarea");
  var nextToggle = document.getElementById("add-next-step");
  var nextFields = document.getElementById("next-step-fields");
  var nextStep = document.getElementById("next-step");
  var nextButton = document.getElementById("brief-next");
  var backButton = document.getElementById("brief-back");
  var reviewButton = document.getElementById("review-button");
  var navigation = document.querySelector(".brief-controls");
  var review = document.getElementById("inquiry-review");
  var summary = document.getElementById("review-summary");
  var progressStatus = document.getElementById("brief-status");
  var formStatus = document.getElementById("form-status");
  var currentStep = 0;

  function syncFields() {
    Array.prototype.forEach.call(steps, function (step) {
      step.hidden = Number(step.getAttribute("data-step")) !== currentStep;
    });
    Array.prototype.forEach.call(branches, function (branch) {
      branch.hidden = branch.getAttribute("data-request") !== requestType.value;
    });
    Array.prototype.forEach.call(
      form.querySelectorAll("fieldset"),
      function (fieldset) {
        var owner = fieldset.closest("[data-step]");
        var branch = fieldset.closest("[data-request]");
        fieldset.disabled =
          Number(owner.getAttribute("data-step")) !== currentStep ||
          Boolean(
            branch && branch.getAttribute("data-request") !== requestType.value,
          );
      },
    );
    Array.prototype.forEach.call(controls, function (control) {
      var owner = control.closest("[data-step]");
      var branch = control.closest("[data-request]");
      var active =
        Number(owner.getAttribute("data-step")) === currentStep &&
        (!branch || branch.getAttribute("data-request") === requestType.value);
      if (control === nextStep) {
        active = active && nextToggle.checked;
      }
      control.disabled = !active;
      control.required = active && control.hasAttribute("data-required");
    });
    nextFields.hidden = !nextToggle.checked;
  }

  function showStep(index, moveFocus, announce) {
    currentStep = index;
    form.hidden = index === 2;
    review.hidden = index !== 2;
    nextButton.hidden = index !== 0;
    backButton.hidden = index !== 1;
    reviewButton.hidden = index !== 1;
    Array.prototype.forEach.call(progressItems, function (item) {
      if (Number(item.getAttribute("data-progress")) === index) {
        item.setAttribute("aria-current", "step");
      } else {
        item.removeAttribute("aria-current");
      }
    });
    syncFields();
    formStatus.textContent = "";
    if (announce !== false) {
      var labels = ["Your need", "Site and context", "Local review"];
      progressStatus.textContent =
        "Step " +
        (index + 1) +
        " of 3: " +
        labels[index] +
        ". Nothing is sent or saved.";
    }
    if (moveFocus) {
      var target =
        index === 2
          ? "review-heading"
          : index === 1
            ? "step-two-heading"
            : "step-one-heading";
      document.getElementById(target).focus();
    }
  }

  function clearReview() {
    summary.textContent = "";
    review.hidden = true;
    formStatus.textContent = "";
    if (currentStep === 2) {
      showStep(0, false);
    }
  }

  function validateVisibleStep() {
    var invalid = null;
    Array.prototype.forEach.call(controls, function (control) {
      if (!invalid && !control.disabled && !control.checkValidity()) {
        invalid = control;
      }
    });
    if (invalid) {
      formStatus.textContent =
        "Please complete the required details in this step.";
      invalid.reportValidity();
      return false;
    }
    return true;
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

  function renderReview() {
    summary.textContent = "";
    Array.prototype.forEach.call(controls, function (control) {
      var branch = control.closest("[data-request]");
      if (
        !control.name ||
        control.type === "checkbox" ||
        (branch && branch.getAttribute("data-request") !== requestType.value) ||
        (control === nextStep && !nextToggle.checked)
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
    showStep(2, true);
  }

  function advance() {
    clearReview();
    syncFields();
    if (validateVisibleStep()) {
      showStep(1, true);
    }
  }

  // Intercept first, then opt into visible-step native validation and enable actions.
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (currentStep === 0) {
      advance();
      return;
    }
    clearReview();
    // Recheck both steps synchronously; a failing control is visible and enabled.
    for (var index = 0; index < 2; index += 1) {
      showStep(index, false, false);
      if (!validateVisibleStep()) {
        progressStatus.textContent =
          "Step " + (index + 1) + " of 3 needs a little more detail.";
        return;
      }
    }
    renderReview();
  });
  nextButton.addEventListener("click", advance);
  backButton.addEventListener("click", function () {
    clearReview();
    showStep(0, true);
  });
  form.addEventListener("input", function () {
    clearReview();
    syncFields();
  });
  form.addEventListener("change", function () {
    clearReview();
    syncFields();
  });
  form.addEventListener("reset", function (event) {
    event.preventDefault();
    clearReview();
    Array.prototype.forEach.call(controls, function (control) {
      if (control.type === "checkbox") {
        control.checked = false;
      } else if (control.tagName === "SELECT") {
        control.selectedIndex = 0;
      } else {
        control.value = "";
      }
    });
    showStep(0, false);
    requestType.focus();
  });
  document
    .getElementById("edit-inquiry")
    .addEventListener("click", function () {
      clearReview();
      showStep(0, false);
      requestType.focus();
    });
  document
    .getElementById("reset-review")
    .addEventListener("click", function () {
      form.reset();
    });
  window.addEventListener("pageshow", function () {
    clearReview();
    showStep(0, false);
  });

  form.noValidate = true;
  navigation.hidden = false;
  nextButton.disabled = false;
  reviewButton.disabled = false;
  showStep(0, false);
})();
