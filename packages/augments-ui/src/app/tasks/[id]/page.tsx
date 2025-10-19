'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnalysisView } from '@/components/analysis-view';
import { CompletionTimer } from '@/components/completion-timer';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface TaskPageProps {
  params: {
    id: string;
  };
}

export default function TaskPage({ params }: TaskPageProps) {
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTask();
  }, [params.id]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch task');
      }
      const data = await response.json();
      setTask(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (feedback: string) => {
    try {
      const response = await fetch(`/api/tasks/${params.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  };

  const handleTaskClose = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading task...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Task not found'}</AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/')} className="w-full mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold">Task Analysis</h1>
            <p className="text-gray-600">Monitor your AI agent's progress</p>
          </div>
          
          <div className="w-24" /> {/* Spacer for centering */}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Analysis View - Takes up 2/3 of the space */}
          <div className="lg:col-span-2">
            <AnalysisView taskId={params.id} />
          </div>
          
          {/* Completion Timer - Takes up 1/3 of the space */}
          <div className="lg:col-span-1">
            {task.completionTimerStartedAt && (
              <CompletionTimer
                taskId={params.id}
                completionTimerStartedAt={task.completionTimerStartedAt}
                completionTimerDuration={task.completionTimerDuration}
                onFeedbackSubmit={handleFeedbackSubmit}
                onTaskClose={handleTaskClose}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}