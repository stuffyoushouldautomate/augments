'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Send,
  RefreshCw
} from 'lucide-react';

interface CompletionTimerProps {
  taskId: string;
  completionTimerStartedAt: Date | null;
  completionTimerDuration: number | null;
  onFeedbackSubmit?: (feedback: string) => void;
  onTaskClose?: () => void;
  className?: string;
}

export function CompletionTimer({ 
  taskId, 
  completionTimerStartedAt, 
  completionTimerDuration,
  onFeedbackSubmit,
  onTaskClose,
  className 
}: CompletionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!completionTimerStartedAt || !completionTimerDuration) {
      setIsActive(false);
      return;
    }

    const startTime = new Date(completionTimerStartedAt).getTime();
    const duration = completionTimerDuration * 1000; // Convert to milliseconds
    const endTime = startTime + duration;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      
      setTimeRemaining(remaining);
      
      if (remaining > 0) {
        setIsActive(true);
      } else {
        setIsActive(false);
        // Auto-close task when timer expires
        if (onTaskClose) {
          onTaskClose();
        }
      }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [completionTimerStartedAt, completionTimerDuration, onTaskClose]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim() || feedbackSubmitted) return;

    setIsSubmitting(true);
    try {
      if (onFeedbackSubmit) {
        await onFeedbackSubmit(feedback);
      }
      
      // Also submit to backend
      const response = await fetch(`/api/tasks/${taskId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/close`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to close task');
      }

      if (onTaskClose) {
        onTaskClose();
      }
    } catch (error) {
      console.error('Error closing task:', error);
    }
  };

  if (!completionTimerStartedAt || !completionTimerDuration) {
    return null;
  }

  const progressPercentage = ((completionTimerDuration - timeRemaining) / completionTimerDuration) * 100;
  const isWarning = timeRemaining <= 30 && timeRemaining > 0;
  const isCritical = timeRemaining <= 10 && timeRemaining > 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Task Completion Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center space-y-3">
          <div className={`text-4xl font-mono font-bold ${
            isCritical ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-green-600'
          }`}>
            {formatTime(timeRemaining)}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                isCritical ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-600">
            {isActive 
              ? 'Task completed! Provide feedback before the timer expires.'
              : 'Timer expired. Task will be closed automatically.'
            }
          </p>
        </div>

        {/* Status Alert */}
        {isActive && (
          <Alert className={isCritical ? 'border-red-200 bg-red-50' : isWarning ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {isCritical 
                ? 'Timer almost expired! Submit feedback now to keep the task open.'
                : isWarning 
                ? 'Timer running low. Consider submitting feedback soon.'
                : 'Task completed successfully! You have time to provide feedback.'
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Feedback Section */}
        {isActive && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="feedback">Task Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="How did the task go? Any feedback or suggestions?"
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleFeedbackSubmit}
                disabled={!feedback.trim() || feedbackSubmitted || isSubmitting}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : feedbackSubmitted ? 'Feedback Submitted' : 'Submit Feedback'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleCloseTask}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Close Task
              </Button>
            </div>
          </div>
        )}

        {/* Expired State */}
        {!isActive && timeRemaining === 0 && (
          <div className="text-center space-y-3">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <div>
              <p className="font-medium">Timer Expired</p>
              <p className="text-sm text-gray-600">Task has been closed automatically</p>
            </div>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </div>
        )}

        {/* Feedback Submitted Confirmation */}
        {feedbackSubmitted && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Thank you for your feedback! The task will remain open until the timer expires or you close it manually.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
