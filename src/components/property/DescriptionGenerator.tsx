'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export type DescriptionInput = {
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
  initialDescription: string;
};

export function DescriptionGenerator(props: DescriptionInput) {
  const [description, setDescription] = useState(props.initialDescription);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const generate = async () => {
    setStatus('loading');
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(props),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = (await response.json()) as { description: string };
      setDescription(data.description);
      setStatus('idle');
    } catch (error) {
      console.warn('Description generation failed', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2500);
    }
  };

  return (
    <div className="space-y-4">
      <p className="mt-3 text-neutral-600 whitespace-pre-line">{description}</p>
      <Button variant="secondary" onClick={generate} disabled={status === 'loading'}>
        {status === 'loading' ? 'Генерируем...' : 'Сгенерировать описание'}
      </Button>
      {status === 'error' && <p className="text-sm text-red-600">Не удалось сгенерировать описание</p>}
    </div>
  );
}
