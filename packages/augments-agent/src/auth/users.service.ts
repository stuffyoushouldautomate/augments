import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async updateUserProfile(userId: string, updateUserDto: UpdateUserDto): Promise<UserProfile> {
    const { firstName, lastName, profileImage } = updateUserDto;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        profileImage,
      },
    });

    return this.sanitizeUser(user);
  }

  async getAllUsers(): Promise<UserProfile[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => this.sanitizeUser(user));
  }

  async updateUserRole(userId: string, role: UserRole): Promise<UserProfile> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return this.sanitizeUser(user);
  }

  async deactivateUser(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  async activateUser(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    adminUsers: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, activeUsers, newUsersThisMonth, adminUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      adminUsers,
    };
  }

  private sanitizeUser(user: User): UserProfile {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
