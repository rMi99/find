import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { ensureIndexes } from "../lib/db";
import { demoListings } from "../lib/demo";
const path = resolve(".data/mongodb");
await mkdir(path, { recursive: true });
const server = await MongoMemoryServer.create({
  instance: {
    ip: "127.0.0.1",
    port: 27019,
    dbName: "ceylon",
    dbPath: path,
    storageEngine: "wiredTiger",
  },
  binary: { version: "8.2.3" },
});
const client = new MongoClient(server.getUri());
await client.connect();
const database = client.db("ceylon");
await ensureIndexes(database);
for (const listing of demoListings)
  await database
    .collection<{ _id: string }>("listings")
    .updateOne(
      { _id: listing._id },
      { $setOnInsert: listing },
      { upsert: true },
    );
console.log(
  "Local MongoDB is ready at mongodb://127.0.0.1:27019/ceylon. Data persists in .data/mongodb.",
);
console.log(
  "This unauthenticated loopback database is for local development only. Press Ctrl+C to stop.",
);
async function stop() {
  await client.close();
  await server.stop({ doCleanup: false });
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
await new Promise(() => {});
