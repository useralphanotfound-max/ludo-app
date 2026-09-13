import { GET as getReferralsGET } from '../../user/referrals/route';

export async function GET(req) {
  return getReferralsGET(req);
}
