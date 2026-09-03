import mongoose from 'mongoose';
import dns from 'dns';

// Fix querySrv ECONNREFUSED issues caused by local ISP/Windows DNS resolvers blocking SRV lookups
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if setting DNS servers fails in specific restrictive environments
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

async function resolveMongodbSrv(uri) {
  if (!uri.startsWith('mongodb+srv://')) {
    return uri;
  }
  try {
    const urlMatch = uri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)?(.*)$/);
    if (!urlMatch) return uri;

    const [_, user, pass, host, db, query] = urlMatch;
    const resolver = new dns.promises.Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1']);

    const addresses = await resolver.resolveSrv(`_mongodb._tcp.${host}`);
    if (!addresses || addresses.length === 0) return uri;

    const nodeAddresses = addresses.map(addr => `${addr.name}:${addr.port}`).join(',');
    const cleanQuery = query || '';
    const sslOpt = cleanQuery.includes('ssl=') ? '' : '&ssl=true';
    const authSrc = cleanQuery.includes('authSource=') ? '' : '&authSource=admin';
    const retryW = cleanQuery.includes('retryWrites=') ? '' : '&retryWrites=true';

    return `mongodb://${user}:${pass}@${nodeAddresses}/${db || ''}${cleanQuery}${sslOpt}${authSrc}${retryW}`;
  } catch (e) {
    return uri;
  }
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      maxPoolSize: 25,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
    };

    cached.promise = resolveMongodbSrv(MONGODB_URI)
      .then((resolvedUri) => mongoose.connect(resolvedUri, opts))
      .then((mongooseInstance) => {
        console.log(`[MongoDB Atlas] Connected to ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        console.error('[MongoDB Connection Error]', err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
