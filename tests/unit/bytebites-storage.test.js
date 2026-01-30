var test = require("node:test");
var assert = require("node:assert/strict");

var storageModule = require("../../public/demos/bytebites/assets/js/storage.js");

function makeMemoryStorage() {
  var data = {};
  return {
    getItem: function (key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem: function (key, value) {
      data[key] = String(value);
    },
    removeItem: function (key) {
      delete data[key];
    }
  };
}

test("createStorageApi detects availability and stores favorites", function () {
  var mem = makeMemoryStorage();
  var api = storageModule._createStorageApi(mem);
  assert.equal(api.available, true);

  assert.deepEqual(api.loadFavorites(), []);
  var t1 = api.toggleFavorite("a");
  assert.equal(t1.ok, true);
  assert.equal(t1.isFavorite, true);
  assert.deepEqual(api.loadFavorites(), ["a"]);

  var t2 = api.toggleFavorite("a");
  assert.equal(t2.isFavorite, false);
  assert.deepEqual(api.loadFavorites(), []);
});

test("createStorageApi falls back safely when storage throws", function () {
  var broken = {
    getItem: function () { throw new Error("nope"); },
    setItem: function () { throw new Error("nope"); },
    removeItem: function () { throw new Error("nope"); }
  };
  var api = storageModule._createStorageApi(broken);
  assert.equal(api.available, false);
  assert.deepEqual(api.loadFavorites(), []);
  assert.equal(api.saveFilters({ version: 1, query: "x" }), false);
});

