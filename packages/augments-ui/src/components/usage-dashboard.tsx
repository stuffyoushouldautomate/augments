'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Cpu, HardDrive, Wifi, Zap } from 'lucide-react';

interface UsageStats {
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

interface UsageDashboardProps {
  className?: string;
}

export function UsageDashboard({ className }: UsageDashboardProps) {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/usage', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch usage stats');
      }

      const data = await response.json();
      setUsageStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch usage stats');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(0);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    } else if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${bytes} B`;
  };

  const formatTime = (seconds: number): string => {
    if (seconds >= 3600) {
      return `${(seconds / 3600).toFixed(1)}h`;
    } else if (seconds >= 60) {
      return `${(seconds / 60).toFixed(1)}m`;
    }
    return `${seconds.toFixed(0)}s`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-augments-gray-light-9"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600">
            <p>Failed to load usage data</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usageStats) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Usage Dashboard
        </CardTitle>
        <p className="text-sm text-augments-gray-light-10">
          Last 30 days usage statistics
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Tokens */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">AI Tokens</span>
            </div>
            <Badge variant="secondary">
              {formatNumber(usageStats.last30Days.tokens)}
            </Badge>
          </div>
          <Progress 
            value={Math.min((usageStats.last30Days.tokens / 100000) * 100, 100)} 
            className="h-2"
          />
          <p className="text-xs text-augments-gray-light-10">
            Total: {formatNumber(usageStats.totalTokens)} tokens
          </p>
        </div>

        {/* Server Resources */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-augments-gray-light-11">Server Resources</h4>
          
          {/* CPU Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-500" />
                <span className="text-sm">CPU Time</span>
              </div>
              <Badge variant="secondary">
                {formatTime(usageStats.last30Days.cpuSeconds)}
              </Badge>
            </div>
            <Progress 
              value={Math.min((usageStats.last30Days.cpuSeconds / 3600) * 100, 100)} 
              className="h-2"
            />
            <p className="text-xs text-augments-gray-light-10">
              Total: {formatTime(usageStats.totalCpuSeconds)}
            </p>
          </div>

          {/* Memory Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-green-500" />
                <span className="text-sm">Memory</span>
              </div>
              <Badge variant="secondary">
                {formatBytes(usageStats.last30Days.memoryMB * 1024 * 1024)}
              </Badge>
            </div>
            <Progress 
              value={Math.min((usageStats.last30Days.memoryMB / 1024) * 100, 100)} 
              className="h-2"
            />
            <p className="text-xs text-augments-gray-light-10">
              Total: {formatBytes(usageStats.totalMemoryMB * 1024 * 1024)}
            </p>
          </div>

          {/* Network Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Network</span>
              </div>
              <Badge variant="secondary">
                {formatBytes(usageStats.last30Days.bandwidthMB * 1024 * 1024)}
              </Badge>
            </div>
            <Progress 
              value={Math.min((usageStats.last30Days.bandwidthMB / 1024) * 100, 100)} 
              className="h-2"
            />
            <p className="text-xs text-augments-gray-light-10">
              Total: {formatBytes(usageStats.totalBandwidthMB * 1024 * 1024)}
            </p>
          </div>
        </div>

        {/* Cost Summary */}
        {usageStats.last30Days.cost > 0 && (
          <div className="pt-4 border-t border-augments-gray-light-7">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estimated Cost (30 days)</span>
              <Badge variant="outline" className="text-green-600">
                ${usageStats.last30Days.cost.toFixed(2)}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
