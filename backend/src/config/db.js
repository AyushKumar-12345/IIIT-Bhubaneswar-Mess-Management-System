import mongoose from "mongoose";
import { env, isProduction } from "./env.js";

let memoryServer = null;

export async function connectDB() {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
      autoIndex: !isProduction
    });
    const { host, name } = mongoose.connection;
    console.log("[db] connected to " + host + "/" + name);
  } catch (err) {
    if (!isProduction) {
      console.warn(`[db] Could not connect to MongoDB at ${env.MONGODB_URI} (${err.message}). Starting in-memory MongoDB fallback...`);
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      await mongoose.connect(uri, { autoIndex: true });
      const { host, name } = mongoose.connection;
      console.log(`[db] in-memory MongoDB connected at ${host}/${name}`);
    } else {
      throw err;
    }
  }

  mongoose.connection.on("error", (e) => console.error("[db] connection error", e));
  mongoose.connection.on("disconnected", () => console.warn("[db] disconnected"));
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log("[db] disconnected cleanly");
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
    console.log("[db] in-memory MongoDB stopped cleanly");
  }
}
