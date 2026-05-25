#!/usr/bin/env node
/**
 * One-command GitHub Pages deploy.
 *
 *   npm run deploy:gh
 *
 * What it does:
 *   1. Reads the repo name (assumed = package.json "name") for the base path.
 *   2. Builds with Vite, injecting VITE_BASE_PATH=/<repo-name>/.
 *   3. Pushes dist/ to the gh-pages branch via the gh-pages package.
 *
 * One-time setup (user must do):
 *   - Repo must exist on GitHub and the local clone has a remote.
 *   - In GitHub repo settings → Pages → Source: deploy from gh-pages branch.
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const log = (msg) => console.log(`\x1b[36m[deploy:gh]\x1b[0m ${msg}`);
const die = (msg) => {
  console.error(`\x1b[31m[deploy:gh]\x1b[0m ${msg}`);
  process.exit(1);
};

const pkg = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
const repoName = pkg.name;
if (!repoName || repoName === 'rapid-react-app') {
  die(
    'package.json "name" is missing or still the default "rapid-react-app".\n' +
      '  Set it to your GitHub repo name (kebab-case) so the base path is correct,\n' +
      '  e.g. "my-dashboard" if your repo is github.com/you/my-dashboard.'
  );
}

const basePath = `/${repoName}/`;
log(`Building with base path: ${basePath}`);

try {
  execSync('npx vite build', {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, VITE_BASE_PATH: basePath },
  });
} catch {
  die('Vite build failed. Fix errors above and re-run.');
}

log('Publishing dist/ to gh-pages branch...');
try {
  execSync('npx gh-pages -d dist -m "Deploy via deploy:gh"', {
    cwd: projectRoot,
    stdio: 'inherit',
  });
} catch {
  die(
    'gh-pages push failed.\n' +
      '  Common causes:\n' +
      '    - No git remote configured. Run: git remote add origin <repo-url>.\n' +
      '    - No commits yet. Run: git add -A && git commit -m "init".\n' +
      '    - Auth: ensure you can push to the remote (SSH key or PAT set up).'
  );
}

log('✅ Deployed to GitHub Pages.');
log(`Your app will be live at: https://<your-username>.github.io${basePath}`);
log('(may take 30-60s for GitHub to refresh)');
