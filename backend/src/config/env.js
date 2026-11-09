import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config(); // Current working directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") }); // backend/.env
dotenv.config({ path: path.resolve(__dirname, "../../../.env") }); // root .env

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/iiit_mess_db"),
  CLIENT_URL: z.string().min(1).default("http://localhost:5173"),
  ACCESS_TOKEN_SECRET: z.string().min(32, "ACCESS_TOKEN_SECRET must be at least 32 characters").default("iiit_mess_portal_secure_access_token_secret_key_2026_dev"),
  REFRESH_TOKEN_SECRET: z.string().min(32, "REFRESH_TOKEN_SECRET must be at least 32 characters").default("iiit_mess_portal_secure_refresh_token_secret_key_2026_dev"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),
  COOKIE_DOMAIN: z.string().optional().default(""),
  ALLOWED_STUDENT_EMAIL_DOMAIN: z.string().default("iiit-bh.ac.in"),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASSWORD: z.string().optional().default(""),
  PAYMENT_PROVIDER: z.string().default("mock")
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => i.path.join(".") + ": " + i.message).join("\n");
  console.error("Invalid environment configuration:\n" + issues);
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
export const allowedOrigins = env.CLIENT_URL.split(",").map((o) => o.trim()).filter(Boolean);