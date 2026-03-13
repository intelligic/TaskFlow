import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const toBool = (value) => String(value || "").toLowerCase() === "true";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),

  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  MONGO_URI_DIRECT: z.string().optional(),

  JWT_SECRET: z.string().min(10, "JWT_SECRET must be strong"),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  FRONTEND_URL: z.string().url("FRONTEND_URL must be a valid URL").optional(),
  CORS_ORIGIN: z.string().optional(),

  ALLOW_EMPLOYEE_REGISTER: z.preprocess(toBool, z.boolean()).default(false),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1);
}

const env = parsed.data;

if (env.NODE_ENV === "production") {
  const missingEmailConfig = !env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS;
  if (missingEmailConfig) {
    console.warn("SMTP_* variables are missing. Invite emails will fail until SMTP is configured.");
  }

  if (!env.FRONTEND_URL && !env.CORS_ORIGIN) {
    console.warn("FRONTEND_URL (or CORS_ORIGIN) is missing. Configure CORS origins for production.");
  }
}

export default env;
