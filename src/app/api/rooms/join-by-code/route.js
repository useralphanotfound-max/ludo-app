import { POST as joinRoomPOST } from '../join/route';

export async function POST(req) {
  return joinRoomPOST(req);
}
