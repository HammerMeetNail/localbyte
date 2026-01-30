(function () {
  function applyTheme(root, tpl, pal) {
    if (!root) return;
    root.setAttribute("data-tpl", tpl || "minimal");
    root.setAttribute("data-pal", pal || "teal");
  }

  function createLanding(root, options) {
    var opts = options || {};
    var showShare = opts.showShare !== false;
    var showSignup = opts.showSignup !== false;
    var titleTag = opts.titleTag || "h1";

    root.innerHTML = "";

    var wrapper = document.createElement("div");
    wrapper.className = "lc-root";

    var shell = document.createElement("div");
    shell.className = "lc-shell";

    var head = document.createElement("header");
    head.className = "lc-head";

    var kicker = document.createElement("div");
    kicker.className = "lc-kicker";
    kicker.textContent = "Countdown";

    var title = document.createElement(titleTag);
    title.className = "lc-title";
    if (titleTag !== "h1" && titleTag !== "h2" && titleTag !== "h3" && titleTag !== "h4" && titleTag !== "h5" && titleTag !== "h6") {
      title.setAttribute("role", "heading");
      title.setAttribute("aria-level", "1");
    }

    var date = document.createElement("p");
    date.className = "lc-date";

    var desc = document.createElement("p");
    desc.className = "lc-desc";

    var ctaWrap = document.createElement("div");
    ctaWrap.className = "lc-cta";
    ctaWrap.hidden = true;

    var cta = document.createElement("a");
    cta.className = "button primary";
    cta.target = "_blank";
    cta.rel = "noreferrer";
    ctaWrap.appendChild(cta);

    head.appendChild(kicker);
    head.appendChild(title);
    head.appendChild(date);
    head.appendChild(desc);
    head.appendChild(ctaWrap);

    var countdown = document.createElement("section");
    countdown.className = "lc-countdown";
    countdown.setAttribute("aria-label", "Time remaining");

    var timeGrid = document.createElement("ul");
    timeGrid.className = "lc-time-grid";

    function makeCard(label, key) {
      var li = document.createElement("li");
      li.className = "lc-time-card";
      var value = document.createElement("div");
      value.className = "lc-time-value";
      value.setAttribute("data-part", key);
      value.textContent = "0";
      var l = document.createElement("div");
      l.className = "lc-time-label";
      l.textContent = label;
      li.appendChild(value);
      li.appendChild(l);
      return li;
    }

    timeGrid.appendChild(makeCard("Days", "days"));
    timeGrid.appendChild(makeCard("Hours", "hours"));
    timeGrid.appendChild(makeCard("Minutes", "minutes"));
    timeGrid.appendChild(makeCard("Seconds", "seconds"));

    var expired = document.createElement("div");
    expired.className = "lc-expired";
    expired.hidden = true;
    var expiredTitle = document.createElement("strong");
    expiredTitle.textContent = "This event has started.";
    var expiredBody = document.createElement("div");
    expiredBody.className = "muted small";
    expiredBody.textContent = "Thanks for joining — check back for updates.";
    expired.appendChild(expiredTitle);
    expired.appendChild(expiredBody);

    var actions = document.createElement("div");
    actions.className = "lc-actions";

    var refresh = document.createElement("button");
    refresh.type = "button";
    refresh.className = "button secondary";
    refresh.textContent = "Refresh countdown";
    refresh.setAttribute("data-refresh", "true");

    actions.appendChild(refresh);

    countdown.appendChild(timeGrid);
    countdown.appendChild(expired);
    countdown.appendChild(actions);

    var shareSection = document.createElement("section");
    shareSection.className = "lc-share";
    if (!showShare) shareSection.hidden = true;
    var shareTitle = document.createElement("h2");
    shareTitle.textContent = "Share";
    var shareText = document.createElement("p");
    shareText.className = "muted small";
    shareText.textContent = "Copy the link or share it on your favorite platform.";
    var shareRow = document.createElement("div");
    shareRow.className = "lc-share-row";
    shareRow.setAttribute("data-share-row", "true");
    shareSection.appendChild(shareTitle);
    shareSection.appendChild(shareText);
    shareSection.appendChild(shareRow);

    var signupSection = document.createElement("section");
    signupSection.className = "lc-signup";
    if (!showSignup) signupSection.hidden = true;
    var signupTitle = document.createElement("h2");
    signupTitle.textContent = "Get a reminder";
    var signupIntro = document.createElement("p");
    signupIntro.className = "muted small";
    signupIntro.textContent = "Demo only — no emails are sent.";

    var form = document.createElement("form");
    form.className = "signup-form";
    form.setAttribute("data-signup-form", "true");
    form.noValidate = true;

    var emailLabel = document.createElement("label");
    emailLabel.className = "sr-only";
    emailLabel.setAttribute("for", "signup-email");
    emailLabel.textContent = "Email";

    var email = document.createElement("input");
    email.id = "signup-email";
    email.name = "email";
    email.type = "email";
    email.autocomplete = "email";
    email.required = true;
    email.placeholder = "you@example.com";

    var submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "button primary";
    submit.textContent = "Notify me";

    var status = document.createElement("p");
    status.className = "signup-note small muted";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("data-signup-status", "true");

    var clear = document.createElement("button");
    clear.type = "button";
    clear.className = "button secondary";
    clear.textContent = "Clear demo signups";
    clear.setAttribute("data-clear-signups", "true");

    form.appendChild(emailLabel);
    form.appendChild(email);
    form.appendChild(submit);

    signupSection.appendChild(signupTitle);
    signupSection.appendChild(signupIntro);
    signupSection.appendChild(form);
    signupSection.appendChild(status);
    signupSection.appendChild(clear);

    shell.appendChild(head);
    shell.appendChild(countdown);
    shell.appendChild(shareSection);
    shell.appendChild(signupSection);

    wrapper.appendChild(shell);
    root.appendChild(wrapper);

    return {
      root: wrapper,
      titleEl: title,
      dateEl: date,
      descEl: desc,
      ctaWrapEl: ctaWrap,
      ctaEl: cta,
      timeEls: {
        days: timeGrid.querySelector("[data-part=\"days\"]"),
        hours: timeGrid.querySelector("[data-part=\"hours\"]"),
        minutes: timeGrid.querySelector("[data-part=\"minutes\"]"),
        seconds: timeGrid.querySelector("[data-part=\"seconds\"]")
      },
      expiredEl: expired,
      refreshBtn: refresh,
      shareRowEl: shareRow,
      signupForm: form,
      signupEmail: email,
      signupStatus: status,
      clearSignupsBtn: clear
    };
  }

  var api = {
    applyTheme: applyTheme,
    createLanding: createLanding
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
