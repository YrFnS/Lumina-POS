import { GoogleGenAI } from '@google/genai';

const headers = { 'Cache-Control': 'no-store' };
const error = (message: string, status: number) => Response.json({ error: message }, { status, headers });

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return error('Lumina Intelligence is not configured.', 503);

  const body = await request.json().catch(() => null);
  if (!body || typeof body.systemInstruction !== 'string' || body.systemInstruction.length > 50_000 || !Array.isArray(body.messages) || body.messages.length > 20) {
    return error('Invalid request.', 400);
  }

  const messages = body.messages.filter((message: unknown) => {
    if (!message || typeof message !== 'object') return false;
    const { role, text } = message as { role?: unknown; text?: unknown };
    return (role === 'user' || role === 'model') && typeof text === 'string' && text.length <= 4_000;
  }) as Array<{ role: 'user' | 'model'; text: string }>;
  if (messages.length !== body.messages.length || messages.length === 0) return error('Invalid request.', 400);

  try {
    const response = await new GoogleGenAI({ apiKey }).models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: messages.map(({ role, text }) => ({ role, parts: [{ text }] })),
      config: { systemInstruction: body.systemInstruction, temperature: 0.2 }
    });
    return Response.json({ text: response.text || 'System Error.' }, { headers });
  } catch {
    return error('Connection to Intelligence Core failed.', 502);
  }
}
