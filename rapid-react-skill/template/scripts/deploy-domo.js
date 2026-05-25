#!/usr/bin/env node
/**
 * One-command Domo deploy.
 *
 *   npm run deploy:domo
 *
 * What it does:
 *   1. Verifies ryuu-cli is installed (the Domo Custom App CLI).
 *   2. Generates manifest.json if it doesn't exist (UUID, name, sizing).
 *   3. Runs `vite build` to produce dist/.
 *   4. Copies manifest.json into dist/.
 *   5. Invokes `domo publish` to ship to your Domo instance.
 *
 * One-time prerequisites the user must do themselves:
 *   - npm install -g ryuu-cli
 *   - domo login   (authenticates against your Domo instance)
 *
 * The script is intentionally chatty: it prints what it's doing so a first-time
 * user understands the steps. Errors include actionable next-step messages.
 */

import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const manifestPath = join(projectRoot, 'manifest.json');
const distDir = join(projectRoot, 'dist');
const distManifest = join(distDir, 'manifest.json');

const log = (msg) => console.log(`\x1b[36m[deploy:domo]\x1b[0m ${msg}`);
const warn = (msg) => console.warn(`\x1b[33m[deploy:domo]\x1b[0m ${msg}`);
const die = (msg) => {
  console.error(`\x1b[31m[deploy:domo]\x1b[0m ${msg}`);
  process.exit(1);
};

// On Windows, globally-installed npm CLIs are .cmd shims, so spawnSync needs
// shell:true to resolve them via PATHEXT. Setting it unconditionally works on
// all platforms.
const SPAWN_OPTS = { shell: true };

// --- 1. Check ryuu-cli is installed -----------------------------------------
function checkRyuu() {
  const probe = spawnSync('domo', ['--version'], { ...SPAWN_OPTS, encoding: 'utf8' });
  if (probe.error || probe.status !== 0) {
    die(
      'The Domo CLI (ryuu-cli) is not installed or not on PATH.\n' +
        '  Fix:\n' +
        '    1. npm install -g ryuu-cli\n' +
        '    2. domo login\n' +
        '  Then re-run: npm run deploy:domo'
    );
  }
  log(`Found Domo CLI: ${probe.stdout.trim()}`);
}

// --- 2. Generate manifest.json if missing -----------------------------------
function ensureManifest() {
  if (existsSync(manifestPath)) {
    log('manifest.json found — reusing.');
    return JSON.parse(readFileSync(manifestPath, 'utf8'));
  }

  log('No manifest.json found — generating one with defaults.');
  const pkg = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
  const manifest = {
    id: randomUUID(),
    name: pkg.name || 'Rapid React App',
    version: pkg.version || '1.0.0',
    sizing: { width: 1200, height: 800 },
    mapping: [],
    // Add datasets here later as: { "alias": "sales", "dataSetId": "<uuid>" }
  };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  log(`Wrote manifest.json (id: ${manifest.id}).`);
  warn(
    'IMPORTANT: do not change the "id" field — it ties future deploys to the\n' +
      '  same app in Domo. Changing it creates a duplicate app.'
  );
  return manifest;
}

// --- 3. Build ----------------------------------------------------------------
function build() {
  log('Building with Vite...');
  try {
    execSync('npx vite build', { cwd: projectRoot, stdio: 'inherit' });
  } catch {
    die('Vite build failed. Fix the errors above and re-run.');
  }
}

// --- 4. Copy manifest into dist ---------------------------------------------
function stageManifest() {
  if (!existsSync(distDir)) die('dist/ was not produced. Build likely failed silently.');
  copyFileSync(manifestPath, distManifest);
  log('Copied manifest.json into dist/.');
}

// --- 5. Publish to Domo -----------------------------------------------------
function publish() {
  log('Publishing to Domo...');
  // ryuu-cli's `domo publish` looks at the current directory's manifest.json
  // and uploads the bundle. We run it from dist/ so it picks up our staged
  // manifest and the built assets together.
  const result = spawnSync('domo', ['publish'], {
    ...SPAWN_OPTS,
    cwd: distDir,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    die(
      'domo publish failed.\n' +
        '  Common causes:\n' +
        '    - Not logged in: run `domo login` and try again.\n' +
        '    - Wrong instance: `domo login --server <your-instance>.domo.com`.\n' +
        '    - Network/proxy issue: check VPN and try again.'
    );
  }
  log('✅ Deployed to Domo.');
  log('Find your app under Apps → Custom Apps in your Domo instance.');
}

// --- Run ---------------------------------------------------------------------
checkRyuu();
ensureManifest();
build();
stageManifest();
publish();
