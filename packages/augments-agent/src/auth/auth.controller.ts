import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthService, CreateUserDto, LoginDto } from './auth.service';
import { UsersService, UpdateUserDto } from './users.service';
import { ApiKeysService, CreateApiKeyDto } from './api-keys.service';
import { WorkspacesService, CreateWorkspaceDto } from './workspaces.service';
import { UsageTrackingService } from './usage-tracking.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './admin.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private apiKeysService: ApiKeysService,
    private workspacesService: WorkspacesService,
    private usageTrackingService: UsageTrackingService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    await this.authService.logout(req.headers.authorization?.replace('Bearer ', ''));
    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return await this.usersService.getUserProfile(req.user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.updateUserProfile(req.user.id, updateUserDto);
  }

  @Get('workspace')
  @UseGuards(JwtAuthGuard)
  async getWorkspace(@Request() req) {
    return await this.workspacesService.getUserWorkspace(req.user.id);
  }

  @Post('workspace')
  @UseGuards(JwtAuthGuard)
  async createWorkspace(@Request() req, @Body() createWorkspaceDto: CreateWorkspaceDto) {
    return await this.workspacesService.createWorkspace(req.user.id, createWorkspaceDto);
  }

  @Get('workspace/stats')
  @UseGuards(JwtAuthGuard)
  async getWorkspaceStats(@Request() req) {
    const workspace = await this.workspacesService.getUserWorkspace(req.user.id);
    if (!workspace) {
      return null;
    }
    return await this.workspacesService.getWorkspaceStats(workspace.id);
  }

  @Get('api-keys')
  @UseGuards(JwtAuthGuard)
  async getApiKeys(@Request() req) {
    return await this.apiKeysService.getUserApiKeys(req.user.id);
  }

  @Post('api-keys')
  @UseGuards(JwtAuthGuard)
  async createApiKey(@Request() req, @Body() createApiKeyDto: CreateApiKeyDto) {
    return await this.apiKeysService.createApiKey(req.user.id, createApiKeyDto);
  }

  @Delete('api-keys/:id')
  @UseGuards(JwtAuthGuard)
  async revokeApiKey(@Request() req, @Param('id') apiKeyId: string) {
    await this.apiKeysService.revokeApiKey(req.user.id, apiKeyId);
    return { message: 'API key revoked successfully' };
  }

  // Admin endpoints
  @Get('admin/users')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAdminStats() {
    const [userStats, workspaceStats] = await Promise.all([
      this.usersService.getUserStats(),
      this.workspacesService.getAllWorkspacesStats(),
    ]);

    return {
      users: userStats,
      workspaces: workspaceStats,
    };
  }

  @Put('admin/users/:id/role')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateUserRole(@Param('id') userId: string, @Body() body: { role: string }) {
    return await this.usersService.updateUserRole(userId, body.role as any);
  }

  @Put('admin/users/:id/deactivate')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deactivateUser(@Param('id') userId: string) {
    await this.usersService.deactivateUser(userId);
    return { message: 'User deactivated successfully' };
  }

  @Put('admin/users/:id/activate')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async activateUser(@Param('id') userId: string) {
    await this.usersService.activateUser(userId);
    return { message: 'User activated successfully' };
  }

  // Usage tracking endpoints
  @Get('usage')
  @UseGuards(JwtAuthGuard)
  async getUserUsage(@Request() req) {
    return await this.usageTrackingService.getUserUsageStats(req.user.id);
  }

  @Get('usage/daily')
  @UseGuards(JwtAuthGuard)
  async getDailyUsage(@Request() req) {
    const stats = await this.usageTrackingService.getUserUsageStats(req.user.id);
    return stats.dailyUsage;
  }
}
