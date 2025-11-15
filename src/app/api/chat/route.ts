import { NextResponse } from 'next/server';
import type { ChatMessage } from '@/domain/chat';

const systemPrompt = `Ты — BROKS AI Concierge. Отвечаешь на вопросы о недвижимости в России. 
Никогда не придумывай данные: опирайся на известные фильтры (тип, город, цена, статус, удобства).
Если информации нет — предложи связаться с брокером и подсказать через форму обратной связи.`;

type RequestPayload = {
  messages: ChatMessage[];
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as RequestPayload | null;
  if (!body || !Array.isArray(body.messages)) {
    return NextResponse.json({ message: 'Некорректный запрос' }, { status: 400 });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: 'AI недоступен. Свяжитесь с брокером.', fallback: true },
      { status: 503 },
    );
  }
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        messages: [
          { role: 'system', content: systemPrompt },
          ...body.messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const data = (await response.json()) as { choices: { message: { content: string } }[] };
    const content = data.choices?.[0]?.message?.content ?? 'Не могу ответить. Напишите брокеру.';
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Chat API error', error);
    return NextResponse.json(
      { message: 'Не удалось получить ответ AI. Свяжитесь с брокером.', fallback: true },
      { status: 500 },
    );
  }
}
