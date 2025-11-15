import dynamic from 'next/dynamic';
import type { PropertyCardData } from '@/data/mockProperties';

const PropertyMapClient = dynamic(() => import('./PropertyMap.client'), { ssr: false });

export function PropertyMap({ properties }: { properties: PropertyCardData[] }) {
  return <PropertyMapClient properties={properties} />;
}
