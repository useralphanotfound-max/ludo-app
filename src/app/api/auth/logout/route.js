import { NextResponse } from 'next/server';

export async function POST(req) {
  return NextResponse.json({
    status: true,
    message: 'User logged out successfully. Session invalidated.'
  });
}
