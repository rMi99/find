import { MongoClient, type Db } from "mongodb";
let connection: Promise<Db> | undefined;
export const configured = () => Boolean(process.env.MONGODB_URI);
export async function db(): Promise<Db> {
  if (!process.env.MONGODB_URI) throw new Error("DATABASE_UNAVAILABLE");
  if (!connection)
    connection = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 15,
      serverSelectionTimeoutMS: 5000,
    })
      .connect()
      .then((c) => c.db(process.env.MONGODB_DB || "ceylon"))
      .catch((e) => {
        connection = undefined;
        throw e;
      });
  return connection;
}
export async function ensureIndexes(database: Db) {
  await Promise.all([
    database.collection("users").createIndex({ email: 1 }, { unique: true }),
    database
      .collection("users")
      .createIndex({ googleSub: 1 }, { unique: true, sparse: true }),
    database
      .collection("sessions")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database.collection("listings").createIndex({ slug: 1 }, { unique: true }),
    database
      .collection("listings")
      .createIndex({ status: 1, city: 1, category: 1, purpose: 1, price: 1 }),
    database.collection("listings").createIndex({
      status: 1,
      province: 1,
      district: 1,
      available: 1,
      createdAt: -1,
    }),
    database
      .collection("listings")
      .createIndex({
        status: 1,
        category: 1,
        "boarding.audience": 1,
        city: 1,
        "boarding.capacity": 1,
        "boarding.vacancies": 1,
      }),
    database.collection("listings").createIndex({ ownerId: 1, updatedAt: -1 }),
    database
      .collection("listings")
      .createIndex({ title: "text", description: "text", city: "text" }),
    database
      .collection("favorites")
      .createIndex({ userId: 1, listingId: 1 }, { unique: true }),
    database
      .collection("verificationTokens")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database
      .collection("rateLimits")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database
      .collection("images")
      .createIndex({ digest: 1, uploadSession: 1 }, { unique: true }),
    database.collection("inquiries").createIndex({ ownerId: 1, createdAt: -1 }),
    database.collection("reports").createIndex({ status: 1, createdAt: -1 }),
    database
      .collection("notifications")
      .createIndex({ userId: 1, createdAt: -1 }),
  ]);
}
