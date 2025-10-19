'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Settings, Upload, Save } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UserProfileProps {
  className?: string;
}

export function UserProfile({ className }: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        username: data.username || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    // Convert to base64 for now (in production, upload to cloud storage)
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ profileImage: base64 }),
        });

        if (!response.ok) {
          throw new Error('Failed to update profile image');
        }

        const updatedProfile = await response.json();
        setProfile(updatedProfile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update profile image');
      }
    };
    reader.readAsDataURL(file);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (firstName: string | null, lastName: string | null): string => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
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
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600">
            <p>Failed to load profile</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Image */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.profileImage || undefined} />
            <AvatarFallback className="text-lg">
              {getInitials(profile.firstName, profile.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">
              {profile.firstName && profile.lastName 
                ? `${profile.firstName} ${profile.lastName}`
                : profile.username
              }
            </h3>
            <p className="text-sm text-augments-gray-light-10">{profile.email}</p>
            <Badge variant={profile.isActive ? "default" : "secondary"} className="mt-1">
              {profile.role}
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              {isEditing ? (
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              ) : (
                <p className="text-sm py-2">{profile.firstName || 'Not set'}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              {isEditing ? (
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              ) : (
                <p className="text-sm py-2">{profile.lastName || 'Not set'}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="username">Username</Label>
            {isEditing ? (
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
              />
            ) : (
              <p className="text-sm py-2">{profile.username}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <p className="text-sm py-2">{profile.email}</p>
          </div>
        </div>

        {/* Account Information */}
        <div className="pt-4 border-t border-augments-gray-light-7">
          <h4 className="text-sm font-medium mb-3">Account Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-augments-gray-light-10" />
              <span className="text-augments-gray-light-10">Joined:</span>
              <span>{formatDate(profile.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-augments-gray-light-10" />
              <span className="text-augments-gray-light-10">Last Login:</span>
              <span>{formatDate(profile.lastLoginAt)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={saving}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    firstName: profile.firstName || '',
                    lastName: profile.lastName || '',
                    username: profile.username || '',
                  });
                }}
                size="sm"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
