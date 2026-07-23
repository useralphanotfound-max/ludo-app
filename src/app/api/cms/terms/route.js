import { NextResponse } from 'next/server';

export async function GET(req) {
  return NextResponse.json({
    status: true,
    message: 'Terms and Conditions retrieved',
    data: {
      title: 'Royal Ludo Terms of Service',
      version: '1.0',
      lastUpdated: '2026-07-23',
      content: 'Royal Ludo provides skill-based online Ludo gaming platform. Users must be 18+ years old to play for stakes.'
    }
  });
}
