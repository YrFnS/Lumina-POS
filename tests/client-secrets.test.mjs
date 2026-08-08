import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const sentinel = 'AIza-client-secret-regression-sentinel';

test('the browser bundle never contains the Gemini API key', () => {
  const build = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], {
    env: { ...process.env, GEMINI_API_KEY: sentinel },
    encoding: 'utf8'
  });
  assert.equal(build.status, 0, build.stderr || build.stdout);

  const bundle = readdirSync('dist/assets')
    .filter(file => file.endsWith('.js'))
    .map(file => readFileSync(`dist/assets/${file}`, 'utf8'))
    .join('\n');
  assert.equal(bundle.includes(sentinel), false);
});
