import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { PlatformHighlights } from '@/components/home/PlatformHighlights';
import { PopularCities } from '@/components/home/PopularCities';
import { FeaturedProperties } from '@/components/home/FeaturedProperties';
import { ContactSection } from '@/components/home/ContactSection';

export const metadata: Metadata = {
  title: 'BROKS · Платформа №1 по подбору недвижимости в России',
  description: 'AI-агент 24/7, интерактивные карты, 30+ фильтров. 100+ проверенных объектов в Москве. Новостройки, вторичка, аренда.',
  keywords: ['недвижимость москва', 'купить квартиру', 'аренда квартир', 'новостройки москва', 'вторичка', 'BROKS'],
  openGraph: {
    title: 'BROKS · Современная платформа недвижимости',
    description: 'AI-агент, карты, фильтры и аналитика в единой экосистеме',
    images: ['/og-image.jpg'],
    type: 'website',
    locale: 'ru_RU',
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PlatformHighlights />
      <PopularCities />
      <FeaturedProperties />
      <ContactSection />
    </>
  );
}
