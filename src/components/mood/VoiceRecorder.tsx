import { Mic, Square, Trash2, Play, Pause } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";

interface VoiceRecorderProps {
  onRecordingComplete?: (url: string) => void;
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const { isRecording, duration, audioUrl, error, startRecording, stopRecording, clearRecording } =
    useVoiceRecorder();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleStop = () => {
    stopRecording();
    // onRecordingComplete will be called after state updates
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Voice Note</label>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {!audioUrl ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={isRecording ? handleStop : startRecording}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full transition-all",
              isRecording
                ? "bg-destructive text-destructive-foreground animate-pulse"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            )}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? (
              <Square className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
          {isRecording && (
            <span className="font-mono text-sm text-destructive">
              {formatTime(duration)}
            </span>
          )}
          {!isRecording && (
            <span className="text-xs text-muted-foreground">
              Tap to record a voice note
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </button>
          <div className="flex-1">
            <div className="h-1 rounded-full bg-primary/20">
              <div className="h-1 w-1/3 rounded-full bg-primary" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{formatTime(duration)}</p>
          </div>
          <button
            type="button"
            onClick={clearRecording}
            className="text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Delete recording"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      )}
    </div>
  );
}
