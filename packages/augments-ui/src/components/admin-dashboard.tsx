'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Monitor, 
  Key, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  Cpu,
  MemoryStick,
  Network
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalWorkspaces: number;
  activeWorkspaces: number;
  totalApiKeys: number;
  activeApiKeys: number;
  totalTasks: number;
  completedTasks: number;
  totalUsage: {
    aiTokens: number;
    cpuSeconds: number;
    memoryMB: number;
    diskGB: number;
    networkMB: number;
  };
}

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  workspacesCount: number;
  apiKeysCount: number;
}

interface Workspace {
  id: string;
  name: string;
  status: string;
  userId: string;
  user: {
    email: string;
    username: string;
  };
  createdAt: Date;
  lastAccessedAt: Date | null;
  cpuUsage: number | null;
  memoryUsage: number | null;
  diskUsage: number | null;
}

interface UsageRecord {
  id: string;
  type: string;
  amount: number;
  unit: string;
  cost: number | null;
  description: string | null;
  createdAt: Date;
  user: {
    email: string;
    username: string;
  };
  workspace: {
    name: string;
  } | null;
}

interface AdminDashboardProps {
  className?: string;
}

export function AdminDashboard({ className }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'workspaces' | 'usage'>('overview');

  useEffect(() => {
    fetchAdminData();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch all admin data in parallel
      const [statsRes, usersRes, workspacesRes, usageRes] = await Promise.all([
        fetch('/api/auth/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/auth/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/auth/admin/workspaces', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/auth/admin/usage', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!statsRes.ok || !usersRes.ok || !workspacesRes.ok || !usageRes.ok) {
        throw new Error('Failed to fetch admin data');
      }

      const [statsData, usersData, workspacesData, usageData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        workspacesRes.json(),
        usageRes.json()
      ]);

      setStats(statsData);
      setUsers(usersData);
      setWorkspaces(workspacesData);
      setUsageRecords(usageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Never';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: 'default' as const, label: 'Active', icon: CheckCircle },
      INACTIVE: { variant: 'secondary' as const, label: 'Inactive', icon: Clock },
      SUSPENDED: { variant: 'destructive' as const, label: 'Suspended', icon: AlertTriangle },
      PROVISIONING: { variant: 'outline' as const, label: 'Provisioning', icon: Clock },
      ERROR: { variant: 'destructive' as const, label: 'Error', icon: AlertTriangle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Admin Dashboard
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
            <Activity className="h-5 w-5" />
            Admin Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Admin Dashboard
        </CardTitle>
        <div className="flex gap-2">
          {(['overview', 'users', 'workspaces', 'usage'] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</p>
                      <p className="text-xs text-green-600">{formatNumber(stats.activeUsers)} active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Workspaces</p>
                      <p className="text-2xl font-bold">{formatNumber(stats.totalWorkspaces)}</p>
                      <p className="text-xs text-green-600">{formatNumber(stats.activeWorkspaces)} active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-600">API Keys</p>
                      <p className="text-2xl font-bold">{formatNumber(stats.totalApiKeys)}</p>
                      <p className="text-xs text-green-600">{formatNumber(stats.activeApiKeys)} active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Tasks</p>
                      <p className="text-2xl font-bold">{formatNumber(stats.totalTasks)}</p>
                      <p className="text-xs text-green-600">{formatNumber(stats.completedTasks)} completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <Cpu className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm text-gray-600">CPU Time</p>
                    <p className="text-lg font-semibold">{formatNumber(stats.totalUsage.cpuSeconds)}s</p>
                  </div>
                  <div className="text-center">
                    <MemoryStick className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm text-gray-600">Memory</p>
                    <p className="text-lg font-semibold">{formatBytes(stats.totalUsage.memoryMB * 1024 * 1024)}</p>
                  </div>
                  <div className="text-center">
                    <HardDrive className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <p className="text-sm text-gray-600">Disk</p>
                    <p className="text-lg font-semibold">{formatBytes(stats.totalUsage.diskGB * 1024 * 1024 * 1024)}</p>
                  </div>
                  <div className="text-center">
                    <Network className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <p className="text-sm text-gray-600">Network</p>
                    <p className="text-lg font-semibold">{formatBytes(stats.totalUsage.networkMB * 1024 * 1024)}</p>
                  </div>
                  <div className="text-center">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <p className="text-sm text-gray-600">AI Tokens</p>
                    <p className="text-lg font-semibold">{formatNumber(stats.totalUsage.aiTokens)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              {users.length} users total
            </div>
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.username
                        }
                      </p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    <div className="text-sm text-gray-600">
                      <p>{user.workspacesCount} workspaces</p>
                      <p>{user.apiKeysCount} API keys</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Joined {formatDate(user.createdAt)}</p>
                      <p>Last login {formatDate(user.lastLoginAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'workspaces' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              {workspaces.length} workspaces total
            </div>
            <div className="space-y-2">
              {workspaces.map((workspace) => (
                <div key={workspace.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{workspace.name}</h3>
                      {getStatusBadge(workspace.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Created {formatDate(workspace.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <p>Owner: {workspace.user.email}</p>
                      <p>Last accessed: {formatDate(workspace.lastAccessedAt)}</p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      {workspace.cpuUsage !== null && (
                        <div className="flex items-center gap-1">
                          <Cpu className="h-4 w-4 text-blue-500" />
                          <span>{workspace.cpuUsage.toFixed(1)}%</span>
                        </div>
                      )}
                      {workspace.memoryUsage !== null && (
                        <div className="flex items-center gap-1">
                          <MemoryStick className="h-4 w-4 text-green-500" />
                          <span>{workspace.memoryUsage.toFixed(1)}%</span>
                        </div>
                      )}
                      {workspace.diskUsage !== null && (
                        <div className="flex items-center gap-1">
                          <HardDrive className="h-4 w-4 text-orange-500" />
                          <span>{workspace.diskUsage.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Recent usage records
            </div>
            <div className="space-y-2">
              {usageRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span className="font-medium">{record.type}</span>
                      <Badge variant="outline">{record.amount} {record.unit}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(record.createdAt)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>User: {record.user.email}</p>
                    {record.workspace && <p>Workspace: {record.workspace.name}</p>}
                    {record.description && <p>Description: {record.description}</p>}
                    {record.cost && <p>Cost: ${record.cost.toFixed(4)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
