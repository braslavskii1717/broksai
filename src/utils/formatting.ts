export function formatPrice(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

export function formatDate(date: string | Date, format: 'short' | 'long' = 'short') {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (format === 'long') {
    return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return d.toLocaleDateString('ru-RU');
}
