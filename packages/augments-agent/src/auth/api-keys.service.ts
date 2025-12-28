import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiKey, User } from '@prisma/client';
import * as crypto from 'crypto';

export interface CreateApiKeyDto {
  name: string;
  expiresAt?: Date;
}

export interface ApiKeyResponse {
  id: string;
  name: string;
  keyPrefix: string;
  fullKey: string; // Only returned on creation
  isActive: boolean;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  async createApiKey(userId: string, createApiKeyDto: CreateApiKeyDto): Promise<ApiKeyResponse> {
    const { name, expiresAt } = createApiKeyDto;

    // Generate API key
    const fullKey = this.generateApiKey();
    const keyHash = await this.hashApiKey(fullKey);
    const keyPrefix = fullKey.substring(0, 8);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        name,
        keyHash,
        keyPrefix,
        userId,
        expiresAt,
      },
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      fullKey, // Only returned on creation
      isActive: apiKey.isActive,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
    };
  }

  async getUserApiKeys(userId: string): Promise<Omit<ApiKeyResponse, 'fullKey'>[]> {
    const apiKeys = await this.prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      isActive: key.isActive,
      lastUsedAt: key.lastUsedAt,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
    }));
  }

  async revokeApiKey(userId: string, apiKeyId: string): Promise<void> {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id: apiKeyId, userId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { isActive: false },
    });
  }

  async validateApiKey(apiKey: string): Promise<User> {
    const keyHash = await this.hashApiKey(apiKey);
    
    const apiKeyRecord = await this.prisma.apiKey.findFirst({
      where: {
        keyHash,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: { user: true },
    });

    if (!apiKeyRecord) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Update last used timestamp
    await this.prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    });

    return apiKeyRecord.user;
  }

  private generateApiKey(): string {
    // Generate a secure random API key
    const randomBytes = crypto.randomBytes(32);
    return `aug_${randomBytes.toString('hex')}`;
  }

  private async hashApiKey(apiKey: string): Promise<string> {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }
}
