// Package the offline guide and its original browser renders for the make.fun scorer.

import assert from 'node:assert/strict';
import { cpSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const manifest = JSON.parse(readFileSync(join(here, 'shots.json'), 'utf8')) as { file: string }[];
const screenshots = readdirSync(join(here, 'screenshots')).filter(name => !name.startsWith('.')).sort();
assert.ok(screenshots.length >= 3 && screenshots.length <= 4, 'Supply three or four screenshots.');
assert.deepEqual(screenshots, manifest.map(shot => shot.file), 'shots.json must describe every screenshot in cover order.');

const trophyData = readFileSync(join(here, 'app/data/trophies.json'), 'utf8');
const offlineMirror = readFileSync(join(here, 'app/data/catalog.js'), 'utf8').split('\n').slice(2).join('\n');
assert.deepEqual(JSON.parse(offlineMirror), JSON.parse(trophyData), 'The offline catalog must match trophies.json.');

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
