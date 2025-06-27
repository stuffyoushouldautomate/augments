"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Settings, Shield, Users } from "lucide-react";

interface AuthSettings {
  emailPasswordEnabled: boolean;
  googleOAuthEnabled: boolean;
  hasGoogleCredentials: boolean;
  googleClientId?: string;
  googleClientSecret?: string;
  signupEnabled: boolean;
  requireInvite: boolean;
  allowedDomains: string[];
}

interface ApplicationSettings {
  applicationName: string;
  setupCompleted: boolean;
  masterUserId?: string;
}

export default function SettingsPage() {
  const [authSettings, setAuthSettings] = useState<AuthSettings | null>(null);
  const [appSettings, setAppSettings] = useState<ApplicationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  // Google OAuth form state
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleClientSecret, setGoogleClientSecret] = useState("");
  const [allowedDomainsText, setAllowedDomainsText] = useState("");

  const fetchSettings = useCallback(async () => {
    try {
      const [authResponse, appResponse] = await Promise.all([
        fetch('/api/settings/auth'),
        fetch('/api/settings')
      ]);

      if (authResponse.ok && appResponse.ok) {
        const authData = await authResponse.json();
        const appData = await appResponse.json();
        
        setAuthSettings(authData);
        setAppSettings(appData);
        setAllowedDomainsText(authData.allowedDomains.join('\n'));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      showMessage("Failed to load settings", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const updateAuthSettings = async (updates: Partial<AuthSettings>) => {
    if (!authSettings) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/settings/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setAuthSettings({ ...authSettings, ...updates });
        showMessage("Settings updated successfully", "success");
      } else {
        showMessage("Failed to update settings", "error");
      }
    } catch (updateError) {
      console.error('Update error:', updateError);
      showMessage("Failed to update settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const saveGoogleOAuth = async () => {
    if (!googleClientId.trim() || !googleClientSecret.trim()) {
      showMessage("Please provide both Client ID and Client Secret", "error");
      return;
    }

    await updateAuthSettings({
      googleClientId,
      googleClientSecret,
      googleOAuthEnabled: true,
    });
    
    setGoogleClientId("");
    setGoogleClientSecret("");
  };

  const saveAllowedDomains = async () => {
    const domains = allowedDomainsText
      .split('\n')
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);

    await updateAuthSettings({ allowedDomains: domains });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Settings className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Application Settings</h1>
        <p className="text-gray-600 mt-2">Manage your application configuration and security settings</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          messageType === "success" 
            ? "bg-green-50 text-green-800 border border-green-200" 
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {messageType === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Authentication Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication Settings
            </CardTitle>
            <CardDescription>
              Configure how users can sign in to your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email/Password Authentication */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email & Password Authentication</Label>
                <p className="text-sm text-gray-600">Allow users to sign in with email and password</p>
              </div>
              <Switch
                checked={authSettings?.emailPasswordEnabled ?? false}
                onCheckedChange={(checked) => updateAuthSettings({ emailPasswordEnabled: checked })}
                disabled={isSaving}
              />
            </div>

            <Separator />

            {/* Google OAuth */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Google OAuth</Label>
                  <p className="text-sm text-gray-600">
                    Allow users to sign in with Google
                    {authSettings?.hasGoogleCredentials && (
                      <Badge variant="outline" className="ml-2">Configured</Badge>
                    )}
                  </p>
                </div>
                <Switch
                  checked={authSettings?.googleOAuthEnabled ?? false}
                  onCheckedChange={(checked) => updateAuthSettings({ googleOAuthEnabled: checked })}
                  disabled={isSaving || !authSettings?.hasGoogleCredentials}
                />
              </div>

              {(!authSettings?.hasGoogleCredentials || !authSettings?.googleOAuthEnabled) && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <h4 className="font-medium">Google OAuth Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="google-client-id">Client ID</Label>
                      <Input
                        id="google-client-id"
                        type="text"
                        value={googleClientId}
                        onChange={(e) => setGoogleClientId(e.target.value)}
                        placeholder="Your Google Client ID"
                      />
                    </div>
                    <div>
                      <Label htmlFor="google-client-secret">Client Secret</Label>
                      <Input
                        id="google-client-secret"
                        type="password"
                        value={googleClientSecret}
                        onChange={(e) => setGoogleClientSecret(e.target.value)}
                        placeholder="Your Google Client Secret"
                      />
                    </div>
                  </div>
                  <Button onClick={saveGoogleOAuth} disabled={isSaving}>
                    Save Google OAuth Settings
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Registration Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Registration
            </CardTitle>
            <CardDescription>
              Control how new users can join your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow User Signup</Label>
                <p className="text-sm text-gray-600">Let new users create accounts</p>
              </div>
              <Switch
                checked={authSettings?.signupEnabled ?? false}
                onCheckedChange={(checked) => updateAuthSettings({ signupEnabled: checked })}
                disabled={isSaving}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Invitations</Label>
                <p className="text-sm text-gray-600">Only allow invited users to sign up</p>
              </div>
              <Switch
                checked={authSettings?.requireInvite ?? false}
                onCheckedChange={(checked) => updateAuthSettings({ requireInvite: checked })}
                disabled={isSaving}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <Label htmlFor="allowed-domains">Allowed Email Domains</Label>
                <p className="text-sm text-gray-600 mb-2">
                  Restrict signups to specific email domains (one per line, leave empty to allow all)
                </p>
                <Textarea
                  id="allowed-domains"
                  value={allowedDomainsText}
                  onChange={(e) => setAllowedDomainsText(e.target.value)}
                  placeholder="example.com&#10;company.org"
                  rows={4}
                />
                <Button 
                  onClick={saveAllowedDomains} 
                  disabled={isSaving}
                  className="mt-2"
                >
                  Save Domain Restrictions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Application Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Application Name</Label>
                <p className="text-lg font-medium">{appSettings?.applicationName}</p>
              </div>
              <div>
                <Label>Setup Status</Label>
                <div className="flex items-center gap-2">
                  {appSettings?.setupCompleted ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Setup Complete
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Setup Pending
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}