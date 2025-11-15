import { NextResponse } from 'next/server';
import { getPropertyById } from '@/services/propertyRepository';

export async function GET(_: Request, context: { params: { id: string } }) {
  const property = getPropertyById(context.params.id);
  if (!property) {
    return NextResponse.json({ message: 'Property not found' }, { status: 404 });
  }
  return NextResponse.json({ data: property });
}
