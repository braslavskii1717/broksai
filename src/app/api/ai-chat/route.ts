import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { PropertyFilters } from '@/domain/filters';

type ChatMessageInput = {
  role: 'user' | 'assistant';
  content: string;
};

type PropertySnippet = {
  id: string;
  title: string;
  price: number;
  address: string;
  rooms: string | number;
  area: number;
  propertyType?: string;
};

type ChatContextPayload = {
  city?: string;
  dealType?: string;
  filters?: PropertyFilters;
  properties?: PropertySnippet[];
  total?: number;
};

type ChatRequestBody = {
  messages: ChatMessageInput[];
  context?: ChatContextPayload;
};

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const SYSTEM_PROMPT = `Ты AI-консультант по недвижимости платформы BROKS. Ты всегда отвечаешь на русском языке, дружелюбно и профессионально.
Ты используешь данные текущей выдачи и фильтров пользователя. Если рекомендуешь объект, обязательно указывай его ID (например prop-0001) и кратко описывай, почему он подходит.
Если подходящих вариантов нет, предложи изменить фильтры или оставить заявку брокеру.`;

const currencyFormatter = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

function formatFilters(filters?: PropertyFilters) {
  if (!filters) return 'Без активных фильтров. Показывайте наиболее подходящие предложения.';
  const parts: string[] = [];
  if (filters.priceMin || filters.priceMax) {
    const min = filters.priceMin ? currencyFormatter.format(filters.priceMin) : 'любой';
    const max = filters.priceMax ? currencyFormatter.format(filters.priceMax) : 'любой';
    parts.push(`Цена от ${min} до ${max}`);
  }
  if (filters.totalAreaMin || filters.totalAreaMax) {
    parts.push(`Площадь ${filters.totalAreaMin ?? 'любой'}–${filters.totalAreaMax ?? 'любой'} м²`);
  }
  if (filters.rooms.length) {
    parts.push(`Комнаты: ${filters.rooms.join(', ')}`);
  }
  if (filters.propertyTypes.length) {
    parts.push(`Типы: ${filters.propertyTypes.join(', ')}`);
  }
  if (filters.houseTypes.length) {
    parts.push(`Тип дома: ${filters.houseTypes.join(', ')}`);
  }
  if (filters.conditions.length) {
    parts.push(`Состояние: ${filters.conditions.join(', ')}`);
  }
  if (filters.amenities.length) {
    parts.push(`Удобства: ${filters.amenities.join(', ')}`);
  }
  if (filters.views.length) {
    parts.push(`Вид из окон: ${filters.views.join(', ')}`);
  }
  if (filters.parking.length) {
    parts.push(`Паркинг: ${filters.parking.join(', ')}`);
  }
  if (filters.hasPhotos) parts.push('Только с фото');
  if (filters.hasVideo) parts.push('Только с видео');
  if (filters.hasVirtualTour) parts.push('3D-тур');
  if (filters.onlineShowing) parts.push('Онлайн-показ');
  if (filters.newBuilding) parts.push('Только новостройки');
  if (filters.mortgage) parts.push('Возможна ипотека');
  if (filters.installment) parts.push('Рассрочка');
  if (filters.petFriendly) parts.push('Можно с питомцами');
  if (filters.accessibilityFriendly) parts.push('Безбарьерная среда');
  if (filters.metroDistanceMax !== null) parts.push(`До метро ${filters.metroDistanceMax} м`);

  if (!parts.length) {
    return 'Без активных фильтров. Показывайте наиболее подходящие предложения.';
  }
  return parts.join('; ');
}

function formatProperties(properties?: PropertySnippet[], total?: number) {
  if (!properties?.length) {
    return 'Объявления пока не загружены. Предложи запросить консультацию.';
  }
  const limit = properties.slice(0, 20);
  const lines = limit.map((property) => {
    const price = currencyFormatter.format(property.price);
    return `ID ${property.id}: ${property.title}, ${property.rooms} комн., ${property.area} м², ${price}, ${property.address}`;
  });
  const suffix =
    typeof total === 'number' && total > limit.length
      ? `Показаны ${limit.length} из ${total} объектов.`
      : `Показано ${limit.length} объектов.`;
  return `${lines.join('\n')}\n${suffix}`;
}

function buildContextPrompt(context?: ChatContextPayload) {
  if (!context) return 'Данные о текущей выдаче отсутствуют.';
  const cityInfo = context.city ? `Город поиска: ${context.city}.` : 'Город поиска не указан.';
  const dealTypeInfo =
    context.dealType === 'rent'
      ? 'Пользователь ищет объекты для аренды.'
      : context.dealType === 'buy'
        ? 'Пользователь ищет объекты для покупки.'
        : 'Тип сделки неизвестен.';
  const filterInfo = `Активные фильтры: ${formatFilters(context.filters)}.`;
  const propertyInfo = `Список доступных объявлений:\n${formatProperties(context.properties, context.total)}`;

  return [cityInfo, dealTypeInfo, filterInfo, propertyInfo].join('\n');
}

export async function POST(request: Request) {
  if (!openai) {
    return NextResponse.json({ error: 'OpenAI API ключ не настроен' }, { status: 500 });
  }
  try {
    const body = (await request.json()) as ChatRequestBody;
    if (!body?.messages?.length) {
      return NextResponse.json({ error: 'Сообщения не переданы' }, { status: 400 });
    }
    const trimmedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = body.messages.slice(-10).map((message) => ({
      role: message.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: message.content,
    }));
    const contextPrompt = buildContextPrompt(body.context);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 500,
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\nКонтекст:\n${contextPrompt}` },
        ...trimmedMessages,
      ],
    });
    const content = completion.choices[0]?.message?.content?.trim();
    return NextResponse.json({ content });
  } catch (error) {
    console.error('[ai-chat] error', error);
    const status = (error as { status?: number }).status ?? 500;
    if (status === 429) {
      return NextResponse.json({ error: 'RATE_LIMIT' }, { status: 429 });
    }
    return NextResponse.json({ error: 'AI_UNAVAILABLE' }, { status });
  }
}
