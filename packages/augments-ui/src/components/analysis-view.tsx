'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Play, 
  Pause, 
  RotateCcw,
  Eye,
  EyeOff,
  Terminal,
  Monitor,
  Activity
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TaskStep {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  order: number;
  startedAt: Date | null;
  completedAt: Date | null;
  error: string | null;
  result: any;
}

interface Task {
  id: string;
  description: string;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
  steps: TaskStep[];
  completionTimerStartedAt: Date | null;
  completionTimerDuration: number | null;
}

interface AnalysisViewProps {
  taskId: string;
  className?: string;
}

export function AnalysisView({ taskId, className }: AnalysisViewProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDesktop, setShowDesktop] = useState(false);
  const [completionTimer, setCompletionTimer] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    fetchTask();
    // Poll for task updates every 2 seconds
    const interval = setInterval(fetchTask, 2000);
    return () => clearInterval(interval);
  }, [taskId]);

  useEffect(() => {
    if (task?.completionTimerStartedAt && task.completionTimerDuration) {
      const startTime = new Date(task.completionTimerStartedAt).getTime();
      const duration = task.completionTimerDuration * 1000; // Convert to milliseconds
      const endTime = startTime + duration;
      
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        
        if (remaining > 0) {
          setCompletionTimer(remaining);
          setIsTimerActive(true);
        } else {
          setCompletionTimer(0);
          setIsTimerActive(false);
        }
      };
      
      updateTimer();
      const timerInterval = setInterval(updateTimer, 1000);
      return () => clearInterval(timerInterval);
    }
  }, [task?.completionTimerStartedAt, task?.completionTimerDuration]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
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

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'IN_PROGRESS':
        return <Activity className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'FAILED':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'SKIPPED':
        return <RotateCcw className="h-5 w-5 text-gray-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary' as const, label: 'Pending' },
      IN_PROGRESS: { variant: 'default' as const, label: 'In Progress' },
      COMPLETED: { variant: 'default' as const, label: 'Completed' },
      FAILED: { variant: 'destructive' as const, label: 'Failed' },
      SKIPPED: { variant: 'outline' as const, label: 'Skipped' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getOverallProgress = () => {
    if (!task?.steps.length) return 0;
    const completedSteps = task.steps.filter(step => step.status === 'COMPLETED').length;
    return (completedSteps / task.steps.length) * 100;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Analysis View
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

  if (error || !task) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Analysis View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error || 'Task not found'}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const progress = getOverallProgress();
  const isTaskCompleted = task.status === 'COMPLETED';

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Analysis View
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={showDesktop ? "default" : "outline"}
              onClick={() => setShowDesktop(!showDesktop)}
            >
              {showDesktop ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showDesktop ? 'Hide Desktop' : 'Show Desktop'}
            </Button>
          </div>
        </div>
        
        {/* Task Overview */}
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">{task.description}</h3>
            <p className="text-sm text-gray-600">
              Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Completion Timer */}
        {isTaskCompleted && completionTimer !== null && (
          <Alert className={isTimerActive ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}>
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">
                    {isTimerActive ? 'Task completed! Timer running...' : 'Timer expired'}
                  </span>
                </div>
                <div className="text-lg font-mono font-bold">
                  {formatDuration(completionTimer)}
                </div>
              </div>
              <p className="text-sm mt-1">
                {isTimerActive 
                  ? 'Provide feedback before the timer expires to keep the task open.'
                  : 'Task will be closed automatically. Refresh to return to home.'
                }
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Desktop View Toggle */}
        {showDesktop && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Monitor className="h-4 w-4" />
              <span className="font-medium">Desktop View</span>
            </div>
            <div className="text-sm text-gray-600">
              Desktop view would be embedded here showing the actual desktop environment
            </div>
          </div>
        )}

        {/* Task Steps */}
        <div className="space-y-3">
          <h4 className="font-medium">Task Steps</h4>
          {task.steps.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No steps available yet</p>
              <p className="text-sm">Steps will appear as the task progresses</p>
            </div>
          ) : (
            <div className="space-y-2">
              {task.steps
                .sort((a, b) => a.order - b.order)
                .map((step) => (
                  <div key={step.id} className="border rounded-lg p-3">
                    <div className="flex items-center gap-3 mb-2">
                      {getStepIcon(step.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium">{step.title}</h5>
                          {getStepStatusBadge(step.status)}
                        </div>
                        {step.description && (
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Step Details */}
                    <div className="text-xs text-gray-500 space-y-1">
                      {step.startedAt && (
                        <div>Started: {formatDistanceToNow(new Date(step.startedAt), { addSuffix: true })}</div>
                      )}
                      {step.completedAt && (
                        <div>Completed: {formatDistanceToNow(new Date(step.completedAt), { addSuffix: true })}</div>
                      )}
                      {step.error && (
                        <div className="text-red-600">Error: {step.error}</div>
                      )}
                    </div>
                    
                    {/* Step Result */}
                    {step.result && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(step.result, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
