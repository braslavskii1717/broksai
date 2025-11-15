import { NextResponse } from 'next/server';
import { parseNaturalLanguage } from '@/lib/nlp/heuristicParser';
import type { NaturalLanguageSearchResult } from '@/domain/nlp';

const systemPrompt = `Ты — ассистент платформы BROKS. Разбираешь пользовательские запросы о недвижимости и отвечаешь JSON формата {"cityName":"Москва","dealType":"buy","propertyTypes":["apartment"],"priceMax":15000000,"rooms":["2"]}`;

async function callOpenAI(query: string): Promise<NaturalLanguageSearchResult | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        response_format: { type: 'json_object' },
      }),
    });
    if (!response.ok) {
      console.warn('OpenAI error', await response.text());
      return null;
    }
    const data = (await response.json()) as { choices: { message: { content: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content);
  } catch (error) {
    console.warn('OpenAI request failed', error);
    return null;
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const query = typeof body?.query === 'string' ? body.query.trim() : '';
  if (!query) {
    return NextResponse.json({ message: 'Запрос обязателен' }, { status: 400 });
  }

  const heuristic = parseNaturalLanguage(query);
  const aiResult = await callOpenAI(query);
  const result: NaturalLanguageSearchResult = {
    ...heuristic,
    ...aiResult,
  };

  return NextResponse.json({ result });
}
