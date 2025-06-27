import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const isCloud = process.env.IS_CLOUD === 'true';

export async function hasUsers(): Promise<boolean> {
  if (!auth) return false;
  
  try {
    const userCount = await prisma.user.count();
    return userCount > 0;
  } catch (error) {
    console.error('Error checking user count:', error);
    return false;
  }
}

export const auth = process.env.AUTH_ENABLED === 'true' ? betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    }),
  },
  trustedOrigins: [
    'http://localhost:9992',
    'http://localhost:9991',
  ],
}) : null;

// @ts-ignore
export type Session = typeof auth extends null ? null : typeof auth.$Infer.Session;
// @ts-ignore
export type User = typeof auth extends null ? null : typeof auth.$Infer.Session.user;
