import mongoose from 'mongoose';
import dns from 'dns';

// Fix querySrv ECONNREFUSED issues caused by local ISP/Windows DNS resolvers blocking SRV lookups
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if setting DNS servers fails in specific restrictive environments
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://royaluseralpha83993:royaluseralphapass83993@ac-kggnzrc-shard-00-00.xmyjibo.mongodb.net:27017,ac-kggnzrc-shard-00-01.xmyjibo.mongodb.net:27017,ac-kggnzrc-shard-00-02.xmyjibo.mongodb.net:27017/royalludo?ssl=true&replicaSet=atlas-kggnzrc-shard-0&authSource=admin&retryWrites=true&w=majority';

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
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
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
