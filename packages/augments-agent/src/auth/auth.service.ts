import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole, Workspace, WorkspaceStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  workspace?: Workspace;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    const { email, username, password, firstName, lastName } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        role: UserRole.USER,
      },
    });

    // Create default workspace for the user
    const workspace = await this.createDefaultWorkspace(user.id);

    // Generate JWT token
    const token = this.generateToken(user.id);

    // Create user session
    await this.createSession(user.id, token);

    return {
      user: this.sanitizeUser(user),
      token,
      workspace: workspace || undefined,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Get user's workspace
    const workspace = await this.prisma.workspace.findFirst({
      where: { userId: user.id },
    });

    // Generate JWT token
    const token = this.generateToken(user.id);

    // Create user session
    await this.createSession(user.id, token);

    return {
      user: this.sanitizeUser(user),
      token,
      workspace: workspace || undefined,
    };
  }

  async validateToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid token');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async logout(token: string): Promise<void> {
    await this.prisma.userSession.deleteMany({
      where: { sessionToken: token },
    });
  }

  private async createDefaultWorkspace(userId: string): Promise<Workspace> {
    return await this.prisma.workspace.create({
      data: {
        name: 'My Workspace',
        description: 'Default workspace for getting started',
        userId,
        status: WorkspaceStatus.PROVISIONING,
      },
    });
  }

  private generateToken(userId: string): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  private async createSession(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.userSession.create({
      data: {
        userId,
        sessionToken: token,
        expiresAt,
      },
    });
  }

  private sanitizeUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
