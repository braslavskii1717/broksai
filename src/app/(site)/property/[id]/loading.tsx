import { PropertyDetailSkeleton } from '@/components/skeletons/PropertyDetailSkeleton';

export default function LoadingPropertyDetail() {
  return (
    <div className="py-8">
      <PropertyDetailSkeleton />
    </div>
  );
}
