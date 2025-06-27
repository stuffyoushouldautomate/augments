import { Controller, Get, Post, Body, Put } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('setup')
  async getSetupStatus() {
    return this.settingsService.getSetupStatus();
  }

  @Post('setup')
  async completeSetup(@Body() setupData: any) {
    return this.settingsService.completeInitialSetup(setupData);
  }

  @Get()
  async getSettings() {
    return this.settingsService.getApplicationSettings();
  }

  @Put()
  async updateSettings(@Body() settings: any) {
    return this.settingsService.updateApplicationSettings(settings);
  }

  @Get('auth')
  async getAuthSettings() {
    return this.settingsService.getAuthSettings();
  }

  @Put('auth')
  async updateAuthSettings(@Body() authSettings: any) {
    return this.settingsService.updateAuthSettings(authSettings);
  }
}