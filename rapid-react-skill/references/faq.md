# FAQ / Troubleshooting

## "I scaffolded the project but `npm run dev` shows a blank page"

Open the browser console (F12). If you see a module import error, you likely have a typo in an import path. The template is case-sensitive on filenames — `App.jsx` ≠ `app.jsx`.

If the console is clean but the page is blank, check that `index.html` has `<div id="root"></div>` and `src/main.jsx` mounts to `#root`.

## "`npm run deploy:domo` says `domo: command not found`"

The Domo CLI isn't installed globally. Run:
```bash
npm install -g ryuu-cli
domo login
```

If you can't install globally, you can also do `npx ryuu-cli publish` from `dist/` after running `npm run build` — but you'll need to copy `manifest.json` into `dist/` yourself.

## "My Domo deploy succeeded but the app shows nothing in Domo"

Two common causes:
1. **Datasets not mapped.** If your code references a dataset alias that isn't in `manifest.json` `mapping`, `window.domo.get` will return nothing. Add the dataset.
2. **Build failed silently.** Run `npm run build` separately and check `dist/index.html` actually exists and references your JS bundle.

## "GH Pages deployed but assets 404"

The `base` path is wrong. `package.json` `"name"` must match your repo name exactly. If your repo is `github.com/you/my-app`, `name` must be `"my-app"`.

## "I need TypeScript"

This template is intentionally JS-only. If you need TS:
- For a small project, rename `.jsx` → `.tsx`, install `typescript` and `@types/react`, add a `tsconfig.json`. Vite handles the rest.
- For anything serious, consider scaffolding a fresh project with `npm create vite@latest -- --template react-ts` and porting your code.

## "How do I add a new npm package?"

Same as any React project:
```bash
npm install <package>
```
Import it in your component. The build and deploy scripts don't need to know about it.

## "Can I use this with Next.js?"

No. This kit is single-page React only. Next.js has its own deployment story and a different build output that doesn't fit the Domo Custom App or simple GH Pages model.

## "Can I commit `manifest.json` to git?"

Yes — and you should. It contains the stable `id` that ties your repo to your Domo app. Without committing it, every clone would generate a new ID on first deploy and you'd end up with duplicate apps in Domo.

## "How do I roll back a Domo deploy?"

`ryuu-cli` doesn't have a built-in rollback. Options:
1. Bump the version in `manifest.json`, deploy an older commit's code.
2. Use `git revert` on the bad commit, then re-deploy.

## "Where does `window.domo` come from?"

Domo's platform injects it into the iframe that hosts your Custom App when it loads inside Domo. It's only present in production (inside Domo) — not on `localhost` or GH Pages. The `src/lib/domo.js` helpers in this template handle both cases.
