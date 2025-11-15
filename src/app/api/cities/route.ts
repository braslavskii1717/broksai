import { NextResponse } from 'next/server';
import { russianCities } from '@/data/cities';

export async function GET() {
  return NextResponse.json({ data: russianCities });
}
