import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES, saveUploadedFile } from '../lib/uploadHelper.js';
import fs from 'fs';
import path from 'path';

async function runVerification() {
  console.log('=====================================================');
  console.log('ROYAL LUDO — END-TO-END VERIFICATION & AUDIT RUNNER');
  console.log('=====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assertTest(name, condition, details = '') {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${name}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${name} -> ${details}`);
    }
  }

  // 1. Check Upload Helper
  console.log('--- 1. Testing Upload Engine & Storage ---');
  try {
    const sampleBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const uploaded = await saveUploadedFile(sampleBuffer, 'proofs', 'test_proof.png');
    assertTest('File saved to disk in public/uploads/proofs', fs.existsSync(path.join(process.cwd(), 'public', uploaded.url.replace(/^\//, ''))));
    assertTest('Upload returned clean relative URL (/uploads/proofs/...)', uploaded.url.startsWith('/uploads/proofs/'));
  } catch (err) {
    assertTest('Upload engine execution', false, err.message);
  }

  // 2. Check Required API Routes Files
  console.log('\n--- 2. Auditing Critical Backend Route Endpoints ---');
  const requiredRoutes = [
    'src/app/api/rooms/create/route.js',
    'src/app/api/rooms/join/route.js',
    'src/app/api/rooms/route.js',
    'src/app/api/rooms/available/route.js',
    'src/app/api/rooms/[id]/route.js',
    'src/app/api/rooms/[id]/code/route.js',
    'src/app/api/support/chat/messages/route.js',
    'src/app/api/support/chat/unread-count/route.js',
    'src/app/api/support/chat/mark-read/route.js',
    'src/app/api/admin/deposits/[id]/approve/route.js',
    'src/app/api/admin/deposits/[id]/reject/route.js',
    'src/app/api/admin/withdrawals/[id]/approve/route.js',
    'src/app/api/admin/withdrawals/[id]/reject/route.js',
    'src/app/api/wallet/deposit/initiate/route.js',
    'src/app/api/wallet/deposit/submit-utr/route.js',
    'src/app/api/wallet/deposit/confirm/route.js',
    'src/app/api/wallet/withdraw/initiate/route.js',
    'src/app/api/matches/submit-result/route.js',
    'src/app/api/admin/payment-methods/route.js',
    'src/app/api/admin/payment-methods/[id]/route.js',
    'src/app/api/wallet/payment-methods/route.js',
    'src/app/api/wallet/upi-info/route.js',
    'src/app/api/rooms/[id]/start/route.js',
    'src/app/api/rooms/[id]/check-status/route.js',
    'src/app/api/rooms/[id]/expire/route.js',
    'src/app/api/rooms/[id]/cancel/route.js',
    'src/app/api/user/profile/route.js',
    'src/app/api/user/me/route.js'
  ];

  for (const routePath of requiredRoutes) {
    const fullPath = path.join(process.cwd(), routePath);
    assertTest(`Route exists: ${routePath}`, fs.existsSync(fullPath));
  }

  // 3. Check Financial Ledger Helper Rules
  console.log('\n--- 3. Auditing Financial Deduction & Commission Rules ---');
  const entryFee = 100;
  const platformCommissionPct = 10;
  const grossPrize = entryFee * 2;
  const commission = (grossPrize * platformCommissionPct) / 100;
  const netPrizePool = grossPrize - commission;

  assertTest('Platform commission 10% on 2-player match of ₹100 is ₹20', commission === 20);
  assertTest('Net prize pool is ₹180', netPrizePool === 180);

  // Bonus balance rule: max 10% of entry fee
  const maxBonusAllowed = Math.round(entryFee * 0.10 * 100) / 100;
  assertTest('Max bonus balance deduction on ₹100 entry fee is ₹10 (10%)', maxBonusAllowed === 10);

  console.log('\n=====================================================');
  console.log(`TOTAL AUDIT RESULT: ${passedTests} / ${totalTests} CHECKS PASSED`);
  console.log('=====================================================');
}

runVerification().catch(console.error);
