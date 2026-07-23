import { NextResponse } from 'next/server';

export async function GET(req) {
  return NextResponse.json({
    status: true,
    message: 'FAQs retrieved',
    data: [
      {
        id: 'faq1',
        category: 'payment',
        question: 'How long does a withdrawal cashout take?',
        answer: 'Withdrawal requests are processed immediately or within 15 minutes after superadmin approval.'
      },
      {
        id: 'faq2',
        category: 'match-dispute',
        question: 'How are match disputes resolved?',
        answer: 'In disputed matches, both players submit screenshots of Ludo King. Superadmins review both screenshots and declare the winner.'
      }
    ]
  });
}
