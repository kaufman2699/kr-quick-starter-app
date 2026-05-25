#!/usr/bin/env node
/**
 * One-command Domo deploy.
 *
 *   npm run deploy:domo
 *
 * What it does:
 *   1. Verifies the Domo CLI (ryuu) is installed.
 *   2. Verifies manifest.json exists and has a real Domo-assigned design ID.
 *   3. Verifies thumbnail.png exists (Domo requires it).
 *   4. Runs `vite build` to produce dist/.
 *   5. Copies manifest.json and thumbnail.png into dist/.
 *   6. Invokes `domo publish` to ship to your Domo instance.
 *
 * One-time prerequisites the user must do themselves:
 *   - npm install -g ryuu
 *   - domo login
 *   - domo init    (in a throwaway folder, to register a new design on Domo's
 *                   server and get a REAL design ID — then paste that ID into
 *                   this project's manifest.json)
 *
 * Why we don't auto-generate the design ID:
 *   Design IDs are assigned by Domo's server when you run `domo init`. A
 *   client-side random UUID will fail with "you do not have access to the
 *   design" because Domo can't find it.
 */

import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const manifestPath = join(projectRoot, 'manifest.json');
const thumbnailPath = join(projectRoot, 'thumbnail.png');
const distDir = join(projectRoot, 'dist');

const log = (msg) => console.log(`\x1b[36m[deploy:domo]\x1b[0m ${msg}`);
const die = (msg) => {
  console.error(`\x1b[31m[deploy:domo]\x1b[0m ${msg}`);
  process.exit(1);
};

// shell:true so domo.cmd (Windows) and domo (mac/linux) both resolve via PATH.
const SPAWN_OPTS = { shell: true };

// --- 1. Check ryuu is installed ---------------------------------------------
function checkRyuu() {
  const probe = spawnSync('domo', ['--version'], { ...SPAWN_OPTS, encoding: 'utf8' });
  if (probe.error || probe.status !== 0) {
    die(
      'The Domo CLI (ryuu) is not installed or not on PATH.\n' +
        '  Fix:\n' +
        '    1. npm install -g ryuu\n' +
        '    2. domo login\n' +
        '  Then re-run: npm run deploy:domo'
    );
  }
  log('Domo CLI detected.');
}

// --- 2. Verify manifest.json exists and has a real design ID ----------------
function checkManifest() {
  if (!existsSync(manifestPath)) {
    die(
      'manifest.json is missing.\n' +
        '\n' +
        '  Domo requires a real, server-assigned design ID — you cannot generate\n' +
        '  one yourself. One-time setup:\n' +
        '\n' +
        '    1. cd /tmp && mkdir domo-init && cd domo-init\n' +
        '    2. domo init        (answer the prompts; you only need the ID)\n' +
        '    3. cat manifest.json  → copy the "id" value\n' +
        '    4. Back in your project, create manifest.json with that id:\n' +
        '       {\n' +
        '         "id": "PASTE-ID-HERE",\n' +
        '         "name": "My App",\n' +
        '         "version": "1.0.0",\n' +
        '         "sizing": { "width": 1200, "height": 800 },\n' +
        '         "mapping": []\n' +
        '       }\n' +
        '\n' +
        '  Then re-run: npm run deploy:domo'
    );
  }
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    die(`manifest.json is not valid JSON: ${e.message}`);
  }
  if (!manifest.id || !/^[0-9a-f-]{32,}$/i.test(manifest.id)) {
    die(
      'manifest.json has no valid "id". You need a real design ID from Domo.\n' +
        '  Run `domo init` in a throwaway folder, copy the generated id, and paste\n' +
        '  it into this project\'s manifest.json. See instructions above.'
    );
  }
  log(`Manifest OK (id: ${manifest.id}).`);
}

// --- 3. Verify thumbnail.png exists -----------------------------------------
function checkThumbnail() {
  if (!existsSync(thumbnailPath)) {
    die(
      'thumbnail.png is missing from the project root.\n' +
        '  Domo requires a 300x300 PNG named thumbnail.png. The template ships one;\n' +
        '  if you deleted it, generate or download any 300x300 image and save it\n' +
        '  as thumbnail.png at the project root.\n' +
        '\n' +
        '  Quick placeholder:\n' +
        '    curl -o thumbnail.png "https://placehold.co/300x300/0f172a/ffffff.png?text=App"'
    );
  }
  log('thumbnail.png found.');
}

// --- 4. Build ---------------------------------------------------------------
function build() {
  log('Building with Vite...');
  try {
    execSync('npx vite build', { cwd: projectRoot, stdio: 'inherit' });
  } catch {
    die('Vite build failed. Fix the errors above and re-run.');
  }
}

// --- 5. Stage manifest + thumbnail in dist/ ---------------------------------
function stageAssets() {
  if (!existsSync(distDir)) die('dist/ was not produced. Build likely failed silently.');
  copyFileSync(manifestPath, join(distDir, 'manifest.json'));
  copyFileSync(thumbnailPath, join(distDir, 'thumbnail.png'));
  log('Staged manifest.json and thumbnail.png in dist/.');
}

// --- 6. Publish to Domo -----------------------------------------------------
function publish() {
  log('Publishing to Domo...');
  const result = spawnSync('domo', ['publish'], {
    ...SPAWN_OPTS,
    cwd: distDir,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    die(
      'domo publish failed (see output above).\n' +
        '  Common causes:\n' +
        '    - Auth expired: run `domo login` again.\n' +
        '    - Wrong instance: `domo login -i <your-instance>.domo.com`.\n' +
        '    - Design ID belongs to a different instance/account than you logged in to.\n' +
        '    - Network/proxy issue: check VPN.'
    );
  }
  log('✅ Deployed to Domo.');
  log('Find your app under Apps → Custom Apps in your Domo instance.');
}

// --- Run --------------------------------------------------------------------
checkRyuu();
checkManifest();
checkThumbnail();
build();
stageAssets();
publish();
