# Easy Email

A tiny static app that generates:

- a `mailto:` link with pre-filled `to`, `subject`, and `body`
- a QR code for that same link

No backend, no database, no user accounts, and no persistence.

## Run locally

Because this is a static site, you can open `index.html` directly in a browser.

If you prefer a local server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy on Netlify

1. Push this repo to GitHub.
2. In Netlify, click **Add new site** -> **Import an existing project**.
3. Select this GitHub repo.
4. Use these settings:
   - Build command: *(leave empty)*
   - Publish directory: `.`
5. Deploy.

Netlify will auto-deploy on future pushes to your default branch.

## Notes

- `mailto:` links cannot set the sender (`From`) account.
- Email clients may fail with very long link URLs; keep body text reasonably short.
