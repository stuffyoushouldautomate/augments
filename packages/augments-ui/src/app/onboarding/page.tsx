'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingFlow } from '@/components/onboarding-flow';

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleOnboardingComplete = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <OnboardingFlow onComplete={handleOnboardingComplete} />
    </div>
  );
}
