import { NextResponse } from 'next/server';

export async function GET() {
  const avatars = [
    { id: 'av1', avatar_id: 'av1', asset_name: 'avatar1.png', name: 'Knight', is_default: true },
    { id: 'av2', avatar_id: 'av2', asset_name: 'avatar2.png', name: 'Queen', is_default: false },
    { id: 'av3', avatar_id: 'av3', asset_name: 'avatar3.png', name: 'King', is_default: false },
    { id: 'av4', avatar_id: 'av4', asset_name: 'avatar4.png', name: 'Prince', is_default: false },
    { id: 'av5', avatar_id: 'av5', asset_name: 'avatar5.png', name: 'Warrior', is_default: false }
  ];

  return NextResponse.json({
    success: true,
    status: true,
    message: 'Avatars retrieved successfully',
    avatars: avatars.map(a => a.id),
    data: { avatars }
  }, { status: 200 });
}

