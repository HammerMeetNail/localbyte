var test = require("node:test");
var assert = require("node:assert/strict");

var core = require("../../public/demos/bytebites/assets/js/core.js");

test("normalizeText lowercases and collapses whitespace/punctuation", function () {
  assert.equal(core.normalizeText("  Garlic—Lemon  Chicken! "), "garlic lemon chicken");
  assert.equal(core.normalizeText("Oatmeal’s Best"), "oatmeal s best");
});

test("tokenizeQuery splits into tokens", function () {
  assert.deepEqual(core.tokenizeQuery("  vegan curry  "), ["vegan", "curry"]);
});

test("recipeMatchesQuery uses OR token matching", function () {
  var recipe = {
    title: "Coconut Chickpea Curry",
    description: "Pantry friendly.",
    cuisine: "Indian-inspired",
    tags: ["comfort"],
    dietTags: ["vegan"],
    ingredients: [{ name: "chickpeas" }, { name: "coconut milk" }]
  };

  assert.equal(core.recipeMatchesQuery(recipe, ""), true);
  assert.equal(core.recipeMatchesQuery(recipe, "tofu curry"), true);
  assert.equal(core.recipeMatchesQuery(recipe, "tofu"), false);
});

test("recipeMatchesFilters combines query + facets", function () {
  var recipe = {
    id: "x",
    title: "Test Recipe",
    description: "",
    cuisine: "American",
    dietTags: ["gluten-free", "dairy-free"],
    difficulty: "easy",
    prepMinutes: 10,
    cookMinutes: 20,
    tags: ["weeknight"],
    ingredients: [{ name: "garlic" }]
  };

  var favorites = { x: true };

  assert.equal(core.recipeMatchesFilters(recipe, { query: "garlic" }, favorites), true);
  assert.equal(core.recipeMatchesFilters(recipe, { query: "tofu" }, favorites), false);
  assert.equal(core.recipeMatchesFilters(recipe, { query: "", cuisine: "American" }, favorites), true);
  assert.equal(core.recipeMatchesFilters(recipe, { query: "", cuisine: "Italian" }, favorites), false);
  assert.equal(core.recipeMatchesFilters(recipe, { query: "", dietTags: ["gluten-free"] }, favorites), true);
  assert.equal(core.recipeMatchesFilters(recipe, { query: "", dietTags: ["vegan"] }, favorites), false);
  assert.equal(core.recipeMatchesFilters(recipe, { query: "", maxMinutes: "25" }, favorites), false);
  assert.equal(core.recipeMatchesFilters(recipe, { query: "", favoritesOnly: true }, favorites), true);
  assert.equal(core.recipeMatchesFilters(recipe, { query: "", favoritesOnly: true }, {}), false);
});

test("formatAmount prefers cookbook fractions when close", function () {
  assert.equal(core.formatAmount(0.5), "1/2");
  assert.equal(core.formatAmount(1.5), "1 1/2");
  assert.equal(core.formatAmount(0.33), "1/3");
  assert.equal(core.formatAmount(2.666), "2 2/3");
});

test("buildRecipeJsonLd produces schema.org Recipe basics", function () {
  var recipe = {
    id: "test",
    title: "Test Curry",
    description: "Tasty.",
    cuisine: "Indian-inspired",
    dietTags: ["vegan"],
    difficulty: "easy",
    prepMinutes: 5,
    cookMinutes: 10,
    servings: 2,
    tags: ["comfort"],
    image: { src: "assets/img/recipes/curry.svg", alt: "" },
    ingredients: [{ amount: 1, unit: "cup", name: "chickpeas", note: "drained" }],
    steps: ["Do the thing."]
  };

  var jsonLd = core.buildRecipeJsonLd(recipe, "https://example.com");
  assert.equal(jsonLd["@type"], "Recipe");
  assert.equal(jsonLd.name, "Test Curry");
  assert.equal(jsonLd.totalTime, "PT15M");
  assert.ok(Array.isArray(jsonLd.recipeIngredient));
  assert.ok(Array.isArray(jsonLd.recipeInstructions));
});
