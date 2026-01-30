(function (root, factory) {
  var exports = factory();
  if (typeof module === "object" && module && module.exports) {
    module.exports = exports;
  } else {
    root.ClearLedger = root.ClearLedger || {};
    root.ClearLedger.csv = exports;
  }
})(typeof window !== "undefined" ? window : this, function () {
  function escapeCell(value) {
    var text = value == null ? "" : String(value);
    if (/[\",\n\r]/.test(text)) {
      return "\"" + text.replace(/\"/g, "\"\"") + "\"";
    }
    return text;
  }

  function toCsv(rows) {
    var lines = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var cells = [];
      for (var j = 0; j < row.length; j++) {
        cells.push(escapeCell(row[j]));
      }
      lines.push(cells.join(","));
    }
    return lines.join("\n") + "\n";
  }

  function transactionsToCsv(transactions, categoriesById, formatter) {
    var rows = [["date", "type", "category", "amount", "note"]];
    for (var i = 0; i < transactions.length; i++) {
      var txn = transactions[i];
      if (!txn) continue;
      var category = (categoriesById && categoriesById[txn.categoryId] && categoriesById[txn.categoryId].label) || txn.categoryId || "";
      rows.push([
        txn.date || "",
        txn.type || "",
        category,
        formatter ? formatter(txn.amountCents || 0) : String((txn.amountCents || 0) / 100),
        txn.note || ""
      ]);
    }
    return toCsv(rows);
  }

  return { toCsv: toCsv, transactionsToCsv: transactionsToCsv };
});

