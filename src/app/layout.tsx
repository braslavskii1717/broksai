import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';
import { AppProviders } from './providers';
import { ChatWidget } from '@/components/chat/ChatWidget';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-primary', display: 'swap' });
const manrope = Manrope({ subsets: ['latin', 'cyrillic'], variable: '--font-heading', display: 'swap' });

const siteUrl = 'https://broks.ru';
const title = 'BROKS · Современная платформа недвижимости';
const description =
  'Подбор, аналитика и презентации недвижимости России. 100+ объектов, фильтры, AI-ассистент, карта и консультации.';

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(siteUrl),
  keywords: ['BROKS', 'Недвижимость', 'Купить квартиру', 'Аренда', 'Российская недвижимость'],
  authors: [{ name: 'BROKS Team', url: siteUrl }],
  alternates: {
    canonical: siteUrl,
    languages: {
      'ru-RU': siteUrl,
    },
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: 'BROKS',
    locale: 'ru_RU',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/og-cover.png`,
        width: 1200,
        height: 630,
        alt: 'BROKS — подбор недвижимости',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    site: '@broks',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://api-maps.yandex.ru" />
      </head>
      <body className={`${inter.variable} ${manrope.variable} bg-neutral-50 text-neutral-900`}>
        <AppProviders>
          {children}
          <ChatWidget />
        </AppProviders>
        <Script id="ld-org" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'BROKS',
            url: siteUrl,
            logo: `${siteUrl}/logo.png`,
            sameAs: ['https://t.me/broks', 'https://vk.com/broks'],
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+7-800-550-20-24',
              contactType: 'sales',
              areaServed: 'RU',
              availableLanguage: ['Russian'],
            },
          })}
        </Script>
      </body>
    </html>
  );
}
