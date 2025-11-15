const highlights = [
  {
    title: 'AI-агент 24/7',
    description: 'Задайте критерии на русском языке, и ассистент соберет подборку объектов, задаст уточняющие вопросы и сохранит историю.',
  },
  {
    title: '30+ фильтров и карта',
    description: 'Площади, отделка, инфраструктура и вид из окна. Все фильтры в стиле ЦИАН + интерактивная карта с кластерами.',
  },
  {
    title: '100+ проверенных объектов',
    description: 'Реальные данные по Москве и регионам, фотографии, видео и 3D‑туры. Каждое объявление подтверждено модераторами.',
  },
];

export function PlatformHighlights() {
  return (
    <section className="mt-16 grid gap-6 md:grid-cols-3">
      {highlights.map((item) => (
        <article key={item.title} className="rounded-3xl border border-neutral-100 bg-white/90 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">BROKS</p>
          <h3 className="mt-4 text-xl font-semibold text-neutral-900">{item.title}</h3>
          <p className="mt-2 text-sm text-neutral-600">{item.description}</p>
        </article>
      ))}
    </section>
  );
}
