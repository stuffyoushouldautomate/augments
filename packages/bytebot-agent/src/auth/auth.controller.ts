import { Controller, Get } from '@nestjs/common';
import { hasUsers, isCloud } from '../auth';

@Controller('auth')
export class AuthController {
  @Get('setup')
  async getSetupStatus() {
    if (isCloud) {
      return {
        isCloud: true,
        allowSignup: true,
        requiresSetup: false,
      };
    }

    const usersExist = await hasUsers();
    
    return {
      isCloud: false,
      allowSignup: !usersExist,
      requiresSetup: !usersExist,
    };
  }
}