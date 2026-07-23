export function getClientIp(req) {
  let ip = '127.0.0.1';
  if (req.headers && typeof req.headers.get === 'function') {
    ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  } else if (req.headers) {
    ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '127.0.0.1';
  }

  if (typeof ip === 'string' && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  if (typeof ip === 'string' && ip.includes('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
    return '127.0.0.1 (Localhost)';
  }
  return ip;
}
