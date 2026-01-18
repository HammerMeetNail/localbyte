# Agent Guidelines for LocalByte LLC Website

This document provides coding guidelines and conventions for AI agents working on the LocalByte LLC website codebase.

## Project Overview

This is a static website for LocalByte LLC, a web design and development company. The site is built with vanilla HTML, CSS, and JavaScript, focusing on clean, semantic markup and modern CSS features.

**Tech Stack:**
- HTML5 (semantic markup)
- CSS3 (CSS custom properties, grid, flexbox)
- Vanilla JavaScript (ES5+ features)
- No build tools or frameworks

## Development Commands

### Local Development
```bash
# Start local development server on port 9000
make local
# or
python3 -m http.server 9000 --directory public
```

Then visit: http://localhost:9000

### Testing
This is a static site with no automated tests. Manual testing involves:
- Open each page in browser (public/index.html, public/services.html, public/pricing.html, public/portfolio.html, public/about.html, public/contact.html, public/privacy.html, public/terms.html)
- Test dark mode toggle functionality
- Test responsive layouts at different screen sizes (mobile: 320-720px, tablet: 720-1024px, desktop: 1024+px)
- Verify navigation links work correctly
- Test settings menu toggle and theme persistence

### Linting/Validation
No automated linting configured. Validate HTML at: https://validator.w3.org/

### Deployment
Static files can be deployed to any web server or static hosting service (GitHub Pages, Netlify, Vercel, S3, etc.)

## Code Style Guidelines

### HTML

**Structure:**
- Use semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`)
- Always include proper `<!doctype html>` declaration
- Include comprehensive meta tags (charset, viewport, title, description)
- Use lowercase for all HTML elements and attributes

**Accessibility:**
- Include `alt` attributes on all images
- Use ARIA attributes where appropriate (`aria-expanded`, `aria-pressed`, `aria-hidden`, `aria-controls`)
- Ensure proper heading hierarchy (h1 → h2 → h3)
- Use `focusable="false"` on decorative SVG icons
- Include proper button types (`type="button"` for non-submit buttons)

**Linking:**
- External stylesheet: `<link rel="stylesheet" href="assets/css/style.css" />`
- External script: `<script src="assets/js/theme.js"></script>` (at end of body)
- Navigation links use relative paths (`index.html`, `services.html`, etc.)

**Class Naming:**
- Use descriptive, hyphenated class names: `.hero-card`, `.nav-links`, `.settings-toggle`
- Utility classes are single words or simple compounds: `.small`, `.badge`, `.reveal`
- Component modifiers use double hyphens or simple adjectives: `.price-card.recommended`, `.reveal.delay-1`

### CSS

**Organization:**
- CSS custom properties (variables) defined in `:root`
- Dark mode variables in `:root[data-theme="dark"]` and `@media (prefers-color-scheme: dark)`
- Global resets and base styles first
- Component styles follow logical page order
- Media queries at the end
- Dark mode overrides after base styles

**Custom Properties (CSS Variables):**
```css
--ink          /* Primary text color */
--ink-2        /* Secondary text color */
--muted        /* Muted/tertiary text */
--brand        /* Primary brand color (teal) */
--brand-2      /* Secondary brand color */
--accent       /* Accent color (coral/orange) */
--accent-2     /* Light accent */
--bg           /* Background color */
--card         /* Card background */
--card-2       /* Alternate card background */
--border       /* Border color */
--shadow       /* Box shadow value */
```

**Spacing and Sizing:**
- Use `rem` for most sizing (relative to root font size)
- Use `px` for precise borders and small values (1px, 2px)
- Use `clamp()` for responsive typography: `font-size: clamp(2.2rem, 3vw, 3.5rem)`
- Use CSS Grid for layouts: `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`
- Gap for spacing in grid/flex: `gap: 1.5rem`

**Colors:**
- Always use CSS custom properties for colors, never hardcoded hex/rgb
- Exception: transparent utilities like `rgba(25, 114, 106, 0.3)` for subtle overlays

**Transitions:**
```css
transition: transform 0.2s ease, box-shadow 0.2s ease;
```

**Naming Conventions:**
- Component classes: `.hero`, `.card`, `.button`, `.nav`
- Modifiers: `.button.primary`, `.button.secondary`, `.price-card.recommended`
- State classes: `.active`, `[hidden]`, `[aria-pressed="true"]`
- Utility classes: `.small`, `.reveal`, `.badge`

### JavaScript

**Style:**
- Use IIFE (Immediately Invoked Function Expressions) to avoid global scope pollution
- Use `var` for variables (ES5 compatibility)
- Use camelCase for variable names: `settingsToggle`, `settingsMenu`, `syncState`
- Use double quotes for strings: `"theme"`, `"data-theme"`
- No semicolons required but included for consistency

**DOM Manipulation:**
- Use `document.querySelector()` and `document.querySelectorAll()`
- Cache DOM references in variables
- Use `getAttribute()` and `setAttribute()` for attributes
- Use `hasAttribute()` and `toggleAttribute()` for boolean attributes

**Event Handling:**
- Use `addEventListener()` for all events
- Check for element existence before adding listeners: `if (!toggle) return;`
- Use event delegation for document-level events
- Handle keyboard events (Escape key) for accessibility

**localStorage:**
```javascript
localStorage.setItem("theme", stored);
localStorage.getItem("theme");
localStorage.removeItem("theme");
```

**Feature Detection:**
```javascript
if (window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: dark)").matches
}
```

**Functions:**
- Use function expressions for utilities: `function setTheme(next) { }`
- Keep functions focused and single-purpose
- Use descriptive names: `syncState()`, `toggleTheme()`, `setTheme()`

### File Organization

```
/
├── public/             # Site root
│   ├── index.html
│   ├── about.html
│   ├── services.html
│   ├── pricing.html
│   ├── portfolio.html
│   ├── contact.html
│   ├── privacy.html
│   ├── terms.html
│   └── assets/
│       ├── css/
│       │   └── style.css   # All styles (single file)
│       ├── js/
│       │   └── theme.js    # Theme toggle functionality
│       └── img/
│           ├── localbyte_logo.png
│           └── localbyte_logo_full.png
├── Makefile            # Development commands
├── AGENTS.md           # Agent guidelines
└── LICENSE             # Apache 2.0 license
```

### Common Patterns

**Page Structure Template:**
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Page Title | LocalByte LLC</title>
  <meta name="description" content="..." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600&family=Work+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="assets/css/style.css" />
</head>
<body>
  <header><!-- Navigation --></header>
  <main class="container"><!-- Content --></main>
  <footer><!-- Footer --></footer>
  <script src="assets/js/theme.js"></script>
</body>
</html>
```

## Best Practices

1. **Maintain consistency** across all pages - use existing class names and patterns
2. **Preserve accessibility** features - don't remove ARIA attributes or semantic markup
3. **Test responsiveness** - all changes should work on mobile, tablet, and desktop
4. **Keep it simple** - no build tools or frameworks; maintain vanilla approach
5. **Use existing utilities** - reuse classes like `.container`, `.button`, `.card`, `.badge`
6. **Maintain dark mode** - ensure all new styles work in both light and dark themes
7. **Performance** - keep file sizes small, optimize images, minimize requests

## Contact

For questions about LocalByte LLC: <a href="mailto:info@localbytellc.com">info@localbytellc.com</a>
