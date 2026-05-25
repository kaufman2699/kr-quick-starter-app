# How to publish this to GitHub

You're holding the full skill repo in a folder. Here's how to push it.

The commands below show **macOS/Linux** and **Windows (PowerShell)** side-by-side. Use whichever matches your machine.

> **Windows users**: run these in **PowerShell** (not the old `cmd.exe`). Open it via Start menu → "Windows PowerShell" or "PowerShell 7". All the Node-based commands (`npm`, `npx`, `git`, `gh`) work identically across platforms — only the shell-specific commands (find/replace, zipping) differ.

---

## 1. Replace placeholder usernames

Find-and-replace `your-username` with your real GitHub handle in:

- `README.md`
- `SKILL.md`
- `template/README.md`

### macOS

```bash
cd rapid-react-skill
grep -rl 'your-username' . | xargs sed -i '' 's/your-username/YOUR_HANDLE/g'
```

### Linux

```bash
cd rapid-react-skill
grep -rl 'your-username' . | xargs sed -i 's/your-username/YOUR_HANDLE/g'
```

### Windows (PowerShell)

```powershell
cd rapid-react-skill
Get-ChildItem -Recurse -File -Include *.md |
  ForEach-Object {
    (Get-Content $_.FullName) -replace 'your-username','YOUR_HANDLE' |
      Set-Content $_.FullName
  }
```

Or just open the three files in VS Code and use Find & Replace (Ctrl/Cmd+Shift+H) — that's the same on every platform.

---

## 2. Prerequisites (one-time)

You'll need:

- **Git** — [git-scm.com/downloads](https://git-scm.com/downloads)
- **Node.js 18+** — [nodejs.org](https://nodejs.org/) (the LTS installer adds `npm` and `npx` to PATH automatically on all platforms)
- **GitHub CLI** (optional but easier) — [cli.github.com](https://cli.github.com/)

### Windows-specific tips

- After installing Node, **close and reopen PowerShell** so `npm` is on PATH.
- If `npm install -g <pkg>` ever fails with permission errors, run PowerShell as Administrator, or configure a user-level prefix once: `npm config set prefix "$env:APPDATA\npm"`.
- Git Bash is also an option if you'd rather use the Unix-style commands above. It ships with the Git installer.

---

## 3. Create the repo and push

Same on every platform:

```bash
git init
git add .
git commit -m "Initial commit: rapid-react-skill v0.1.0"
```

Then either with the GitHub CLI:

```bash
gh repo create rapid-react-skill --public --source . --push
```

Or manually — create the empty repo on github.com first, then:

```bash
git remote add origin https://github.com/YOUR_HANDLE/rapid-react-skill.git
git branch -M main
git push -u origin main
```

> SSH (`git@github.com:...`) works too if you've got keys set up. HTTPS is the default for most Windows users.

---

## 4. Tag a release

```bash
git tag v0.1.0
git push origin v0.1.0
```

On the GitHub repo page → Releases → Draft a new release → pick the tag → publish.

---

## 5. (Optional) Package the `.skill` file for Claude.ai users

A `.skill` file is just a zip of the skill folder, renamed.

### macOS / Linux

```bash
cd ..
zip -r rapid-react-skill.skill rapid-react-skill \
  -x "rapid-react-skill/.git/*" "rapid-react-skill/node_modules/*"
```

### Windows (PowerShell)

```powershell
cd ..
Compress-Archive -Path rapid-react-skill -DestinationPath rapid-react-skill.zip
Rename-Item rapid-react-skill.zip rapid-react-skill.skill
```

If you have `.git` or `node_modules` in the folder, delete them first:

```powershell
Remove-Item -Recurse -Force rapid-react-skill\.git, rapid-react-skill\node_modules -ErrorAction SilentlyContinue
```

Attach `rapid-react-skill.skill` to your GitHub release.

---

## 6. Test the end-to-end flow

In a new directory, run the exact command from your README. Same on every platform:

```bash
npx degit YOUR_HANDLE/rapid-react-skill/template test-app
cd test-app
npm install
npm run dev
```

If `http://localhost:5173` renders, you're shipped. 🚀

### Then test a deploy

```bash
npm install -g ryuu-cli
domo login              # follow the prompts
npm run deploy:domo
```

On Windows, if `domo` isn't recognized after install, close and reopen PowerShell (npm-global bins need a fresh PATH).

---

## 7. (Optional) Add a CI workflow

Drop this in `.github/workflows/ci.yml` to lint and build on every push:

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - working-directory: template
        run: |
          npm install
          npm run lint
          npm run build
```

This runs on GitHub's Linux runners regardless of what you developed on, so it just works.

---

## Troubleshooting (Windows-specific)

**`npm` or `node` not recognized**
Close and reopen PowerShell. If still broken, reinstall Node from nodejs.org and tick "Add to PATH" during install.

**`gh` not recognized**
Install via `winget install GitHub.cli` then reopen PowerShell.

**`domo publish` works but `npm run deploy:domo` fails**
The script's `shell: true` flag should handle this; if it doesn't, run `where domo` in PowerShell. If you see something like `C:\Users\you\AppData\Roaming\npm\domo.cmd`, that path needs to be on your PATH. It usually is by default; reopen PowerShell to refresh.

**PowerShell execution policy blocks `npm` scripts**
Run once: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`. This is safe — it allows locally-authored scripts.

**Long-path errors during `npm install`**
Enable long paths once: `git config --system core.longpaths true` and on Windows, enable LongPathsEnabled in the registry (or via Group Policy). This affects deeply nested `node_modules`.
