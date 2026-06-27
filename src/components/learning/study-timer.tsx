"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Play, Square, RotateCcw } from "lucide-react";
import { logStudySession } from "@/app/actions/learning";

interface StudyTimerProps {
  learningPathId: string;
  learningPathTitle: string;
}

export function StudyTimer({ learningPathId, learningPathTitle }: StudyTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [notes, setNotes] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds((seconds) => seconds + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = async () => {
    setIsActive(false);
    const mins = Math.floor(seconds / 60);
    if (mins > 0) {
      await logStudySession(learningPathId, mins, notes, learningPathTitle);
      alert(`Saved ${mins} minutes to ${learningPathTitle}!`);
    }
    setSeconds(0);
    setNotes("");
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
  };

  return (
    <Card className="border-dashed border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          ⏱️ Study Timer: {learningPathTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-4xl font-mono font-bold text-center text-primary">
          {formatTime(seconds)}
        </div>
        
        <Input 
          placeholder="What are you studying right now? (Optional notes)" 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isActive}
        />

        <div className="flex gap-2">
          {!isActive ? (
            <Button type="button" onClick={() => setIsActive(true)} className="flex-1 bg-green-600 hover:bg-green-700">
              <Play className="mr-2 h-4 w-4" /> Start
            </Button>
          ) : (
            <Button type="button" onClick={handleStop} className="flex-1 bg-red-600 hover:bg-red-700">
              <Square className="mr-2 h-4 w-4" /> Stop & Log
            </Button>
          )}
          <Button type="button" variant="outline" onClick={handleReset} disabled={isActive}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}