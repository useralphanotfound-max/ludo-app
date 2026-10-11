import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Royal Ludo — Control Center',
  description: 'Royal Ludo Administrative Management & Game Operations Portal'
};

export default function RootPage() {
  redirect('/admin');
}
