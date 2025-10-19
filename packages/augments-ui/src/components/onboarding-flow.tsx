'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Mail, 
  Key, 
  Monitor, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Shield,
  Zap,
  Users
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

interface OnboardingFlowProps {
  onComplete?: () => void;
  className?: string;
}

export function OnboardingFlow({ onComplete, className }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptTerms: false,
  });

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Augments!',
      description: 'Let\'s get you set up in just a few steps',
      icon: <Sparkles className="h-6 w-6" />,
      component: (
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Welcome to Augments</h2>
            <p className="text-gray-600">
              Your AI-powered desktop agent platform. We'll help you get started in just a few minutes.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="font-medium">Secure</p>
              <p className="text-gray-600">Your data is protected</p>
            </div>
            <div className="text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="font-medium">Fast</p>
              <p className="text-gray-600">AI-powered automation</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="font-medium">Collaborative</p>
              <p className="text-gray-600">Team workspaces</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'account',
      title: 'Create Your Account',
      description: 'Set up your personal account',
      icon: <User className="h-6 w-6" />,
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Enter your last name"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email address"
            />
          </div>
          
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Choose a username"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a password"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={formData.acceptTerms}
              onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="acceptTerms" className="text-sm">
              I agree to the Terms of Service and Privacy Policy
            </Label>
          </div>
        </div>
      ),
    },
    {
      id: 'workspace',
      title: 'Set Up Your Workspace',
      description: 'Create your first workspace',
      icon: <Monitor className="h-6 w-6" />,
      component: (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Your Personal Workspace</h3>
            <p className="text-gray-600">
              A workspace is your personal desktop environment where AI agents can help you complete tasks.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">What you'll get:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your own Linux desktop environment</li>
              <li>• Pre-installed applications (Chrome, VS Code, etc.)</li>
              <li>• Secure, isolated environment</li>
              <li>• AI agent access to help with tasks</li>
            </ul>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Your workspace will be created automatically after account setup.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'api-keys',
      title: 'API Keys',
      description: 'Generate your first API key',
      icon: <Key className="h-6 w-6" />,
      component: (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">API Keys</h3>
            <p className="text-gray-600">
              API keys allow you to integrate Augments with other applications and services.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Your first API key will:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Allow programmatic access to your workspace</li>
              <li>• Enable integration with external tools</li>
              <li>• Track usage and billing</li>
              <li>• Be securely generated and stored</li>
            </ul>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              You can create additional API keys anytime from your dashboard.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Welcome to Augments',
      icon: <CheckCircle className="h-6 w-6" />,
      component: (
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Welcome to Augments!</h2>
            <p className="text-gray-600">
              Your account has been created and your workspace is being set up.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">What's next?</h4>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Your workspace will be ready in a few minutes</li>
              <li>• Check your email for account confirmation</li>
              <li>• Start creating tasks with our AI agents</li>
              <li>• Explore the dashboard to manage your account</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // Complete onboarding
      setIsLoading(true);
      try {
        await completeOnboarding();
        if (onComplete) {
          onComplete();
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to complete setup');
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    // Validate form data
    if (!formData.email || !formData.username || !formData.password) {
      throw new Error('Please fill in all required fields');
    }
    
    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    if (!formData.acceptTerms) {
      throw new Error('Please accept the terms and conditions');
    }

    // Register user
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create account');
    }

    const { access_token } = await response.json();
    localStorage.setItem('authToken', access_token);

    // Create default workspace
    await fetch('/api/auth/workspaces', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${formData.firstName || formData.username}'s Workspace`,
        description: 'My personal workspace',
      }),
    });

    // Create default API key
    await fetch('/api/auth/api-keys', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Default API Key',
      }),
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Welcome
        return true;
      case 1: // Account
        return formData.email && formData.username && formData.password && 
               formData.password === formData.confirmPassword && formData.acceptTerms;
      case 2: // Workspace
        return true;
      case 3: // API Keys
        return true;
      case 4: // Complete
        return true;
      default:
        return false;
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className={className}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            {currentStepData.icon}
            <div>
              <CardTitle>{currentStepData.title}</CardTitle>
              <p className="text-sm text-gray-600">{currentStepData.description}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {currentStepData.component}
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
            >
              {isLoading ? (
                'Setting up...'
              ) : currentStep === steps.length - 1 ? (
                'Complete Setup'
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
