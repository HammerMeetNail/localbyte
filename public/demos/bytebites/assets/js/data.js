(function () {
  "use strict";

  var recipes = [
    {
      id: "garlic-lemon-chicken",
      title: "Garlic Lemon Chicken",
      description: "Weeknight skillet chicken with bright lemon and a buttery garlic pan sauce.",
      image: { src: "assets/img/recipes/skillet.svg", alt: "Illustration of a skillet on a counter" },
      cuisine: "American",
      dietTags: ["gluten-free"],
      difficulty: "easy",
      prepMinutes: 10,
      cookMinutes: 18,
      servings: 4,
      tags: ["weeknight", "one-pan", "high-protein"],
      ingredients: [
        { amount: 1.5, unit: "lb", name: "boneless chicken thighs", note: "patted dry" },
        { amount: 1, unit: "tsp", name: "kosher salt" },
        { amount: 0.5, unit: "tsp", name: "black pepper" },
        { amount: 2, unit: "tbsp", name: "olive oil" },
        { amount: 4, unit: "clove", name: "garlic", note: "minced" },
        { amount: 0.5, unit: "cup", name: "chicken broth" },
        { amount: 2, unit: "tbsp", name: "lemon juice" },
        { amount: 2, unit: "tbsp", name: "butter" },
        { amount: null, unit: "", name: "chopped parsley", note: "to taste", scalable: false }
      ],
      steps: [
        "Season chicken with salt and pepper.",
        "Sear chicken in olive oil until browned, then flip and cook through.",
        "Add garlic and cook until fragrant.",
        "Pour in broth and lemon juice, simmer to reduce slightly.",
        "Stir in butter to finish the sauce; spoon over chicken and garnish."
      ]
    },
    {
      id: "sheet-pan-veggie-tacos",
      title: "Sheet Pan Veggie Tacos",
      description: "Roasted peppers, onions, and mushrooms with smoky spices—fast, colorful, and flexible.",
      image: { src: "assets/img/recipes/sheet-pan.svg", alt: "Illustration of a sheet pan with vegetables" },
      cuisine: "Mexican-inspired",
      dietTags: ["vegetarian", "gluten-free"],
      difficulty: "easy",
      prepMinutes: 12,
      cookMinutes: 18,
      servings: 4,
      tags: ["weeknight", "meal-prep", "family"],
      ingredients: [
        { amount: 1, unit: "", name: "red bell pepper", note: "sliced" },
        { amount: 1, unit: "", name: "yellow onion", note: "sliced" },
        { amount: 8, unit: "oz", name: "mushrooms", note: "sliced" },
        { amount: 2, unit: "tbsp", name: "olive oil" },
        { amount: 1, unit: "tsp", name: "chili powder" },
        { amount: 1, unit: "tsp", name: "ground cumin" },
        { amount: 0.5, unit: "tsp", name: "kosher salt" },
        { amount: 8, unit: "", name: "corn tortillas" },
        { amount: null, unit: "", name: "lime wedges", note: "to serve", scalable: false }
      ],
      steps: [
        "Heat oven to 425°F. Toss sliced veggies with oil and spices on a sheet pan.",
        "Roast until tender and lightly charred, stirring halfway through.",
        "Warm tortillas, fill with roasted veggies, and finish with lime."
      ]
    },
    {
      id: "creamy-tomato-pasta",
      title: "Creamy Tomato Pasta",
      description: "A silky tomato sauce with a hint of garlic and parmesan—comfort in 25 minutes.",
      image: { src: "assets/img/recipes/pasta.svg", alt: "Illustration of a pasta bowl with sauce" },
      cuisine: "Italian-inspired",
      dietTags: ["vegetarian"],
      difficulty: "easy",
      prepMinutes: 5,
      cookMinutes: 20,
      servings: 4,
      tags: ["comfort", "weeknight"],
      ingredients: [
        { amount: 12, unit: "oz", name: "pasta", note: "penne or rigatoni" },
        { amount: 1, unit: "tbsp", name: "olive oil" },
        { amount: 3, unit: "clove", name: "garlic", note: "minced" },
        { amount: 1.5, unit: "cup", name: "crushed tomatoes" },
        { amount: 0.5, unit: "cup", name: "heavy cream" },
        { amount: 0.25, unit: "cup", name: "parmesan", note: "grated" },
        { amount: null, unit: "", name: "fresh basil", note: "to taste", scalable: false }
      ],
      steps: [
        "Cook pasta in salted water until al dente; reserve 1/2 cup pasta water.",
        "Sauté garlic in olive oil until fragrant; add crushed tomatoes and simmer.",
        "Stir in cream and parmesan; loosen with pasta water as needed.",
        "Toss pasta with sauce and top with basil."
      ]
    },
    {
      id: "ginger-soy-salmon-bowls",
      title: "Ginger Soy Salmon Bowls",
      description: "Roasted salmon with a quick ginger-soy glaze over rice and crisp cucumbers.",
      image: { src: "assets/img/recipes/bowl.svg", alt: "Illustration of a rice bowl with toppings" },
      cuisine: "Asian-inspired",
      dietTags: ["gluten-free", "dairy-free"],
      difficulty: "medium",
      prepMinutes: 12,
      cookMinutes: 15,
      servings: 2,
      tags: ["high-protein", "meal-prep"],
      ingredients: [
        { amount: 2, unit: "", name: "salmon fillets" },
        { amount: 2, unit: "tbsp", name: "tamari", note: "gluten-free soy sauce" },
        { amount: 1, unit: "tbsp", name: "honey" },
        { amount: 1, unit: "tsp", name: "fresh ginger", note: "grated" },
        { amount: 2, unit: "tsp", name: "sesame oil" },
        { amount: 1.5, unit: "cup", name: "cooked rice" },
        { amount: 0.5, unit: "", name: "cucumber", note: "sliced" },
        { amount: null, unit: "", name: "sesame seeds", note: "to finish", scalable: false }
      ],
      steps: [
        "Heat oven to 425°F. Whisk tamari, honey, ginger, and sesame oil.",
        "Brush salmon with glaze and roast until flaky.",
        "Assemble bowls with rice, salmon, cucumber, and sesame seeds."
      ]
    },
    {
      id: "lentil-soup",
      title: "Cozy Lentil Soup",
      description: "A hearty, veggie-packed lentil soup that tastes even better the next day.",
      image: { src: "assets/img/recipes/soup.svg", alt: "Illustration of a steaming soup bowl" },
      cuisine: "Mediterranean-inspired",
      dietTags: ["vegan", "gluten-free", "dairy-free"],
      difficulty: "easy",
      prepMinutes: 15,
      cookMinutes: 35,
      servings: 6,
      tags: ["meal-prep", "comfort"],
      ingredients: [
        { amount: 1, unit: "tbsp", name: "olive oil" },
        { amount: 1, unit: "", name: "yellow onion", note: "diced" },
        { amount: 2, unit: "", name: "carrots", note: "diced" },
        { amount: 2, unit: "clove", name: "garlic", note: "minced" },
        { amount: 1.25, unit: "cup", name: "brown lentils", note: "rinsed" },
        { amount: 6, unit: "cup", name: "vegetable broth" },
        { amount: 1, unit: "tsp", name: "ground cumin" },
        { amount: null, unit: "", name: "lemon juice", note: "to finish", scalable: false }
      ],
      steps: [
        "Sauté onion and carrots in olive oil until softened; add garlic.",
        "Stir in lentils, broth, and cumin; simmer until lentils are tender.",
        "Season to taste and finish with a squeeze of lemon."
      ]
    },
    {
      id: "breakfast-oatmeal",
      title: "Blueberry Almond Oatmeal",
      description: "Creamy stovetop oats with blueberries, almond butter, and a pinch of cinnamon.",
      image: { src: "assets/img/recipes/oatmeal.svg", alt: "Illustration of oatmeal with berries" },
      cuisine: "American",
      dietTags: ["vegetarian", "gluten-free"],
      difficulty: "easy",
      prepMinutes: 5,
      cookMinutes: 8,
      servings: 2,
      tags: ["breakfast", "quick"],
      ingredients: [
        { amount: 1, unit: "cup", name: "rolled oats", note: "certified gluten-free" },
        { amount: 2, unit: "cup", name: "milk", note: "or non-dairy milk" },
        { amount: 0.5, unit: "cup", name: "blueberries" },
        { amount: 2, unit: "tbsp", name: "almond butter" },
        { amount: 0.5, unit: "tsp", name: "cinnamon" },
        { amount: null, unit: "", name: "maple syrup", note: "to taste", scalable: false }
      ],
      steps: [
        "Simmer oats with milk until creamy, stirring occasionally.",
        "Fold in blueberries, cinnamon, and almond butter.",
        "Sweeten to taste and serve warm."
      ]
    },
    {
      id: "chopped-salad",
      title: "Crunchy Chopped Salad",
      description: "A bright, crunchy salad with a tangy vinaigrette—perfect with anything.",
      image: { src: "assets/img/recipes/salad.svg", alt: "Illustration of a salad plate" },
      cuisine: "American",
      dietTags: ["vegan", "gluten-free", "dairy-free"],
      difficulty: "easy",
      prepMinutes: 15,
      cookMinutes: 0,
      servings: 4,
      tags: ["quick", "side"],
      ingredients: [
        { amount: 3, unit: "cup", name: "romaine", note: "chopped" },
        { amount: 1, unit: "", name: "cucumber", note: "diced" },
        { amount: 1, unit: "", name: "bell pepper", note: "diced" },
        { amount: 0.5, unit: "cup", name: "chickpeas", note: "rinsed" },
        { amount: 3, unit: "tbsp", name: "olive oil", note: "for dressing" },
        { amount: 1, unit: "tbsp", name: "lemon juice", note: "for dressing" },
        { amount: 1, unit: "tsp", name: "dijon mustard", note: "for dressing" }
      ],
      steps: [
        "Whisk olive oil, lemon juice, and dijon to make a vinaigrette.",
        "Toss chopped veggies and chickpeas with dressing.",
        "Season to taste and serve immediately."
      ]
    },
    {
      id: "spicy-tofu-stir-fry",
      title: "Spicy Tofu Stir-Fry",
      description: "Crisp tofu and broccoli in a spicy-sweet sauce. Big flavor, minimal effort.",
      image: { src: "assets/img/recipes/stir-fry.svg", alt: "Illustration of a wok with vegetables" },
      cuisine: "Asian-inspired",
      dietTags: ["vegan", "dairy-free"],
      difficulty: "medium",
      prepMinutes: 15,
      cookMinutes: 14,
      servings: 3,
      tags: ["weeknight", "high-protein"],
      ingredients: [
        { amount: 14, unit: "oz", name: "firm tofu", note: "pressed and cubed" },
        { amount: 3, unit: "cup", name: "broccoli florets" },
        { amount: 2, unit: "tbsp", name: "soy sauce" },
        { amount: 1, unit: "tbsp", name: "rice vinegar" },
        { amount: 1.5, unit: "tbsp", name: "brown sugar" },
        { amount: 1, unit: "tsp", name: "chili garlic sauce" },
        { amount: 2, unit: "tbsp", name: "neutral oil" }
      ],
      steps: [
        "Whisk soy sauce, vinegar, sugar, and chili garlic sauce.",
        "Pan-fry tofu in oil until golden; add broccoli and cook until crisp-tender.",
        "Pour in sauce and toss until glossy and coated."
      ]
    },
    {
      id: "shrimp-fried-rice",
      title: "Quick Shrimp Fried Rice",
      description: "A fast, takeout-style fried rice with shrimp, peas, and scrambled egg.",
      image: { src: "assets/img/recipes/rice.svg", alt: "Illustration of a bowl of rice" },
      cuisine: "Asian-inspired",
      dietTags: ["dairy-free"],
      difficulty: "medium",
      prepMinutes: 10,
      cookMinutes: 12,
      servings: 3,
      tags: ["weeknight", "quick"],
      ingredients: [
        { amount: 2, unit: "cup", name: "cooked rice", note: "cold, day-old best" },
        { amount: 10, unit: "oz", name: "shrimp", note: "peeled and deveined" },
        { amount: 1, unit: "", name: "egg" },
        { amount: 0.5, unit: "cup", name: "frozen peas" },
        { amount: 2, unit: "tbsp", name: "soy sauce" },
        { amount: 1, unit: "tbsp", name: "sesame oil" },
        { amount: 2, unit: "tbsp", name: "neutral oil" },
        { amount: null, unit: "", name: "green onions", note: "to finish", scalable: false }
      ],
      steps: [
        "Scramble egg in a hot skillet with a splash of oil; set aside.",
        "Sauté shrimp until just cooked; add peas and rice and stir-fry.",
        "Add soy sauce and sesame oil, then fold in egg and garnish."
      ]
    },
    {
      id: "chocolate-chip-cookies",
      title: "Soft Chocolate Chip Cookies",
      description: "Classic, bakery-style cookies with crisp edges and chewy centers.",
      image: { src: "assets/img/recipes/bake.svg", alt: "Illustration of cookies on a baking tray" },
      cuisine: "American",
      dietTags: ["vegetarian"],
      difficulty: "medium",
      prepMinutes: 15,
      cookMinutes: 12,
      servings: 24,
      tags: ["dessert", "baking"],
      ingredients: [
        { amount: 2.25, unit: "cup", name: "all-purpose flour" },
        { amount: 1, unit: "tsp", name: "baking soda" },
        { amount: 1, unit: "tsp", name: "kosher salt" },
        { amount: 0.75, unit: "cup", name: "butter", note: "softened" },
        { amount: 0.75, unit: "cup", name: "brown sugar" },
        { amount: 0.5, unit: "cup", name: "granulated sugar" },
        { amount: 2, unit: "", name: "eggs" },
        { amount: 2, unit: "tsp", name: "vanilla extract" },
        { amount: 2, unit: "cup", name: "chocolate chips" }
      ],
      steps: [
        "Heat oven to 350°F. Whisk dry ingredients in a bowl.",
        "Cream butter and sugars; beat in eggs and vanilla.",
        "Mix in dry ingredients, then fold in chocolate chips.",
        "Scoop onto trays and bake until edges set; cool before serving."
      ]
    },
    {
      id: "chickpea-curry",
      title: "Coconut Chickpea Curry",
      description: "A pantry-friendly curry with chickpeas and spinach in a creamy coconut sauce.",
      image: { src: "assets/img/recipes/curry.svg", alt: "Illustration of curry in a bowl" },
      cuisine: "Indian-inspired",
      dietTags: ["vegan", "gluten-free", "dairy-free"],
      difficulty: "easy",
      prepMinutes: 10,
      cookMinutes: 25,
      servings: 4,
      tags: ["meal-prep", "comfort"],
      ingredients: [
        { amount: 1, unit: "tbsp", name: "olive oil" },
        { amount: 1, unit: "", name: "yellow onion", note: "diced" },
        { amount: 2, unit: "clove", name: "garlic", note: "minced" },
        { amount: 1, unit: "tbsp", name: "curry powder" },
        { amount: 1, unit: "tsp", name: "ground cumin" },
        { amount: 2, unit: "cup", name: "chickpeas", note: "canned, drained" },
        { amount: 1.5, unit: "cup", name: "coconut milk" },
        { amount: 2, unit: "cup", name: "spinach" },
        { amount: null, unit: "", name: "lime juice", note: "to finish", scalable: false }
      ],
      steps: [
        "Sauté onion in oil until softened; add garlic and spices.",
        "Stir in chickpeas and coconut milk; simmer until thickened.",
        "Fold in spinach to wilt and finish with lime juice."
      ]
    }
  ];

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function getRecipes() {
    return clone(recipes);
  }

  function getRecipeById(id) {
    var all = recipes;
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) return clone(all[i]);
    }
    return null;
  }

  var api = { getRecipes: getRecipes, getRecipeById: getRecipeById };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.ByteBitesData = api;
})();

