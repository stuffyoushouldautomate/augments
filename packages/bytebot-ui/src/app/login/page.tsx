"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp, authClient } from "@/lib/auth";
import Image from "next/image";

interface SetupStatus {
  isCloud: boolean;
  allowSignup: boolean;
  requiresSetup: boolean;
}

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchSetupStatus() {
      if (!authClient) {
        setIsLoadingStatus(false);
        return;
      }

      try {
        const response = await fetch('/api/settings/setup');
        const status = await response.json();
        setSetupStatus(status);
        
        // If it's first-time setup, automatically show signup form
        if (status.requiresSetup) {
          setIsSignUp(true);
        }
      } catch (err) {
        console.error('Failed to fetch setup status:', err);
      } finally {
        setIsLoadingStatus(false);
      }
    }

    fetchSetupStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent signup if not allowed (non-cloud and users exist)
    if (isSignUp && setupStatus && !setupStatus.allowSignup) {
      setError("Sign up is not available. Please contact an administrator for an invitation.");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const result = await signUp.email({
          email,
          password,
          name,
        });
        
        if (result.error) {
          setError(result.error.message || "Sign up failed");
        } else {
          // If this is initial setup, mark setup as complete
          if (setupStatus?.requiresSetup) {
            try {
              await fetch('/api/settings/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ masterUserId: result.data?.user?.id }),
              });
            } catch (setupErr) {
              console.error('Failed to complete setup:', setupErr);
            }
          }
          router.push("/");
        }
      } else {
        const result = await signIn.email({
          email,
          password,
        });
        
        if (result.error) {
          setError(result.error.message || "Sign in failed");
        } else {
          router.push("/");
        }
      }
    } catch (authErr) {
      console.error('Auth error:', authErr);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!authClient) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      
      if (result.error) {
        setError(result.error.message || "Google sign in failed");
      }
    } catch (googleErr) {
      console.error('Google auth error:', googleErr);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/bytebot_square_light.svg"
              alt="Bytebot"
              width={64}
              height={64}
              className="h-12 w-12"
            />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const getHeaderText = () => {
    if (setupStatus?.requiresSetup) {
      return "Welcome to Bytebot";
    }
    return isSignUp ? "Create your account" : "Sign in to Bytebot";
  };

  const getSubText = () => {
    if (setupStatus?.requiresSetup) {
      return "Let's get started by creating your administrator account";
    }
    if (isSignUp) {
      return setupStatus?.isCloud 
        ? "Join Bytebot to start automating your tasks"
        : "Create your account to get started";
    }
    return "Welcome back! Please sign in to continue";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/bytebot_square_light.svg"
              alt="Bytebot"
              width={64}
              height={64}
              className="h-12 w-12"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {getHeaderText()}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getSubText()}
          </p>
          {setupStatus?.requiresSetup && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>First-time setup:</strong> This account will have full administrator privileges to manage users and settings.
              </p>
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required={isSignUp}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isLoading}
            >
              {isLoading
                ? "Loading..."
                : isSignUp
                ? setupStatus?.requiresSetup 
                  ? "Create Administrator Account"
                  : "Create Account"
                : "Sign In"}
            </Button>
          </div>

          {authClient && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-50 px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full cursor-pointer"
                  disabled={isLoading}
                  onClick={handleGoogleSignIn}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>
            </>
          )}

          {!setupStatus?.requiresSetup && (setupStatus?.isCloud || setupStatus?.allowSignup) && (
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-gray-500 cursor-pointer"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Need an account? Sign up"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
