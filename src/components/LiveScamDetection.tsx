import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Radio, Square, Shield, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export const LiveScamDetection = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  
  const recognitionRef = useRef<any>(null);
  
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setHasPermission(true);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const requestPermission = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: t("live.permissionDenied"),
        description: "Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      toast({
        title: t("live.permissionGranted"),
        description: t("live.permissionDesc"),
      });
    } catch (error) {
      console.error("Microphone permission denied:", error);
      toast({
        title: t("live.permissionDenied"),
        description: t("live.permissionDeniedDesc"),
        variant: "destructive",
      });
    }
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: t("live.recordingFailed"),
        description: "Speech recognition not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    console.log("Starting speech recognition...");

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcriptText = event.results[last][0].transcript;
      
      // Show live transcript in real-time
      setLiveTranscript(transcriptText);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed' || event.error === 'not-allowed-permission') {
        toast({
          title: t("live.permissionDenied"),
          description: t("live.permissionDeniedDesc"),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Recognition Error",
          description: `Speech recognition failed: ${event.error}`,
          variant: "destructive",
        });
      }
    };
    
    recognition.onstart = () => {
      console.log("Speech recognition started successfully");
    };

    recognition.onend = () => {
      console.log("Speech recognition ended, isRecording:", isRecording);
      if (isRecording) {
        console.log("Restarting recognition...");
        try {
          recognition.start();
        } catch (error) {
          console.error("Failed to restart recognition:", error);
        }
      }
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
      setIsRecording(true);
      setLiveTranscript("");
      
      toast({
        title: t("live.recordingStarted"),
        description: "Start speaking to see live transcription",
      });
    } catch (error) {
      console.error("Failed to start recognition:", error);
      toast({
        title: t("live.recordingFailed"),
        description: "Could not start speech recognition. Please check your microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setLiveTranscript("");

      toast({
        title: t("live.recordingStopped"),
        description: "Live transcription stopped",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
          {t("live.title")}
        </h1>
        <p className="text-muted-foreground text-lg">
          Real-time speech transcription
        </p>
      </div>

      {/* Privacy Reassurance */}
      <Alert className="mb-6 border-primary/20 bg-primary/5">
        <Shield className="h-5 w-5 text-primary" />
        <AlertDescription className="text-sm leading-relaxed">
          <strong className="block mb-1">{t("live.privacyTitle")}</strong>
          {t("live.privacyMessage")}
        </AlertDescription>
      </Alert>

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
        <Card className="p-8 mb-6 border-primary/20">
          <div className="flex flex-col items-center gap-6">
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
              {isRecording ? "Speak into your microphone" : "Tap to start live transcription"}
            </p>
          </div>
        </Card>
      )}

      {/* Live Speech Display - Subtitles */}
      {isRecording && (
        <Card className="p-8 mb-6 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Mic className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">
              {t("live.listening")}
            </span>
          </div>
          {liveTranscript ? (
            <p className="text-2xl text-center text-foreground font-medium leading-relaxed min-h-[80px] flex items-center justify-center">
              "{liveTranscript}"
            </p>
          ) : (
            <p className="text-lg text-center text-muted-foreground italic min-h-[80px] flex items-center justify-center">
              Waiting for speech...
            </p>
          )}
        </Card>
      )}
    </div>
  );
};
