import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Workspace, WorkspaceStatus, User } from '@prisma/client';
import { DockerService } from '../docker/docker.service';

export interface CreateWorkspaceDto {
  name: string;
  description?: string;
}

export interface WorkspaceStats {
  id: string;
  name: string;
  status: WorkspaceStatus;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  lastAccessedAt: Date | null;
  createdAt: Date;
}

@Injectable()
export class WorkspacesService {
  constructor(
    private prisma: PrismaService,
    private dockerService: DockerService,
  ) {}

  async createWorkspace(userId: string, createWorkspaceDto: CreateWorkspaceDto): Promise<Workspace> {
    const { name, description } = createWorkspaceDto;

    // Check if user already has a workspace
    const existingWorkspace = await this.prisma.workspace.findFirst({
      where: { userId },
    });

    if (existingWorkspace) {
      throw new BadRequestException('User already has a workspace');
    }

    // Create workspace in database
    const workspace = await this.prisma.workspace.create({
      data: {
        name,
        description,
        userId,
        status: WorkspaceStatus.PROVISIONING,
      },
    });

    // Provision Docker container asynchronously
    this.provisionWorkspaceContainer(workspace.id).catch(error => {
      console.error(`Failed to provision workspace ${workspace.id}:`, error);
      this.updateWorkspaceStatus(workspace.id, WorkspaceStatus.ERROR);
    });

    return workspace;
  }

  async getUserWorkspace(userId: string): Promise<Workspace | null> {
    return await this.prisma.workspace.findFirst({
      where: { userId },
    });
  }

  async getWorkspaceStats(workspaceId: string): Promise<WorkspaceStats | null> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return null;
    }

    // Get real-time stats from Docker if container is running
    let stats = {
      cpuUsage: workspace.cpuUsage || 0,
      memoryUsage: workspace.memoryUsage || 0,
      diskUsage: workspace.diskUsage || 0,
      networkIn: workspace.networkIn || 0,
      networkOut: workspace.networkOut || 0,
    };

    if (workspace.containerId && workspace.status === WorkspaceStatus.ACTIVE) {
      try {
        const dockerStats = await this.dockerService.getContainerStats(workspace.containerId);
        stats = {
          cpuUsage: dockerStats.cpuUsage,
          memoryUsage: dockerStats.memoryUsage,
          diskUsage: dockerStats.diskUsage,
          networkIn: dockerStats.networkIn,
          networkOut: dockerStats.networkOut,
        };

        // Update database with latest stats
        await this.prisma.workspace.update({
          where: { id: workspaceId },
          data: stats,
        });
      } catch (error) {
        console.error(`Failed to get stats for workspace ${workspaceId}:`, error);
      }
    }

    return {
      id: workspace.id,
      name: workspace.name,
      status: workspace.status,
      ...stats,
      lastAccessedAt: workspace.lastAccessedAt,
      createdAt: workspace.createdAt,
    };
  }

  async getAllWorkspacesStats(): Promise<WorkspaceStats[]> {
    const workspaces = await this.prisma.workspace.findMany({
      include: { user: true },
    });

    const statsPromises = workspaces.map(workspace => this.getWorkspaceStats(workspace.id));
    const results = await Promise.all(statsPromises);
    return results.filter((stats): stats is WorkspaceStats => stats !== null);
  }

  async updateWorkspaceStatus(workspaceId: string, status: WorkspaceStatus): Promise<void> {
    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { status },
    });
  }

  async updateLastAccessed(workspaceId: string): Promise<void> {
    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { lastAccessedAt: new Date() },
    });
  }

  private async provisionWorkspaceContainer(workspaceId: string): Promise<void> {
    try {
      // Generate unique port for VNC
      const vncPort = await this.getAvailablePort();
      
      // Create Docker container
      const containerId = await this.dockerService.createWorkspaceContainer({
        workspaceId,
        vncPort,
      });

      // Update workspace with container details
      await this.prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          containerId,
          vncPort,
          desktopUrl: `http://localhost:${vncPort}`,
          status: WorkspaceStatus.ACTIVE,
        },
      });

      console.log(`Workspace ${workspaceId} provisioned successfully`);
    } catch (error) {
      console.error(`Failed to provision workspace ${workspaceId}:`, error);
      await this.updateWorkspaceStatus(workspaceId, WorkspaceStatus.ERROR);
      throw error;
    }
  }

  private async getAvailablePort(): Promise<number> {
    // Simple port allocation - in production, use a proper port manager
    const basePort = 10000;
    const maxPort = 20000;
    
    for (let port = basePort; port < maxPort; port++) {
      const existing = await this.prisma.workspace.findFirst({
        where: { vncPort: port },
      });
      
      if (!existing) {
        return port;
      }
    }
    
    throw new Error('No available ports');
  }
}
