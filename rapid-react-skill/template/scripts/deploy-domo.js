#!/usr/bin/env node
/**
 * One-command Domo deploy.
 *
 *   npm run deploy:domo
 *
 * Does everything end-to-end:
 *   1. Verifies the Domo CLI (ryuu) is installed and logged in.
 *   2. If manifest.json is missing → automatically registers a new design with
 *      Domo (via `domo init` in a temp folder), extracts the assigned ID,
 *      and writes manifest.json for you. One-time, then persisted.
 *   3. Verifies thumbnail.png exists (template ships one).
 *   4. Builds with Vite.
 *   5. Stages manifest + thumbnail into dist/.
 *   6. Runs `domo publish`.
 *
 * Only thing the user has to do once, ever:
 *   - npm install -g ryuu
 *   - domo login
 * After that: `npm run deploy:domo` is the only command they ever run.
 */

import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
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

// shell:true so `domo.cmd` (Windows) and `domo` (mac/linux) both resolve via PATH.
const SPAWN_OPTS = { shell: true };

// --- 1. Check ryuu is installed ---------------------------------------------
function checkRyuu() {
  const probe = spawnSync('domo', ['--version'], { ...SPAWN_OPTS, encoding: 'utf8' });
  if (probe.error || probe.status !== 0) {
    die(
      'The Domo CLI (ryuu) is not installed or not on PATH.\n' +
        '  Fix (one-time, ever):\n' +
        '    1. npm install -g ryuu\n' +
        '    2. domo login\n' +
        '  Then re-run: npm run deploy:domo'
    );
  }
  log('Domo CLI detected.');
}

// --- 2. Bootstrap manifest.json automatically if missing --------------------
function bootstrapManifest() {
  // First, attempt domo init non-interactively in a temp folder. We only need
  // the server-assigned `id` — we'll write our own manifest.json with that id
  // and our project's name/version/sizing.
  log('No manifest.json found. Registering a new design with Domo (one-time)...');

  const pkg = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
  const appName = pkg.name || 'rapid-react-app';

  const tmpRoot = mkdtempSync(join(tmpdir(), 'domo-bootstrap-'));
  const initSubdir = 'app';

  try {
    // Try non-interactive init. Flags per ryuu docs:
    //   -n  app name
    //   -t  template ("manifest-only" is the most minimal)
    //   --no-datasets  skip the dataset prompts
    const initResult = spawnSync(
      'domo',
      ['init', initSubdir, '-n', appName, '-t', 'manifest-only', '--no-datasets'],
      { ...SPAWN_OPTS, cwd: tmpRoot, stdio: 'inherit', timeout: 60_000 }
    );

    if (initResult.status !== 0) {
      die(
        'Automatic `domo init` failed.\n' +
          '  This usually means your Domo CLI version doesn\'t support non-\n' +
          '  interactive flags, or your login session expired. Try:\n' +
          '    1. domo login           (re-authenticate)\n' +
          '    2. npm install -g ryuu@latest   (upgrade)\n' +
          '    3. npm run deploy:domo   (re-run)\n' +
          '\n' +
          '  If automatic init keeps failing, you can do it manually one time:\n' +
          '    cd /tmp && mkdir d && cd d && domo init\n' +
          '    cat manifest.json   (copy the "id")\n' +
          '  Then create manifest.json in this project with that id and re-run.'
      );
    }

    const initManifestPath = join(tmpRoot, initSubdir, 'manifest.json');
    if (!existsSync(initManifestPath)) {
      die(
        '`domo init` did not produce a manifest.json. Cannot continue automatically.\n' +
          '  Try the manual fallback (see above).'
      );
    }

    const initManifest = JSON.parse(readFileSync(initManifestPath, 'utf8'));
    if (!initManifest.id) {
      die('`domo init` produced a manifest without an id field.');
    }

    // Write OUR manifest with the Domo-assigned id. Keep our own name/sizing.
    const ourManifest = {
      id: initManifest.id,
      name: appName,
      version: pkg.version || '1.0.0',
      sizing: { width: 1200, height: 800 },
      mapping: [],
    };
    writeFileSync(manifestPath, JSON.stringify(ourManifest, null, 2) + '\n');
    log(`✓ Registered new design (id: ${initManifest.id}).`);
    log('  manifest.json written. Commit it — future deploys reuse this id.');
  } finally {
    // Always clean up the temp folder.
    try {
      rmSync(tmpRoot, { recursive: true, force: true });
    } catch {
      /* best-effort cleanup */
    }
  }
}

function ensureManifest() {
  if (!existsSync(manifestPath)) {
    bootstrapManifest();
    return;
  }
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    die(`manifest.json is not valid JSON: ${e.message}`);
  }
  if (!manifest.id || !/^[0-9a-f-]{32,}$/i.test(manifest.id)) {
    // Manifest exists but id is bad — delete and re-bootstrap.
    log('manifest.json exists but has an invalid id. Re-registering with Domo...');
    rmSync(manifestPath);
    bootstrapManifest();
    return;
  }
  log(`Manifest OK (id: ${manifest.id}).`);
}

// --- 3. Verify thumbnail.png exists -----------------------------------------
function checkThumbnail() {
  if (!existsSync(thumbnailPath)) {
    // Auto-generate a simple placeholder rather than failing.
    log('thumbnail.png missing — downloading a placeholder...');
    try {
      execSync(
        `curl -fsSL -o "${thumbnailPath}" "https://placehold.co/300x300/0f172a/ffffff.png?text=App"`,
        { stdio: 'inherit' }
      );
    } catch {
      die(
        'Could not auto-download a thumbnail.\n' +
          '  Drop any 300x300 PNG at the project root named thumbnail.png and re-run.'
      );
    }
  }
  log('thumbnail.png present.');
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
        '    - Auth expired: run `domo login` again, then re-run.\n' +
        '    - Wrong instance: `domo login -i <your-instance>.domo.com`.\n' +
        '    - Network/proxy issue: check VPN.'
    );
  }
  log('✅ Deployed to Domo.');
  log('Find your app under Apps → Custom Apps in your Domo instance.');
}

// --- Run --------------------------------------------------------------------
checkRyuu();
ensureManifest();
checkThumbnail();
build();
stageAssets();
publish();
