'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessage } from '@/domain/chat';
import { Button } from '@/components/ui/Button';
import { usePropertyFeed } from '@/hooks/usePropertyFeed';
import { usePropertyFeedContext } from '@/context/PropertyFeedContext';
import { useCity } from '@/context/CityContext';

type Status = 'idle' | 'loading' | 'error';

const MIN_REQUEST_DELAY = 2000;
const propertyIdRegex = /(prop-\d{4,})/gi;

const baseGreeting: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Здравствуйте! Я BROKS AI-консультант. Опишите, что вы ищете, и я подберу предложения.',
  timestamp: new Date().toISOString(),
};

function renderMessageContent(content: string, isAssistant: boolean) {
  const lines = content.split('\n').filter((line, index, array) => line.trim().length > 0 || array.length === 1);
  const linkClass = isAssistant ? 'font-semibold text-[#0066FF] underline' : 'font-semibold text-white underline';

  return lines.map((line, lineIndex) => {
    const segments = line.split(propertyIdRegex);
    return (
      <p key={`${lineIndex}-${line}`} className="whitespace-pre-wrap">
        {segments.map((segment, idx) => {
          const trimmed = segment.trim();
          if (/^prop-\d{4,}$/i.test(trimmed)) {
            const normalized = trimmed.toLowerCase();
            return (
              <a key={`${trimmed}-${idx}`} href={`/property/${normalized}`} className={linkClass}>
                {trimmed}
              </a>
            );
          }
          return <span key={`${segment}-${idx}`}>{segment}</span>;
        })}
      </p>
    );
  });
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([baseGreeting]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isThrottled, setIsThrottled] = useState(false);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { properties, total } = usePropertyFeed();
  const { state } = usePropertyFeedContext();
  const { city } = useCity();

  const contextProperties = useMemo(
    () =>
      properties.slice(0, 20).map((property) => ({
        id: property.id,
        title: property.title,
        price: property.price,
        address: property.address,
        rooms: property.rooms,
        area: property.area,
        propertyType: property.propertyType,
      })),
    [properties],
  );

  const canSend = input.trim().length > 0 && status !== 'loading' && !isThrottled;

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('broks:chat-history') : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch {
        // ignore corrupted storage
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('broks:chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, []);

  const scheduleThrottle = () => {
    setIsThrottled(true);
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
    }
    throttleTimeoutRef.current = setTimeout(() => {
      setIsThrottled(false);
      throttleTimeoutRef.current = null;
    }, MIN_REQUEST_DELAY);
  };

  const appendAssistantMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const sendMessage = async () => {
    if (!canSend) return;
    setErrorMessage(null);
    scheduleThrottle();

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...messages, newMessage];
    const payload = {
      messages: updatedHistory.slice(-10).map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content,
      })),
      context: {
        city: city.name,
        dealType: state.dealType,
        filters: state.filters,
        properties: contextProperties,
        total,
      },
    };

    setMessages(updatedHistory);
    setInput('');
    setStatus('loading');

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        throw new Error('RATE_LIMIT');
      }
      if (!response.ok) {
        throw new Error('API_ERROR');
      }

      const data = (await response.json()) as { content?: string | null };
      const content = data.content?.trim();
      if (!content) {
        appendAssistantMessage('Свяжитесь с нашим брокером для персональной консультации — я не нашёл подходящих вариантов.');
      } else {
        appendAssistantMessage(content);
      }
      setStatus('idle');
    } catch (error) {
      console.error('Chat error', error);
      setStatus('error');
      if ((error as Error).message === 'RATE_LIMIT') {
        setErrorMessage('Слишком много запросов. Подождите минуту и попробуйте снова.');
      } else {
        setErrorMessage('Не удалось получить ответ AI. Попробуйте позже.');
      }
      appendAssistantMessage('Свяжитесь с нашим брокером для персональной консультации — ответ AI временно недоступен.');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const supportLink = useMemo(
    () => 'mailto:support@broks.ru?subject=Консультация по объекту',
    [],
  );

  return (
    <>
      <button
        type="button"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primary-dark"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Открыть чат"
      >
        {isOpen ? '×' : 'AI'}
      </button>
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[min(400px,90vw)] rounded-3xl border border-black/10 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
            <div>
              <p className="text-sm uppercase text-neutral-500">BROKS AI</p>
              <p className="text-base font-semibold text-neutral-900">Консультант 24/7</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setMessages([baseGreeting])}>
              Очистить
            </Button>
          </div>
          <div className="max-h-80 overflow-y-auto px-4 py-3 space-y-3 text-sm">
            {messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div
                  key={message.id}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                    isUser ? 'ml-auto bg-primary text-white' : 'bg-neutral-100 text-neutral-900'
                  }`}
                >
                  {renderMessageContent(message.content, !isUser)}
                </div>
              );
            })}
            {status === 'loading' && (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-neutral-100 px-3 py-2 text-neutral-500">
                <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:0.3s]" />
                <span>AI печатает…</span>
              </div>
            )}
          </div>
          {status === 'error' && errorMessage ? (
            <p className="px-4 text-sm text-red-600">{errorMessage}</p>
          ) : null}
          <div className="border-t border-black/10 px-4 py-3 space-y-2">
            <textarea
              rows={2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              placeholder="Опишите, что вы ищете..."
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={sendMessage} disabled={!canSend}>
                {status === 'loading' ? 'AI думает…' : 'Отправить'}
              </Button>
              <a
                href={supportLink}
                className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
              >
                Связаться с брокером
              </a>
            </div>
            {isThrottled && status !== 'loading' ? (
              <p className="text-xs text-neutral-500">Подождите пару секунд перед следующей отправкой.</p>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
