'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

interface CreateApiKeyDto {
  name: string;
  expiresAt?: Date;
}

interface ApiKeyManagementProps {
  className?: string;
}

export function ApiKeyManagement({ className }: ApiKeyManagementProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKey, setNewKey] = useState<CreateApiKeyDto>({ name: '' });
  const [newKeyRaw, setNewKeyRaw] = useState<string | null>(null);
  const [showRawKey, setShowRawKey] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/api-keys', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }

      const data = await response.json();
      setApiKeys(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKey.name.trim()) {
      setError('API key name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/api-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newKey),
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const data = await response.json();
      setNewKeyRaw(data.rawKey);
      setShowRawKey(true);
      setSuccess('API key created successfully! Make sure to copy it now - you won\'t be able to see it again.');
      
      // Refresh the list
      await fetchApiKeys();
      
      // Reset form
      setNewKey({ name: '' });
      setShowCreateDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setSaving(false);
    }
  };

  const deactivateApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this API key?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/auth/api-keys/${id}/deactivate`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate API key');
      }

      setSuccess('API key deactivated successfully');
      await fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate API key');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Copied to clipboard!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Never';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const isExpired = (expiresAt: Date | null): boolean => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getStatusBadge = (apiKey: ApiKey) => {
    if (!apiKey.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (isExpired(apiKey.expiresAt)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
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
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    value={newKey.name}
                    onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                    placeholder="Enter a descriptive name for this key"
                  />
                </div>
                <div>
                  <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={newKey.expiresAt ? new Date(newKey.expiresAt).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setNewKey({ 
                      ...newKey, 
                      expiresAt: e.target.value ? new Date(e.target.value) : undefined 
                    })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={createApiKey} disabled={saving}>
                    {saving ? 'Creating...' : 'Create Key'}
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

        {newKeyRaw && showRawKey && (
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Your new API key:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono break-all">
                    {newKeyRaw}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(newKeyRaw)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowRawKey(false)}
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-red-600">
                  ⚠️ Save this key now - you won't be able to see it again!
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {apiKeys.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No API keys found</p>
            <p className="text-sm">Create your first API key to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{apiKey.name}</h3>
                    {getStatusBadge(apiKey)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`${apiKey.keyPrefix}...`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {apiKey.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deactivateApiKey(apiKey.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    <code className="font-mono">{apiKey.keyPrefix}...</code>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created {formatDate(apiKey.createdAt)}</span>
                  </div>
                  
                  {apiKey.lastUsedAt && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Last used {formatDate(apiKey.lastUsedAt)}</span>
                    </div>
                  )}
                  
                  {apiKey.expiresAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className={isExpired(apiKey.expiresAt) ? 'text-red-600' : ''}>
                        Expires {formatDate(apiKey.expiresAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
