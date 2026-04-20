import { betterAuth } from 'better-auth';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { db } from './db';

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET environment variable is not set');
}
if (!process.env.BETTER_AUTH_URL) {
  throw new Error('BETTER_AUTH_URL environment variable is not set');
}

export const auth = betterAuth({
  database: db,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (!ctx.path.startsWith('/sign-in')) return;
      const email = (ctx.body as Record<string, unknown> | undefined)?.email as string | undefined;
      if (!email) return;
      const row = db
        .query<{ deleted_at: string | null }, string[]>(
          `SELECT deleted_at FROM user WHERE email = ? LIMIT 1`,
        )
        .get([email]);
      if (row?.deleted_at) {
        throw new APIError('FORBIDDEN', { message: 'This account has been deleted.' });
      }
    }),
  },
  rateLimit: {
    window: 60,
    max: 100,
    customRules: {
      '/sign-in/email': { window: 10, max: 5 },
      '/sign-up/email': { window: 10, max: 3 },
    },
  },
  plugins: [nextCookies()],
});
