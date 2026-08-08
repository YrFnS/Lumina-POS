import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildOpenRouterRequest,
  clearOpenRouterKey,
  filterModels,
  loadOpenRouterSettings,
  OPENROUTER_CHAT_URL,
  parseModelCatalog,
  redactOpenRouterError,
  saveOpenRouterKey,
  saveOpenRouterModel
} from '../features/ai/openrouter.ts';

class MemoryStorage {
  #values = new Map<string, string>();
  getItem(key: string) { return this.#values.get(key) ?? null; }
  setItem(key: string, value: string) { this.#values.set(key, value); }
  removeItem(key: string) { this.#values.delete(key); }
}

const fakeKey = 'sk-or-v1-fake-browser-test-key';

test('catalog parsing, search, and Free filtering use returned data', () => {
  const models = parseModelCatalog({
    data: [
      { id: 'vendor/free-model', name: 'Free Model', context_length: 128000, pricing: { prompt: '0', completion: '0' } },
      { id: 'vendor/paid-model', name: 'Paid Searchable', context_length: 64000, pricing: { prompt: '0.000001', completion: '0.000002' } },
      { id: 'vendor/name-says-free', name: 'Free in name only', pricing: {} },
      { id: '', name: 'Invalid', pricing: { prompt: '0', completion: '0' } }
    ]
  });

  assert.equal(models.length, 3);
  assert.equal(models[0].contextLength, 128000);
  assert.equal(models[0].isFree, true);
  assert.equal(models[1].isFree, false);
  assert.equal(models[2].isFree, false);
  assert.deepEqual(filterModels(models, 'searchable', false).map((model) => model.id), ['vendor/paid-model']);
  assert.deepEqual(filterModels(models, 'vendor', true).map((model) => model.id), ['vendor/free-model']);
});

test('browser-local key/model selection and redaction never expose a stored key', () => {
  const storage = new MemoryStorage();
  saveOpenRouterKey(storage, fakeKey);
  saveOpenRouterModel(storage, 'vendor/explicit-model');
  assert.deepEqual(loadOpenRouterSettings(storage), { apiKey: fakeKey, modelId: 'vendor/explicit-model' });

  const redacted = redactOpenRouterError(new Error(`Provider echoed ${fakeKey}`), fakeKey);
  assert.equal(redacted.includes(fakeKey), false);
  assert.match(redacted, /\[REDACTED\]/);

  clearOpenRouterKey(storage);
  assert.deepEqual(loadOpenRouterSettings(storage), { apiKey: '', modelId: 'vendor/explicit-model' });
});

test('request construction uses the exact selected model and Bearer key only in the header', () => {
  const request = buildOpenRouterRequest(fakeKey, 'vendor/explicit-model', 'System context', [
    { role: 'user', content: 'Question' },
    { role: 'assistant', content: 'Prior answer' }
  ]);
  const expectedBody = JSON.stringify({
    model: 'vendor/explicit-model',
    messages: [
      { role: 'system', content: 'System context' },
      { role: 'user', content: 'Question' },
      { role: 'assistant', content: 'Prior answer' }
    ]
  });

  assert.equal(request.url, OPENROUTER_CHAT_URL);
  assert.equal(request.init.headers.Authorization, `Bearer ${fakeKey}`);
  assert.equal(request.init.body, expectedBody);
  assert.equal(request.url.includes(fakeKey), false);
  assert.equal(request.init.body.includes(fakeKey), false);
  assert.throws(() => buildOpenRouterRequest('', 'vendor/explicit-model', '', []), /Add your OpenRouter key/);
  assert.throws(() => buildOpenRouterRequest(fakeKey, '', '', []), /Select an OpenRouter model/);
});
