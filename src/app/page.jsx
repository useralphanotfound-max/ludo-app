import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
import RoyalLudoMobileApp from '@/components/mobile_app/RoyalLudoMobileApp';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Royal Ludo — Book. Match. Play.',
  description: 'Play Royal Ludo online with real players, win prizes, and enjoy certified fair play.',
};

export default async function RootPage() {
  let shouldTrigger404 = false;

  try {
    await connectDB();
    const rawDoc = await mongoose.connection.db.collection('gamesettings').findOne({});
    if (rawDoc && rawDoc.isWebGameEnabled === false) {
      shouldTrigger404 = true;
    }
  } catch (e) {
    console.error('Master web settings check error:', e);
  }

  if (shouldTrigger404) {
    notFound();
  }

  return <RoyalLudoMobileApp />;
}
