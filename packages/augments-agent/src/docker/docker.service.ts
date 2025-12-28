import { Injectable } from '@nestjs/common';
import * as Docker from 'dockerode';

export interface ContainerStats {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
}

export interface WorkspaceContainerConfig {
  workspaceId: string;
  vncPort: number;
}

@Injectable()
export class DockerService {
  private docker: Docker;

  constructor() {
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
  }

  async createWorkspaceContainer(config: WorkspaceContainerConfig): Promise<string> {
    const { workspaceId, vncPort } = config;

    try {
      const container = await this.docker.createContainer({
        Image: 'augments-desktop:latest', // Use our custom desktop image
        name: `augments-workspace-${workspaceId}`,
        Env: [
          'DISPLAY=:0',
          `VNC_PORT=${vncPort}`,
        ],
        ExposedPorts: {
          [`${vncPort}/tcp`]: {},
        },
        PortBindings: {
          [`${vncPort}/tcp`]: [{ HostPort: vncPort.toString() }],
        },
        HostConfig: {
          Memory: 2 * 1024 * 1024 * 1024, // 2GB RAM limit
          CpuShares: 512, // CPU limit
          RestartPolicy: {
            Name: 'unless-stopped',
          },
        },
        Labels: {
          'augments.workspace': workspaceId,
          'augments.type': 'workspace',
        },
      });

      await container.start();
      
      return container.id;
    } catch (error) {
      console.error('Failed to create workspace container:', error);
      throw new Error(`Failed to create workspace container: ${error.message}`);
    }
  }

  async getContainerStats(containerId: string): Promise<ContainerStats> {
    try {
      const container = this.docker.getContainer(containerId);
      const stats = await container.stats({ stream: false });

      // Parse Docker stats
      const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
      const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
      const cpuUsage = (cpuDelta / systemDelta) * 100;

      const memoryUsage = (stats.memory_stats.usage / stats.memory_stats.limit) * 100;

      const networkStats = stats.networks;
      let networkIn = 0;
      let networkOut = 0;

      for (const networkName in networkStats) {
        const network = networkStats[networkName];
        networkIn += network.rx_bytes;
        networkOut += network.tx_bytes;
      }

      // Convert bytes to MB
      networkIn = networkIn / (1024 * 1024);
      networkOut = networkOut / (1024 * 1024);

      return {
        cpuUsage: Math.round(cpuUsage * 100) / 100,
        memoryUsage: Math.round(memoryUsage * 100) / 100,
        diskUsage: 0, // Docker stats don't include disk usage directly
        networkIn: Math.round(networkIn * 100) / 100,
        networkOut: Math.round(networkOut * 100) / 100,
      };
    } catch (error) {
      console.error('Failed to get container stats:', error);
      return {
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkIn: 0,
        networkOut: 0,
      };
    }
  }

  async stopContainer(containerId: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.stop();
    } catch (error) {
      console.error('Failed to stop container:', error);
      throw new Error(`Failed to stop container: ${error.message}`);
    }
  }

  async removeContainer(containerId: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.remove({ force: true });
    } catch (error) {
      console.error('Failed to remove container:', error);
      throw new Error(`Failed to remove container: ${error.message}`);
    }
  }

  async listWorkspaceContainers(): Promise<any[]> {
    try {
      const containers = await this.docker.listContainers({
        all: true,
        filters: {
          label: ['augments.type=workspace'],
        },
      });

      return containers;
    } catch (error) {
      console.error('Failed to list workspace containers:', error);
      return [];
    }
  }
}
