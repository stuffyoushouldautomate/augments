import { Injectable } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { organization } from 'better-auth/plugins';

@Injectable()
export class AuthService {
  private prisma = new PrismaClient();
  private authInstance: any = null;

  async getAuth() {
    if (!this.authInstance) {
      await this.initializeAuth();
    }
    return this.authInstance;
  }

  private async initializeAuth() {
    // Get settings from database
    const settings = await this.prisma.applicationSettings.findFirst();
    
    // Use env vars as fallback if database settings don't exist
    const googleClientId = settings?.googleClientId || process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = settings?.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;
    const emailPasswordEnabled = settings?.emailPasswordEnabled ?? true;
    const googleOAuthEnabled = settings?.googleOAuthEnabled ?? false;

    const socialProviders: any = {};
    
    // Only add Google OAuth if enabled and credentials exist
    if (googleOAuthEnabled && googleClientId && googleClientSecret) {
      socialProviders.google = {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      };
    }

    this.authInstance = betterAuth({
      database: prismaAdapter(this.prisma, {
        provider: 'postgresql',
      }),
      emailAndPassword: {
        enabled: emailPasswordEnabled,
      },
      socialProviders,
      trustedOrigins: [
        'http://localhost:9992',
        'http://localhost:9991',
      ],
      plugins: [
        organization({
          allowUserToCreateOrganization: true,
          organizationLimit: 1, // For single-tenant setup
        }),
      ],
    });
  }

  async refreshAuth() {
    this.authInstance = null;
    return this.getAuth();
  }
}