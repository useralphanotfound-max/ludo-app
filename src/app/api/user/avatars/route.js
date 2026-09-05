import { NextResponse } from 'next/server';

export async function GET() {
  const avatars = [
    {
      id: 'av1',
      url: 'https://cdn.royalludo.com/avatars/av1.png',
      name: 'Knight',
      is_default: true
    },
    {
      id: 'av2',
      url: 'https://cdn.royalludo.com/avatars/av2.png',
      name: 'Queen',
      is_default: false
    },
    {
      id: 'av3',
      url: 'https://cdn.royalludo.com/avatars/av3.png',
      name: 'King',
      is_default: false
    },
    {
      id: 'av4',
      url: 'https://cdn.royalludo.com/avatars/av4.png',
      name: 'Prince',
      is_default: false
    },
    {
      id: 'av5',
      url: 'https://cdn.royalludo.com/avatars/av5.png',
      name: 'Warrior',
      is_default: false
    },
    {
      id: 'av6',
      url: 'https://cdn.royalludo.com/avatars/av6.png',
      name: 'Emperor',
      is_default: false
    }
  ];

  return NextResponse.json({
    success: true,
    data: { avatars }
  }, { status: 200 });
}
