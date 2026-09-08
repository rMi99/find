import { loadEnvConfig } from "@next/env";
import { MongoClient } from "mongodb";
import { ensureIndexes } from "../lib/db";
loadEnvConfig(process.cwd());
if (!process.env.MONGODB_URI)
  throw new Error("Set MONGODB_URI in .env.local before continuing.");
const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const database = client.db(process.env.MONGODB_DB || "ceylon");
  await ensureIndexes(database);
  const args = process.argv.slice(2).filter((v) => v !== "--");
  if (args[0] === "--admin") {
    const email = args[1]?.trim().toLowerCase();
    if (!email)
      throw new Error("Usage: bun run db:admin -- person@example.com");
    const result = await database
      .collection("users")
      .updateOne({ email }, { $set: { role: "admin" } });
    if (!result.matchedCount)
      throw new Error("Create the account through /register first.");
    console.log("Existing account promoted to admin.");
  } else console.log("MongoDB indexes are ready.");
} finally {
  await client.close();
}
