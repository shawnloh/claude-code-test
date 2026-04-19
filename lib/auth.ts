import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is not set");
}
if (!process.env.BETTER_AUTH_URL) {
  throw new Error("BETTER_AUTH_URL environment variable is not set");
}

export const auth = betterAuth({
  database: db,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  rateLimit: {
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 10, max: 5 },
      "/sign-up/email": { window: 10, max: 3 },
    },
  },
  plugins: [nextCookies()],
});
