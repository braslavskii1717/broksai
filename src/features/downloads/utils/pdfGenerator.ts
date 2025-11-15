import type { PropertyCardData } from '@/data/mockProperties';
import type { User } from '@/domain/users';

const formatCurrency = (value: number) => new Intl.NumberFormat('ru-RU').format(value);

interface PresentationOptions {
  client?: string;
  id: string;
}

export function buildPresentationHTML(listing: PropertyCardData, user: User, opts: PresentationOptions) {
  const today = new Date().toLocaleDateString('ru-RU');
  const client = opts.client?.trim() || 'Клиент';
  const price = formatCurrency(listing.price);

  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Презентация — ${listing.title}</title>
  <style>
    :root{ --ink:#111; --mut:#666; --line:#e6e6e6; }
    *{ box-sizing:border-box; }
    body{ font-family:-apple-system,BlinkMacSystemFont,Inter,Segoe UI,Roboto,Arial,sans-serif; color:var(--ink); margin:0; }
    .page{ width:210mm; min-height:297mm; margin:0 auto; padding:24mm; background:#fff; position:relative; }
    header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:14mm; }
    .logo{ width:12mm; height:12mm; border-radius:4mm; background:#000; }
    .h1{ font-size:22pt; font-weight:700; line-height:1.2; }
    .mut{ color:var(--mut); }
    .chip{ display:inline-block; border:1px solid var(--line); padding:4px 8px; border-radius:999px; font-size:9pt; margin-right:6px; }
    .cover{ width:100%; height:90mm; object-fit:cover; border-radius:12px; border:1px solid var(--line); }
    .grid{ display:grid; grid-template-columns:1fr 1fr; gap:12mm; margin-top:8mm; }
    h2{ font-size:14pt; margin:0 0 6mm; }
    footer{ position:fixed; bottom:10mm; left:24mm; right:24mm; display:flex; justify-content:space-between; font-size:9pt; color:var(--mut); }
    .wm{ position:fixed; inset:0; pointer-events:none; opacity:0.1; display:grid; place-items:center; font-weight:700; font-size:48pt; transform:rotate(-22deg); }
    @media print{ @page{ size:A4; margin:0; } .page{ page-break-after:always; } }
  </style>
</head>
<body>
  <div class="wm">Подготовлено для ${client}</div>
  <section class="page">
    <header>
      <div style="display:flex;align-items:center;gap:10px">
        <div class="logo"></div>
        <div>
          <div class="h1">${listing.title}</div>
          <div class="mut">${listing.city}${listing.district ? `, ${listing.district}` : ''}</div>
        </div>
      </div>
      <div class="mut" style="text-align:right">
        Брокер: <b>${user.name}</b><br/>
        ${user.company ? `${user.company}<br/>` : ''}
        Email: ${user.email}
      </div>
    </header>

    <img class="cover" src="${listing.image}" alt="${listing.title}" />

    <div class="grid">
      <div>
        <h2>Ключевые параметры</h2>
        <div class="chip">${listing.dealType === 'rent' ? 'Аренда' : 'Продажа'}</div>
        <div class="chip">Тип: ${listing.propertyType}</div>
        <div style="margin-top:6mm;font-size:12pt;font-weight:600">Цена: ${price} ₽</div>
      </div>
      <div>
        <h2>Преимущества</h2>
        <ul>
          ${listing.highlights.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>

    <div style="margin-top:10mm">
      <h2>Следующие шаги</h2>
      <ol style="margin:0;padding-left:18px">
        <li>Организуем просмотр или онлайн-тур</li>
        <li>Бронь и фиксация условий</li>
        <li>Полное сопровождение сделки</li>
      </ol>
    </div>

    <footer>
      <div>ID презентации: ${opts.id}</div>
      <div>${today} · Подготовлено для ${client}</div>
    </footer>
  </section>
</body>
</html>`;
}

export function openPrintWindow(html: string) {
  const w = window.open('about:blank');
  if (!w) {
    alert('Разрешите всплывающие окна для экспорта PDF');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.onload = () => setTimeout(() => {
    w.focus();
    w.print();
  }, 300);
}
