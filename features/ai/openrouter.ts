export const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models';
export const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const OPENROUTER_KEY_STORAGE_KEY = 'lumina_openrouter_key';
export const OPENROUTER_MODEL_STORAGE_KEY = 'lumina_openrouter_model';

export interface OpenRouterModel {
  id: string;
  name: string;
  contextLength: number | null;
  promptPrice: string;
  completionPrice: string;
  isFree: boolean;
}

export interface OpenRouterSettings {
  apiKey: string;
  modelId: string;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const nonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

export function parseModelCatalog(payload: unknown): OpenRouterModel[] {
  if (!payload || typeof payload !== 'object' || !Array.isArray((payload as { data?: unknown }).data)) {
    throw new Error('OpenRouter returned an invalid model catalog.');
  }

  return (payload as { data: unknown[] }).data.flatMap((raw) => {
    if (!raw || typeof raw !== 'object') return [];
    const model = raw as Record<string, unknown>;
    const pricing = model.pricing && typeof model.pricing === 'object' ? model.pricing as Record<string, unknown> : {};
    if (!nonEmptyString(model.id) || !nonEmptyString(model.name)) return [];

    const promptPrice = typeof pricing.prompt === 'string' ? pricing.prompt : '';
    const completionPrice = typeof pricing.completion === 'string' ? pricing.completion : '';
    const promptNumber = promptPrice === '' ? NaN : Number(promptPrice);
    const completionNumber = completionPrice === '' ? NaN : Number(completionPrice);
    const contextLength = typeof model.context_length === 'number' && Number.isFinite(model.context_length)
      ? model.context_length
      : null;

    return [{
      id: model.id,
      name: model.name,
      contextLength,
      promptPrice,
      completionPrice,
      isFree: Number.isFinite(promptNumber) && Number.isFinite(completionNumber) && promptNumber === 0 && completionNumber === 0
    }];
  });
}

export function filterModels(models: OpenRouterModel[], query: string, freeOnly: boolean): OpenRouterModel[] {
  const needle = query.trim().toLowerCase();
  return models.filter((model) =>
    (!freeOnly || model.isFree) && (!needle || model.name.toLowerCase().includes(needle) || model.id.toLowerCase().includes(needle))
  );
}

export function loadOpenRouterSettings(storage: StorageLike): OpenRouterSettings {
  return {
    apiKey: storage.getItem(OPENROUTER_KEY_STORAGE_KEY) || '',
    modelId: storage.getItem(OPENROUTER_MODEL_STORAGE_KEY) || ''
  };
}

export function saveOpenRouterKey(storage: StorageLike, apiKey: string): void {
  if (!apiKey) throw new Error('Enter an OpenRouter key before saving.');
  storage.setItem(OPENROUTER_KEY_STORAGE_KEY, apiKey);
}

export function clearOpenRouterKey(storage: StorageLike): void {
  storage.removeItem(OPENROUTER_KEY_STORAGE_KEY);
}

export function saveOpenRouterModel(storage: StorageLike, modelId: string): void {
  if (!modelId.trim()) throw new Error('Enter or select an OpenRouter model ID.');
  storage.setItem(OPENROUTER_MODEL_STORAGE_KEY, modelId.trim());
}

export function redactOpenRouterError(value: unknown, apiKey = ''): string {
  let message = value instanceof Error ? value.message : String(value || '');
  if (apiKey) message = message.split(apiKey).join('[REDACTED]');
  return message.replace(/sk-or-v1-[A-Za-z0-9_-]+/g, '[REDACTED]').slice(0, 500);
}

export function openRouterErrorMessage(status: number, payload: unknown, apiKey: string): string {
  if (status === 401 || status === 403) return 'OpenRouter rejected the browser key. Check or replace it in Settings.';
  if (status === 429) return 'OpenRouter rate limit reached. Wait briefly or choose another model.';
  const detail = payload && typeof payload === 'object'
    ? (payload as { error?: { message?: unknown } | string }).error
    : null;
  const raw = typeof detail === 'string' ? detail : detail && typeof detail === 'object' ? detail.message : '';
  const safe = redactOpenRouterError(raw, apiKey);
  return safe ? `OpenRouter request failed (${status}): ${safe}` : `OpenRouter request failed (${status}). Check the selected model and try again.`;
}

export function buildOpenRouterRequest(apiKey: string, modelId: string, systemInstruction: string, messages: ChatMessage[]) {
  if (!apiKey) throw new Error('Add your OpenRouter key in Settings before using Lumina Intelligence.');
  if (!modelId) throw new Error('Select an OpenRouter model in Settings before using Lumina Intelligence.');

  return {
    url: OPENROUTER_CHAT_URL,
    init: {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'system', content: systemInstruction }, ...messages]
      })
    }
  } as const;
}
