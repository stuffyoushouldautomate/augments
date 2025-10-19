import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsageType } from '@prisma/client';

export interface CreateUsageRecordDto {
  type: UsageType;
  amount: number;
  unit: string;
  cost?: number;
  description?: string;
  metadata?: any;
  taskId?: string;
  workspaceId?: string;
}

export interface UsageStats {
  totalTokens: number;
  totalCpuSeconds: number;
  totalMemoryMB: number;
  totalStorageMB: number;
  totalBandwidthMB: number;
  totalCost: number;
  last30Days: {
    tokens: number;
    cpuSeconds: number;
    memoryMB: number;
    storageMB: number;
    bandwidthMB: number;
    cost: number;
  };
  dailyUsage: Array<{
    date: string;
    tokens: number;
    cpuSeconds: number;
    memoryMB: number;
    cost: number;
  }>;
}

@Injectable()
export class UsageTrackingService {
  constructor(private prisma: PrismaService) {}

  async recordUsage(userId: string, createUsageRecordDto: CreateUsageRecordDto): Promise<void> {
    const { type, amount, unit, cost, description, metadata, taskId, workspaceId } = createUsageRecordDto;

    await this.prisma.usageRecord.create({
      data: {
        type,
        amount,
        unit,
        cost,
        description,
        metadata,
        userId,
        taskId,
        workspaceId,
      },
    });
  }

  async getUserUsageStats(userId: string): Promise<UsageStats> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all usage records for the user
    const allUsage = await this.prisma.usageRecord.findMany({
      where: { userId },
    });

    // Get last 30 days usage
    const last30DaysUsage = await this.prisma.usageRecord.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Calculate totals
    const totalTokens = this.sumByType(allUsage, UsageType.AI_TOKENS);
    const totalCpuSeconds = this.sumByType(allUsage, UsageType.SERVER_CPU);
    const totalMemoryMB = this.sumByType(allUsage, UsageType.SERVER_MEMORY);
    const totalStorageMB = this.sumByType(allUsage, UsageType.SERVER_STORAGE);
    const totalBandwidthMB = this.sumByType(allUsage, UsageType.NETWORK_BANDWIDTH);
    const totalCost = allUsage.reduce((sum, record) => sum + (record.cost || 0), 0);

    // Calculate last 30 days totals
    const last30Days = {
      tokens: this.sumByType(last30DaysUsage, UsageType.AI_TOKENS),
      cpuSeconds: this.sumByType(last30DaysUsage, UsageType.SERVER_CPU),
      memoryMB: this.sumByType(last30DaysUsage, UsageType.SERVER_MEMORY),
      storageMB: this.sumByType(last30DaysUsage, UsageType.SERVER_STORAGE),
      bandwidthMB: this.sumByType(last30DaysUsage, UsageType.NETWORK_BANDWIDTH),
      cost: last30DaysUsage.reduce((sum, record) => sum + (record.cost || 0), 0),
    };

    // Get daily usage for the last 30 days
    const dailyUsage = await this.getDailyUsage(userId, thirtyDaysAgo);

    return {
      totalTokens,
      totalCpuSeconds,
      totalMemoryMB,
      totalStorageMB,
      totalBandwidthMB,
      totalCost,
      last30Days,
      dailyUsage,
    };
  }

  async recordAITokenUsage(
    userId: string,
    tokens: number,
    model: string,
    taskId?: string,
    workspaceId?: string,
  ): Promise<void> {
    await this.recordUsage(userId, {
      type: UsageType.AI_TOKENS,
      amount: tokens,
      unit: 'tokens',
      description: `AI tokens used with ${model}`,
      metadata: { model },
      taskId,
      workspaceId,
    });
  }

  async recordServerUsage(
    userId: string,
    cpuSeconds: number,
    memoryMB: number,
    taskId?: string,
    workspaceId?: string,
  ): Promise<void> {
    // Record CPU usage
    if (cpuSeconds > 0) {
      await this.recordUsage(userId, {
        type: UsageType.SERVER_CPU,
        amount: cpuSeconds,
        unit: 'seconds',
        description: 'CPU usage',
        taskId,
        workspaceId,
      });
    }

    // Record memory usage
    if (memoryMB > 0) {
      await this.recordUsage(userId, {
        type: UsageType.SERVER_MEMORY,
        amount: memoryMB,
        unit: 'MB',
        description: 'Memory usage',
        taskId,
        workspaceId,
      });
    }
  }

  async recordNetworkUsage(
    userId: string,
    bandwidthMB: number,
    taskId?: string,
    workspaceId?: string,
  ): Promise<void> {
    if (bandwidthMB > 0) {
      await this.recordUsage(userId, {
        type: UsageType.NETWORK_BANDWIDTH,
        amount: bandwidthMB,
        unit: 'MB',
        description: 'Network bandwidth usage',
        taskId,
        workspaceId,
      });
    }
  }

  private sumByType(records: any[], type: UsageType): number {
    return records
      .filter(record => record.type === type)
      .reduce((sum, record) => sum + record.amount, 0);
  }

  private async getDailyUsage(userId: string, startDate: Date): Promise<Array<{
    date: string;
    tokens: number;
    cpuSeconds: number;
    memoryMB: number;
    cost: number;
  }>> {
    const dailyUsage: Array<{
      date: string;
      tokens: number;
      cpuSeconds: number;
      memoryMB: number;
      cost: number;
    }> = [];
    const currentDate = new Date();

    for (let d = new Date(startDate); d <= currentDate; d.setDate(d.getDate() + 1)) {
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const dayUsage = await this.prisma.usageRecord.findMany({
        where: {
          userId,
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      dailyUsage.push({
        date: d.toISOString().split('T')[0],
        tokens: this.sumByType(dayUsage, UsageType.AI_TOKENS),
        cpuSeconds: this.sumByType(dayUsage, UsageType.SERVER_CPU),
        memoryMB: this.sumByType(dayUsage, UsageType.SERVER_MEMORY),
        cost: dayUsage.reduce((sum, record) => sum + (record.cost || 0), 0),
      });
    }

    return dailyUsage;
  }
}
