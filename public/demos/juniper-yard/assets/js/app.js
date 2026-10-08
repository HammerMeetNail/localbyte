(function () {
  "use strict";

  var form = document.getElementById("inquiry-form");
  var preview = document.getElementById("form-preview");
  if (!form || !preview) {
    return;
  }

  var submitButton = form.querySelector("[type='submit']");
  var nameOutput = document.getElementById("preview-name");
  var emailOutput = document.getElementById("preview-email");
  var interestOutput = document.getElementById("preview-interest");
  var messageOutput = document.getElementById("preview-message");

  function clearPreview() {
    preview.hidden = true;
    nameOutput.textContent = "";
    emailOutput.textContent = "";
    interestOutput.textContent = "";
    messageOutput.textContent = "";
  }

  form.addEventListener("input", clearPreview);
  form.addEventListener("change", clearPreview);
  form.addEventListener("reset", clearPreview);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var values = new FormData(form);
    nameOutput.textContent = values.get("name").trim();
    emailOutput.textContent = values.get("email").trim();
    interestOutput.textContent = values.get("interest");
    messageOutput.textContent = values.get("message").trim();
    preview.hidden = false;
    preview.focus();
  });

  submitButton.disabled = false;
})();
