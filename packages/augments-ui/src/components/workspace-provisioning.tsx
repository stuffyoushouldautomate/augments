'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Monitor, 
  Plus, 
  Play, 
  Square, 
  Trash2, 
  ExternalLink, 
  Clock, 
  HardDrive,
  Cpu,
  MemoryStick,
  Network
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PROVISIONING' | 'ERROR';
  containerId: string | null;
  vncPort: number | null;
  desktopUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date | null;
  cpuUsage: number | null;
  memoryUsage: number | null;
  diskUsage: number | null;
  networkIn: number | null;
  networkOut: number | null;
}

interface CreateWorkspaceDto {
  name: string;
  description?: string;
}

interface WorkspaceProvisioningProps {
  className?: string;
}

export function WorkspaceProvisioning({ className }: WorkspaceProvisioningProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState<CreateWorkspaceDto>({ name: '', description: '' });

  useEffect(() => {
    fetchWorkspaces();
    // Poll for workspace status updates every 10 seconds
    const interval = setInterval(fetchWorkspaces, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/workspaces', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workspaces');
      }

      const data = await response.json();
      setWorkspaces(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workspaces');
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async () => {
    if (!newWorkspace.name.trim()) {
      setError('Workspace name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/workspaces', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWorkspace),
      });

      if (!response.ok) {
        throw new Error('Failed to create workspace');
      }

      setSuccess('Workspace created successfully! It will be ready in a few moments.');
      await fetchWorkspaces();
      
      // Reset form
      setNewWorkspace({ name: '', description: '' });
      setShowCreateDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace');
    } finally {
      setSaving(false);
    }
  };

  const deleteWorkspace = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/auth/workspaces/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete workspace');
      }

      setSuccess('Workspace deleted successfully');
      await fetchWorkspaces();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workspace');
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Never';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: 'default' as const, label: 'Active' },
      INACTIVE: { variant: 'secondary' as const, label: 'Inactive' },
      SUSPENDED: { variant: 'destructive' as const, label: 'Suspended' },
      PROVISIONING: { variant: 'outline' as const, label: 'Provisioning' },
      ERROR: { variant: 'destructive' as const, label: 'Error' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatBytes = (bytes: number | null): string => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatPercentage = (value: number | null): string => {
    if (!value) return '0%';
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Workspaces
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

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Workspaces
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workspace</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="workspaceName">Workspace Name</Label>
                  <Input
                    id="workspaceName"
                    value={newWorkspace.name}
                    onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                    placeholder="Enter workspace name"
                  />
                </div>
                <div>
                  <Label htmlFor="workspaceDescription">Description (Optional)</Label>
                  <Input
                    id="workspaceDescription"
                    value={newWorkspace.description || ''}
                    onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                    placeholder="Enter workspace description"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={createWorkspace} disabled={saving}>
                    {saving ? 'Creating...' : 'Create Workspace'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {workspaces.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No workspaces found</p>
            <p className="text-sm">Create your first workspace to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workspaces.map((workspace) => (
              <div key={workspace.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{workspace.name}</h3>
                    {getStatusBadge(workspace.status)}
                  </div>
                  <div className="flex gap-2">
                    {workspace.desktopUrl && workspace.status === 'ACTIVE' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(workspace.desktopUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Desktop
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteWorkspace(workspace.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {workspace.description && (
                  <p className="text-sm text-gray-600">{workspace.description}</p>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Created:</span>
                    <span>{formatDate(workspace.createdAt)}</span>
                  </div>
                  
                  {workspace.lastAccessedAt && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Last accessed:</span>
                      <span>{formatDate(workspace.lastAccessedAt)}</span>
                    </div>
                  )}
                  
                  {workspace.vncPort && (
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">VNC Port:</span>
                      <span>{workspace.vncPort}</span>
                    </div>
                  )}
                  
                  {workspace.containerId && (
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Container:</span>
                      <span className="font-mono text-xs">{workspace.containerId.slice(0, 8)}...</span>
                    </div>
                  )}
                </div>

                {/* Resource Usage */}
                {(workspace.cpuUsage !== null || workspace.memoryUsage !== null || workspace.diskUsage !== null) && (
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-medium mb-2">Resource Usage</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-600">CPU:</span>
                        <span>{formatPercentage(workspace.cpuUsage)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MemoryStick className="h-4 w-4 text-green-500" />
                        <span className="text-gray-600">Memory:</span>
                        <span>{formatPercentage(workspace.memoryUsage)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-orange-500" />
                        <span className="text-gray-600">Disk:</span>
                        <span>{formatPercentage(workspace.diskUsage)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
