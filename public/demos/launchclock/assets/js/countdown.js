(function () {
  var SIGNUPS_KEY = "lb.launchclock.signups";

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }

  function loadSignups() {
    try {
      var raw = localStorage.getItem(SIGNUPS_KEY);
      var parsed = safeJsonParse(raw, []);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveSignups(list) {
    try {
      localStorage.setItem(SIGNUPS_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function addSignup(email, config) {
    var list = loadSignups();
    list.unshift({
      email: email,
      createdAtTs: Date.now(),
      eventName: config.name,
      eventTs: config.ts,
      pageUrl: window.location.href
    });
    if (list.length > 50) list = list.slice(0, 50);
    saveSignups(list);
  }

  function clearSignups() {
    try {
      localStorage.removeItem(SIGNUPS_KEY);
    } catch (e) {}
  }

  function buildShareLinks(url, config) {
    var u = encodeURIComponent(url);
    var text = encodeURIComponent("Countdown to " + config.name + ".");
    var subject = encodeURIComponent("Countdown: " + config.name);
    var body = encodeURIComponent("Here’s the countdown link:\n\n" + url);
    return {
      x: "https://twitter.com/intent/tweet?url=" + u + "&text=" + text,
      linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=" + u,
      facebook: "https://www.facebook.com/sharer/sharer.php?u=" + u,
      email: "mailto:?subject=" + subject + "&body=" + body
    };
  }

  function renderInvalid(root, errors) {
    root.innerHTML = "";

    var card = document.createElement("div");
    card.className = "panel";

    var h1 = document.createElement("h1");
    h1.textContent = "Invalid countdown link";

    var p = document.createElement("p");
    p.className = "muted";
    p.textContent = "This countdown link is missing required information. Create a new one using the generator.";

    var list = document.createElement("ul");
    list.className = "small";
    list.style.margin = "0.9rem 0 1.25rem";
    list.style.paddingLeft = "1.25rem";

    (errors || []).slice(0, 6).forEach(function (e) {
      var li = document.createElement("li");
      li.textContent = e.message;
      list.appendChild(li);
    });

    var a = document.createElement("a");
    a.className = "button primary";
    a.href = "index.html";
    a.textContent = "Go to generator";

    card.appendChild(h1);
    card.appendChild(p);
    if (list.childNodes.length) card.appendChild(list);
    card.appendChild(a);
    root.appendChild(card);
  }

  function init() {
    var host = window.LaunchClock.qs("[data-landing-root]");
    if (!host) return;

    var parsed = window.LaunchClock.parseConfig(window.location.search);
    if (parsed.errors && parsed.errors.length) {
      renderInvalid(host, parsed.errors);
      return;
    }

    var config = parsed.config;
    document.title = config.name + " — LaunchClock Countdown";

    var landing = window.LaunchClock.createLanding(host, { showShare: true, showSignup: true, titleTag: "h1" });
    window.LaunchClock.applyTheme(landing.root, config.tpl, config.pal);

    landing.titleEl.textContent = config.name;
    landing.dateEl.textContent = window.LaunchClock.formatEventDate(config.ts);

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
      var parts = window.LaunchClock.getTimeParts(config.ts);
      landing.timeEls.days.textContent = String(parts.days);
      landing.timeEls.hours.textContent = pad2(parts.hours);
      landing.timeEls.minutes.textContent = pad2(parts.minutes);
      landing.timeEls.seconds.textContent = pad2(parts.seconds);
      landing.expiredEl.hidden = !parts.isExpired;
      if (parts.isExpired && timerId) {
        window.clearInterval(timerId);
        timerId = null;
      }
    }

    var timerId = window.setInterval(updateCountdown, 1000);
    updateCountdown();

    if (landing.refreshBtn) {
      landing.refreshBtn.addEventListener("click", function () {
        updateCountdown();
        window.LaunchClock.showToast({ title: "Updated", message: "Countdown refreshed." });
      });
    }

    var shareRow = landing.shareRowEl;
    if (shareRow) {
      shareRow.innerHTML = "";

      var shareUrl = window.location.href;
      var links = buildShareLinks(shareUrl, config);

      var copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "share-pill";
      copyBtn.textContent = "Copy link";
      copyBtn.addEventListener("click", function () {
        window.LaunchClock.copyTextToClipboard(shareUrl)
          .then(function () {
            window.LaunchClock.showToast({ title: "Copied", message: "Link copied to clipboard." });
          })
          .catch(function () {
            try {
              window.prompt("Copy this link", shareUrl);
            } catch (e) {}
          });
      });
      shareRow.appendChild(copyBtn);

      if (navigator.share) {
        var webShareBtn = document.createElement("button");
        webShareBtn.type = "button";
        webShareBtn.className = "share-pill";
        webShareBtn.textContent = "Share…";
        webShareBtn.addEventListener("click", function () {
          navigator.share({ title: config.name, text: "Countdown to " + config.name + ".", url: shareUrl }).catch(function () {});
        });
        shareRow.appendChild(webShareBtn);
      }

      function addLink(label, href) {
        var a = document.createElement("a");
        a.className = "share-pill";
        a.href = href;
        a.target = "_blank";
        a.rel = "noreferrer";
        a.textContent = label;
        shareRow.appendChild(a);
      }

      addLink("X", links.x);
      addLink("LinkedIn", links.linkedin);
      addLink("Facebook", links.facebook);
      addLink("Email", links.email);
    }

    if (landing.signupForm && landing.signupEmail && landing.signupStatus && landing.clearSignupsBtn) {
      landing.signupForm.addEventListener("submit", function (event) {
        event.preventDefault();
        landing.signupStatus.textContent = "";
        landing.signupEmail.removeAttribute("aria-invalid");

        var email = String(landing.signupEmail.value || "").trim();
        if (!email || !landing.signupEmail.checkValidity()) {
          landing.signupEmail.setAttribute("aria-invalid", "true");
          landing.signupStatus.textContent = "Enter a valid email address.";
          landing.signupEmail.focus();
          return;
        }

        addSignup(email, config);
        landing.signupEmail.value = "";
        landing.signupStatus.textContent = "Thanks — you’re on the list (demo).";
        window.LaunchClock.showToast({ title: "Signed up", message: "Saved locally (demo only)." });
      });

      landing.clearSignupsBtn.addEventListener("click", function () {
        clearSignups();
        landing.signupStatus.textContent = "Demo signups cleared.";
        window.LaunchClock.showToast({ title: "Cleared", message: "Removed local demo signups." });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
