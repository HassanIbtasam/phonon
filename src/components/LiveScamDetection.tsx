import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Radio, Square, AlertTriangle, Shield, CheckCircle2, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface TranscriptSegment {
  text: string;
  timestamp: Date;
  riskLevel?: "low" | "medium" | "high";
  analysis?: string;
}

export const LiveScamDetection = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [currentRisk, setCurrentRisk] = useState<"low" | "medium" | "high">("low");
  const [hasPermission, setHasPermission] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop()); // Stop after permission check
      toast({
        title: t("live.permissionGranted"),
        description: t("live.permissionDesc"),
      });
    } catch (error) {
      console.error("Permission denied:", error);
      toast({
        title: t("live.permissionDenied"),
        description: t("live.permissionDeniedDesc"),
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          processAudioChunk(event.data);
        }
      };

      mediaRecorder.start(3000); // Capture chunks every 3 seconds
      setIsRecording(true);
      setTranscript([]);
      
      toast({
        title: t("live.recordingStarted"),
        description: t("live.recordingDesc"),
      });
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast({
        title: t("live.recordingFailed"),
        description: t("live.recordingFailedDesc"),
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      toast({
        title: t("live.recordingStopped"),
        description: t("live.recordingStoppedDesc"),
      });
    }
  };

  const processAudioChunk = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Send to transcription edge function
        const { data: transcriptData, error: transcriptError } = await supabase.functions.invoke(
          'transcribe-audio',
          { body: { audio: base64Audio } }
        );

        if (transcriptError) throw transcriptError;
        
        if (transcriptData?.text && transcriptData.text.trim()) {
          // Analyze the transcribed text for scams
          const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
            'detect-scam',
            { body: { message: transcriptData.text } }
          );

          if (analysisError) throw analysisError;

          const newSegment: TranscriptSegment = {
            text: transcriptData.text,
            timestamp: new Date(),
            riskLevel: analysisData.risk,
            analysis: analysisData.reason,
          };

          setTranscript(prev => [...prev, newSegment]);
          
          // Update overall risk level to the highest risk detected
          if (analysisData.risk === "high") {
            setCurrentRisk("high");
          } else if (analysisData.risk === "medium" && currentRisk !== "high") {
            setCurrentRisk("medium");
          }

          // Alert user if high risk detected
          if (analysisData.risk === "high") {
            toast({
              title: t("live.highRiskDetected"),
              description: analysisData.reason,
              variant: "destructive",
            });
          }
        }
      };
    } catch (error) {
      console.error("Failed to process audio:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskIcon = () => {
    switch (currentRisk) {
      case "high":
        return <AlertTriangle className="w-6 h-6 text-destructive" />;
      case "medium":
        return <Shield className="w-6 h-6 text-warning" />;
      case "low":
        return <CheckCircle2 className="w-6 h-6 text-success" />;
    }
  };

  const getRiskColor = () => {
    switch (currentRisk) {
      case "high":
        return "border-destructive bg-destructive/10";
      case "medium":
        return "border-warning bg-warning/10";
      case "low":
        return "border-success bg-success/10";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
          {t("live.title")}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t("live.subtitle")}
        </p>
      </div>

      {/* Permission Request */}
      {!hasPermission && (
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4">
            <Mic className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">{t("live.permissionRequired")}</h3>
              <p className="text-muted-foreground mb-4">
                {t("live.permissionExplanation")}
              </p>
              <Button onClick={requestPermission}>
                {t("live.grantPermission")}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Recording Controls */}
      {hasPermission && (
        <Card className={`p-8 mb-6 ${getRiskColor()} border-2`}>
          <div className="flex flex-col items-center gap-6">
            {/* Status Indicator */}
            <div className="flex items-center gap-3">
              {getRiskIcon()}
              <span className="font-semibold text-lg">
                {isRecording ? t("live.monitoring") : t("live.ready")}
              </span>
            </div>

            {/* Recording Button */}
            <Button
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-48 h-48 rounded-full ${
                isRecording 
                  ? "bg-destructive hover:bg-destructive/90" 
                  : "bg-gradient-primary"
              }`}
            >
              {isRecording ? (
                <Square className="w-16 h-16" />
              ) : (
                <Radio className="w-16 h-16" />
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground max-w-md">
              {isRecording ? t("live.recordingInProgress") : t("live.clickToStart")}
            </p>

            {/* Analyzing Indicator */}
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-primary">
                <div className="animate-pulse">⚡</div>
                <span className="text-sm">{t("live.analyzing")}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Live Transcript */}
      {transcript.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <MicOff className="w-5 h-5" />
            {t("live.transcript")}
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {transcript.map((segment, index) => (
              <div key={index} className="border-l-4 pl-4 py-2" style={{
                borderColor: segment.riskLevel === "high" ? "hsl(var(--destructive))" :
                           segment.riskLevel === "medium" ? "hsl(var(--warning))" :
                           "hsl(var(--success))"
              }}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <span className="text-xs text-muted-foreground">
                    {segment.timestamp.toLocaleTimeString()}
                  </span>
                  {segment.riskLevel && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      segment.riskLevel === "high" ? "bg-destructive/20 text-destructive" :
                      segment.riskLevel === "medium" ? "bg-warning/20 text-warning" :
                      "bg-success/20 text-success"
                    }`}>
                      {t(`result.${segment.riskLevel}`)}
                    </span>
                  )}
                </div>
                <p className="text-sm mb-2">{segment.text}</p>
                {segment.analysis && (
                  <p className="text-xs text-muted-foreground italic">
                    {segment.analysis}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Usage Tips */}
      <Alert className="mt-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {t("live.tip")}
        </AlertDescription>
      </Alert>
    </div>
  );
};
