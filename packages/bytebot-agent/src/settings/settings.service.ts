import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { hasUsers, isCloud } from '../auth';

@Injectable()
export class SettingsService {
  private prisma = new PrismaClient();

  async getSetupStatus() {
    if (isCloud) {
      return {
        isCloud: true,
        allowSignup: true,
        requiresSetup: false,
        setupCompleted: true,
      };
    }

    const settings = await this.getApplicationSettings();
    const usersExist = await hasUsers();
    
    return {
      isCloud: false,
      allowSignup: settings?.signupEnabled ?? true,
      requiresSetup: !settings?.setupCompleted && !usersExist,
      setupCompleted: settings?.setupCompleted ?? false,
      requireInvite: settings?.requireInvite ?? false,
    };
  }

  async getApplicationSettings() {
    let settings = await this.prisma.applicationSettings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await this.prisma.applicationSettings.create({
        data: {
          emailPasswordEnabled: true,
          googleOAuthEnabled: false,
          signupEnabled: true,
          requireInvite: false,
          allowedDomains: [],
          applicationName: "Bytebot",
          setupCompleted: false,
        },
      });
    }
    
    return settings;
  }

  async updateApplicationSettings(updateData: any) {
    const settings = await this.getApplicationSettings();
    
    return this.prisma.applicationSettings.update({
      where: { id: settings.id },
      data: updateData,
    });
  }

  async getAuthSettings() {
    const settings = await this.getApplicationSettings();
    
    return {
      emailPasswordEnabled: settings.emailPasswordEnabled,
      googleOAuthEnabled: settings.googleOAuthEnabled,
      hasGoogleCredentials: !!(settings.googleClientId && settings.googleClientSecret),
      signupEnabled: settings.signupEnabled,
      requireInvite: settings.requireInvite,
      allowedDomains: settings.allowedDomains,
    };
  }

  async updateAuthSettings(authSettings: any) {
    const settings = await this.getApplicationSettings();
    
    const updateData: any = {};
    
    if (authSettings.emailPasswordEnabled !== undefined) {
      updateData.emailPasswordEnabled = authSettings.emailPasswordEnabled;
    }
    
    if (authSettings.googleOAuthEnabled !== undefined) {
      updateData.googleOAuthEnabled = authSettings.googleOAuthEnabled;
    }
    
    if (authSettings.googleClientId !== undefined) {
      updateData.googleClientId = authSettings.googleClientId;
    }
    
    if (authSettings.googleClientSecret !== undefined) {
      updateData.googleClientSecret = authSettings.googleClientSecret;
    }
    
    if (authSettings.signupEnabled !== undefined) {
      updateData.signupEnabled = authSettings.signupEnabled;
    }
    
    if (authSettings.requireInvite !== undefined) {
      updateData.requireInvite = authSettings.requireInvite;
    }
    
    if (authSettings.allowedDomains !== undefined) {
      updateData.allowedDomains = authSettings.allowedDomains;
    }
    
    return this.prisma.applicationSettings.update({
      where: { id: settings.id },
      data: updateData,
    });
  }

  async completeInitialSetup(setupData: { masterUserId: string }) {
    const settings = await this.getApplicationSettings();
    
    return this.prisma.applicationSettings.update({
      where: { id: settings.id },
      data: {
        setupCompleted: true,
        masterUserId: setupData.masterUserId,
      },
    });
  }
}