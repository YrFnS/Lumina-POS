import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const sentinels = ['AIza-client-secret-regression-sentinel', 'sk-or-v1-env-secret-regression-sentinel'];

test('the browser bundle never contains provider keys from the environment', () => {
  const build = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], {
    env: { ...process.env, GEMINI_API_KEY: sentinels[0], OPENROUTER_API_KEY: sentinels[1] },
    encoding: 'utf8'
  });
  assert.equal(build.status, 0, build.stderr || build.stdout);

  const bundle = readdirSync('dist/assets')
    .filter(file => file.endsWith('.js'))
    .map(file => readFileSync(`dist/assets/${file}`, 'utf8'))
    .join('\n');
  for (const sentinel of sentinels) assert.equal(bundle.includes(sentinel), false);
});
