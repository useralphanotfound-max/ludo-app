import requestIp from 'request-ip';

export const getClientIp = (req) => {
  let ip = requestIp.getClientIp(req);
  if (!ip) {
    ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  }
  // Clean IPv6 mapped IPv4 address formats like ::ffff:127.0.0.1
  if (typeof ip === 'string' && ip.includes('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
    return '127.0.0.1 (Localhost)';
  }
  return ip;
};
