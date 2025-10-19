import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { ApiKeysService } from './api-keys.service';
import { WorkspacesService } from './workspaces.service';
import { UsageTrackingService } from './usage-tracking.service';
import { DockerService } from '../docker/docker.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, UsersService, ApiKeysService, WorkspacesService, UsageTrackingService, DockerService],
  exports: [AuthService, UsersService, ApiKeysService, WorkspacesService, UsageTrackingService],
})
export class AuthModule {}
