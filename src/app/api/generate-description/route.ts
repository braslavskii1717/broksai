import { NextResponse } from 'next/server';

type GeneratePayload = {
  id: string;
  title: string;
  city: string;
  district?: string;
  address?: string;
  price: number;
  area?: number;
  rooms?: string;
  propertyType?: string;
  highlights?: string[];
  amenities?: string[];
};

const systemPrompt = `Ты — AI-копирайтер BROKS. Пиши короткие продающие описания (до 120 слов) в стиле premium real estate на русском языке. Упоминай район, метраж, преимущества, инфраструктуру и призыв к действию.`;

async function callOpenAI(description: GeneratePayload): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.5,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Объект: ${description.title}. Город: ${description.city}. Район: ${description.district ?? ''}. Адрес: ${description.address ?? ''}. Тип: ${description.propertyType ?? ''}. Площадь: ${description.area ?? ''} м². Комнаты: ${description.rooms ?? ''}. Цена: ${description.price} ₽. Преимущества: ${(description.highlights ?? []).join(', ')}. Удобства: ${(description.amenities ?? []).join(', ')}.`,
          },
        ],
      }),
    });
    if (!response.ok) {
      console.warn('OpenAI describe error', await response.text());
      return null;
    }
    const data = (await response.json()) as { choices: { message: { content: string } }[] };
    return data.choices?.[0]?.message?.content ?? null;
  } catch (error) {
    console.warn('OpenAI describe exception', error);
    return null;
  }
}

const fallbackDescription = (payload: GeneratePayload) => {
  const parts = [
    `${payload.title} в ${payload.city}${payload.district ? `, район ${payload.district}` : ''}`,
    payload.area ? `Площадь ${payload.area} м²${payload.rooms ? `, ${payload.rooms}-комн.` : ''}.` : undefined,
    `Стоимость ${new Intl.NumberFormat('ru-RU').format(payload.price)} ₽.`,
    payload.highlights?.length ? `Ключевые преимущества: ${payload.highlights.slice(0, 3).join(', ')}.` : undefined,
    'Оставьте заявку, чтобы получить презентацию и условия сделки.',
  ].filter(Boolean);
  return parts.join(' ');
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as GeneratePayload | null;
  if (!payload || !payload.title || !payload.city) {
    return NextResponse.json({ message: 'Недостаточно данных' }, { status: 400 });
  }

  const aiDescription = await callOpenAI(payload);
  const result = aiDescription ?? fallbackDescription(payload);
  return NextResponse.json({ description: result });
}
