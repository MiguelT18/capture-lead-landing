import { MongoClient, Db } from "mongodb";

const uri = import.meta.env.MONGODB_URI;
const dbName = import.meta.env.MONGODB_DB_NAME;

if (!uri || !dbName) {
  throw new Error("Faltan variables de entorno: MONGODB_URI o MONGODB_DB_NAME");
}

// Evita múltiples instancias durante hot reload en desarrollo
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) return cachedDb;

  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }

  cachedDb = cachedClient.db(dbName);
  return cachedDb;
}