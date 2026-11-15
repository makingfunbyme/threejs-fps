// Cinder Protocol: Package the static entry using Node's standard library.
// Run `node serve.ts` to play locally; run this file to prepare the submission.
// MAKEFUN_OUTPUT_DIR overrides /output for local packaging checks.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-threejs.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Validate the output entry and screenshot directory before generating the dossier.
for (const relative of ['game/index.html', 'screenshots']) {
  if (!existsSync(join(out, relative))) {
    throw new Error(`Cinder Protocol packaging failed: missing ${relative} in ${out}`);
  }
}

// Match the scorer's text, screenshot, and game-file budgets.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, game_max_files: 993, game_max_bytes: 50331648 }),
);
