import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}
const g = global as unknown as { mongoose?: Cached };
const cached: Cached = g.mongoose ?? { conn: null, promise: null };
g.mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 20,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
