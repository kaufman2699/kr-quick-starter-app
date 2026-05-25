# Domo Deployment Reference

This document covers the Domo Custom App deployment path in depth. The `npm run deploy:domo` command handles the basics automatically; read this when you need to go beyond defaults.

## Prerequisites (one-time)

1. **Install the Domo CLI**:
   ```bash
   npm install -g ryuu-cli
   ```
2. **Authenticate**:
   ```bash
   domo login
   ```
   You'll be prompted for your Domo instance (e.g. `mycompany.domo.com`) and credentials.

3. **Verify**:
   ```bash
   domo --version
   ```

## What `npm run deploy:domo` does

In order:
1. Confirms `domo` CLI is on PATH.
2. Generates `manifest.json` at project root if missing.
3. Runs `vite build` → produces `dist/`.
4. Copies `manifest.json` into `dist/`.
5. Runs `domo publish` from `dist/`.

## manifest.json fields

The auto-generated manifest looks like:

```json
{
  "id": "8c2f5e10-...",
  "name": "my-app",
  "version": "1.0.0",
  "sizing": { "width": 1200, "height": 800 },
  "mapping": []
}
```

| Field | Purpose |
|---|---|
| `id` | Stable UUID. Ties this code to one app in Domo. **Never change this.** Changing it creates a duplicate app on next deploy. |
| `name` | Display name in Domo's Custom Apps list. |
| `version` | Semver. Bump on each meaningful deploy if you want version history. |
| `sizing.width` / `sizing.height` | Default canvas size when embedded in a Domo card. Users can resize, but this is the starting point. |
| `mapping` | Array of dataset mappings. See next section. |

## Wiring up Domo datasets

To read from a Domo dataset, add it to `mapping`:

```json
{
  "mapping": [
    { "alias": "sales", "dataSetId": "abc123-def456-..." }
  ]
}
```

Find the dataset UUID in Domo: open the dataset, copy the ID from the URL.

Then in your code:

```js
import { getDatasetRows } from './lib/domo.js';

const rows = await getDatasetRows('sales', ['region', 'revenue', 'date']);
```

The Domo platform injects `window.domo` at runtime, scoped to the datasets you mapped. The `domo.js` helpers wrap this so your code looks the same in dev and production.

## Custom sizing

Edit `manifest.json`:

```json
{ "sizing": { "width": 1600, "height": 900 } }
```

For full-page apps, use larger numbers. For card-style widgets, 400×300 is common.

## OAuth scopes (for external API calls from Domo)

If your app needs to call Domo APIs beyond datasets (e.g. listing users, writing back to a dataset), add scopes:

```json
{
  "scopes": ["data", "user"]
}
```

See [Domo's developer docs](https://developer.domo.com/portal/) for the full scope list.

## Common errors

**`domo: command not found`**
- Run `npm install -g ryuu-cli`. If using nvm, ensure your global is in the right Node version.

**`401 Unauthorized` during publish**
- Re-run `domo login`. Tokens expire.

**`409 Conflict` during publish**
- An app with the same `id` already exists owned by another user. Either get ownership transferred or change the `id` in manifest.json (this creates a new app).

**App loads but shows white screen in Domo**
- Most often a base-path issue. Domo serves Custom Apps from a non-root path. The default Vite config in this template handles this correctly; if you've modified `vite.config.js`, revert to `base: '/'` (or use `VITE_BASE_PATH` env var only for GH Pages).

**`window.domo` is undefined in production**
- This means the app loaded outside the Domo iframe (e.g. you opened the published URL directly). Always access the app via the Domo dashboard/card it was added to.

## Updating an existing app

Just re-run `npm run deploy:domo`. As long as `manifest.json`'s `id` is unchanged, the same Domo app is updated in place. Bump `version` if you want it tracked.
