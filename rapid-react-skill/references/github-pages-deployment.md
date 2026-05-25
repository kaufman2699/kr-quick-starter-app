# GitHub Pages Deployment Reference

The simpler deploy target. Static hosting, free, public-by-default.

## Prerequisites (one-time)

1. Create a GitHub repo and push your code to `main`.
2. Set `package.json` `"name"` to match your repo name exactly (kebab-case).
3. In your repo on GitHub: **Settings → Pages → Source → Deploy from a branch → `gh-pages` / `(root)`**.

## What `npm run deploy:gh` does

1. Reads `package.json` `name` → uses it to compute the base path (`/your-repo-name/`).
2. Runs `vite build` with `VITE_BASE_PATH=/your-repo-name/`.
3. Pushes `dist/` to a `gh-pages` branch using the `gh-pages` npm package.

Your app goes live at `https://<your-username>.github.io/<repo-name>/` within ~60 seconds.

## Custom domain

If you have a custom domain configured for Pages, the base path should be `/` instead of `/<repo>/`. Override by setting an env var before deploy:

```bash
VITE_BASE_PATH=/ npm run deploy:gh
```

Also add a `public/CNAME` file containing your domain (e.g. `app.example.com`). GitHub will pick it up.

## Common errors

**White page after deploy, assets 404**
- Base path mismatch. Verify `package.json` `name` equals your repo name exactly. View source of the deployed page and check that `<script>` / `<link>` tags reference `/your-repo/...` paths.

**`fatal: A branch named 'gh-pages' already exists`**
- Harmless; the `gh-pages` package handles updates. If you ever need to reset, delete the branch locally and remotely: `git push origin --delete gh-pages`.

**Push permission denied**
- Ensure you have write access to the remote and that your local git credentials are set up (SSH key or PAT).

## Limitations vs Domo

- No server-side data access. All API calls happen client-side from the user's browser.
- Public by default (Pages can be made private with GitHub Pro+).
- No data binding to internal data sources — bring your own API or CDN-hosted JSON.

If you need Domo dataset access, deploy to Domo (`npm run deploy:domo`) instead.
