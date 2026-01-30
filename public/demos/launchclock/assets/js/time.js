(function () {
  function parseDatetimeLocalToTs(value) {
    var raw = (value == null ? "" : String(value)).trim();
    if (!raw) return null;

    var parts = raw.split("T");
    if (parts.length !== 2) return null;

    var dateBits = parts[0].split("-");
    var timeBits = parts[1].split(":");
    if (dateBits.length !== 3 || timeBits.length < 2) return null;

    var year = Number(dateBits[0]);
    var month = Number(dateBits[1]);
    var day = Number(dateBits[2]);
    var hour = Number(timeBits[0]);
    var minute = Number(timeBits[1]);

    if (![year, month, day, hour, minute].every(function (n) { return isFinite(n); })) return null;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    if (hour < 0 || hour > 23) return null;
    if (minute < 0 || minute > 59) return null;

    var d = new Date(year, month - 1, day, hour, minute, 0, 0);
    var ts = d.getTime();
    if (!isFinite(ts)) return null;
    return ts;
  }

  function formatTsForDatetimeLocal(ts) {
    if (ts == null || !isFinite(ts)) return "";
    var d = new Date(ts);
    var yyyy = String(d.getFullYear());
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    var hh = String(d.getHours()).padStart(2, "0");
    var min = String(d.getMinutes()).padStart(2, "0");
    return yyyy + "-" + mm + "-" + dd + "T" + hh + ":" + min;
  }

  function getTimeParts(targetTs, nowTs) {
    var now = (nowTs == null ? Date.now() : nowTs);
    var diffMs = Number(targetTs) - Number(now);
    if (!isFinite(diffMs)) {
      return { isExpired: true, totalSeconds: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    var isExpired = diffMs <= 0;
    var totalSeconds = isExpired ? 0 : Math.floor((diffMs + 999) / 1000);

    var days = Math.floor(totalSeconds / 86400);
    var remainder = totalSeconds % 86400;
    var hours = Math.floor(remainder / 3600);
    remainder = remainder % 3600;
    var minutes = Math.floor(remainder / 60);
    var seconds = remainder % 60;

    return { isExpired: isExpired, totalSeconds: totalSeconds, days: days, hours: hours, minutes: minutes, seconds: seconds };
  }

  function formatEventDate(ts) {
    if (ts == null || !isFinite(ts)) return "";
    try {
      var fmt = new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "short" });
      return fmt.format(new Date(ts));
    } catch (e) {
      return new Date(ts).toLocaleString();
    }
  }

  var api = {
    parseDatetimeLocalToTs: parseDatetimeLocalToTs,
    formatTsForDatetimeLocal: formatTsForDatetimeLocal,
    getTimeParts: getTimeParts,
    formatEventDate: formatEventDate
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

