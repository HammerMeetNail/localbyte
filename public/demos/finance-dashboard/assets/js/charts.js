(function () {
  if (!window.ClearLedger) window.ClearLedger = {};

  function el(name, attrs) {
    var node = document.createElementNS("http://www.w3.org/2000/svg", name);
    if (attrs) {
      for (var key in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, key)) {
          node.setAttribute(key, attrs[key]);
        }
      }
    }
    return node;
  }

  function renderBarChart(container, items, formatter) {
    if (!container) return;
    container.innerHTML = "";

    if (!items || !items.length) {
      container.innerHTML = "<p class=\"muted\">No expense data for this range.</p>";
      return;
    }

    var width = 560;
    var height = 260;
    var padding = { top: 20, right: 16, bottom: 26, left: 120 };
    var max = 0;
    for (var i = 0; i < items.length; i++) max = Math.max(max, items[i].cents || 0);
    if (max <= 0) max = 1;

    var svg = el("svg", { viewBox: "0 0 " + width + " " + height, role: "img", "aria-label": "Expenses by category bar chart", class: "chart-svg" });
    svg.style.width = "100%";
    svg.style.height = "auto";

    var plotWidth = width - padding.left - padding.right;
    var plotHeight = height - padding.top - padding.bottom;
    var rowHeight = plotHeight / Math.min(items.length, 7);
    var barHeight = Math.max(10, rowHeight * 0.58);

    var shown = items.slice(0, 7);
    for (var j = 0; j < shown.length; j++) {
      var item = shown[j];
      var y = padding.top + j * rowHeight + (rowHeight - barHeight) / 2;
      var ratio = (item.cents || 0) / max;
      var barWidth = Math.max(0, Math.round(plotWidth * ratio));

      var label = el("text", { x: padding.left - 10, y: y + barHeight - 2, "text-anchor": "end", "font-size": "12" });
      label.textContent = item.label;
      svg.appendChild(label);

      var bg = el("rect", { x: padding.left, y: y, width: plotWidth, height: barHeight, rx: 6, class: "chart-bar-track" });
      svg.appendChild(bg);

      var bar = el("rect", { x: padding.left, y: y, width: barWidth, height: barHeight, rx: 6, class: "chart-bar-fill" });
      svg.appendChild(bar);

      var value = el("text", { x: padding.left + plotWidth, y: y + barHeight - 2, "text-anchor": "end", "font-size": "12" });
      value.textContent = formatter(item.cents || 0);
      svg.appendChild(value);
    }

    container.appendChild(svg);
  }

  function renderLineChart(container, series, formatter) {
    if (!container) return;
    container.innerHTML = "";

    if (!series || !series.length) {
      container.innerHTML = "<p class=\"muted\">No data for this range.</p>";
      return;
    }

    var width = 620;
    var height = 260;
    var padding = { top: 22, right: 16, bottom: 34, left: 50 };
    var svg = el("svg", { viewBox: "0 0 " + width + " " + height, role: "img", "aria-label": "Income vs expenses trend chart", class: "chart-svg" });
    svg.style.width = "100%";
    svg.style.height = "auto";

    var plotWidth = width - padding.left - padding.right;
    var plotHeight = height - padding.top - padding.bottom;

    var max = 0;
    for (var i = 0; i < series.length; i++) {
      max = Math.max(max, series[i].incomeCents || 0, series[i].expenseCents || 0);
    }
    if (max <= 0) max = 1;

    function xAt(index) {
      if (series.length === 1) return padding.left + plotWidth / 2;
      return padding.left + Math.round((plotWidth * index) / (series.length - 1));
    }

    function yAt(valueCents) {
      var ratio = (valueCents || 0) / max;
      return padding.top + Math.round(plotHeight - plotHeight * ratio);
    }

    var axes = el("g");
    axes.appendChild(el("line", { x1: padding.left, y1: padding.top + plotHeight, x2: padding.left + plotWidth, y2: padding.top + plotHeight, class: "chart-axis" }));
    axes.appendChild(el("line", { x1: padding.left, y1: padding.top, x2: padding.left, y2: padding.top + plotHeight, class: "chart-axis" }));
    svg.appendChild(axes);

    function pathFor(key) {
      var d = "";
      for (var i = 0; i < series.length; i++) {
        var pt = series[i];
        var x = xAt(i);
        var y = yAt(pt[key]);
        d += (i === 0 ? "M" : " L") + x + " " + y;
      }
      return d;
    }

    var incomePath = el("path", { d: pathFor("incomeCents"), fill: "none", class: "chart-income", "stroke-width": "2.5" });
    svg.appendChild(incomePath);

    var expensePath = el("path", { d: pathFor("expenseCents"), fill: "none", class: "chart-expense", "stroke-width": "2.5", "stroke-dasharray": "5 4" });
    svg.appendChild(expensePath);

    var last = series[series.length - 1];
    var label = el("text", { x: padding.left + plotWidth, y: padding.top + plotHeight + 24, "text-anchor": "end", "font-size": "12" });
    label.textContent = "Last day: income " + formatter(last.incomeCents || 0) + " • expenses " + formatter(last.expenseCents || 0);
    svg.appendChild(label);

    container.appendChild(svg);
  }

  function tableHtml(headers, rows) {
    var html = "<div class=\"table-wrap\"><table class=\"table\"><thead><tr>";
    for (var i = 0; i < headers.length; i++) {
      html += "<th scope=\"col\">" + headers[i] + "</th>";
    }
    html += "</tr></thead><tbody>";
    for (var r = 0; r < rows.length; r++) {
      html += "<tr>";
      for (var c = 0; c < rows[r].length; c++) {
        html += "<td>" + rows[r][c] + "</td>";
      }
      html += "</tr>";
    }
    html += "</tbody></table></div>";
    return html;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  window.ClearLedger.charts = {
    renderBarChart: renderBarChart,
    renderLineChart: renderLineChart,
    tableHtml: tableHtml,
    escapeHtml: escapeHtml
  };
})();
