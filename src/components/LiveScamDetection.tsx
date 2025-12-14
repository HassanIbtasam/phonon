import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Mic, MicOff, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useUsageTracking } from "@/hooks/use-usage-tracking";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Web Speech API TypeScript declarations
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface TranscriptSegment {
  id: number;
  text: string;
  risk?: "low" | "medium" | "high";
  reason?: string;
  analyzing?: boolean;
}

export const LiveScamDetection = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { checkAndIncrement } = useUsageTracking();
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [highRiskDetected, setHighRiskDetected] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const segmentIdRef = useRef(0);
  const transcriptsEndRef = useRef<HTMLDivElement>(null);

  // Check for Web Speech API support
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Scroll to latest transcript
  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, currentTranscript]);

  // Analyze transcript with AI
  const analyzeTranscript = useCallback(async (segmentId: number, text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('detect-scam', {
        body: { message: text }
      });

      if (error) throw error;

      setTranscripts(prev => prev.map(seg => 
        seg.id === segmentId 
          ? { ...seg, risk: data.risk, reason: data.reason, analyzing: false }
          : seg
      ));

      if (data.risk === 'high') {
        setHighRiskDetected(true);
        toast({
          title: t("live.highRiskDetected"),
          description: data.reason,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setTranscripts(prev => prev.map(seg => 
        seg.id === segmentId 
          ? { ...seg, analyzing: false }
          : seg
      ));
    }
  }, [t, toast]);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setCurrentTranscript(interimTranscript);

      if (finalTranscript.trim()) {
        const segmentId = ++segmentIdRef.current;
        const newSegment: TranscriptSegment = {
          id: segmentId,
          text: finalTranscript.trim(),
          analyzing: true
        };
        
        setTranscripts(prev => [...prev, newSegment]);
        setCurrentTranscript("");
        analyzeTranscript(segmentId, finalTranscript.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setHasPermission(false);
        toast({
          title: t("live.permissionDenied"),
          description: t("live.permissionDeniedDesc"),
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      // Auto-restart if still listening (handles browser stopping)
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log('Recognition ended');
        }
      }
    };

    return recognition;
  }, [language, isListening, analyzeTranscript, t, toast]);

  // Request microphone permission
  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      toast({
        title: t("live.permissionGranted"),
        description: t("live.permissionDesc"),
      });
    } catch (error) {
      setHasPermission(false);
      toast({
        title: t("live.permissionDenied"),
        description: t("live.permissionDeniedDesc"),
        variant: "destructive",
      });
    }
  };

  // Start listening
  const startListening = async () => {
    // Check usage limit
    const canProceed = await checkAndIncrement('live_call', language);
    if (!canProceed) return;

    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setHighRiskDetected(false);
        toast({
          title: t("live.recordingStarted"),
          description: t("live.recordingDesc"),
        });
      } catch (error) {
        console.error('Failed to start recognition:', error);
        toast({
          title: t("live.recordingFailed"),
          description: t("live.recordingFailedDesc"),
          variant: "destructive",
        });
      }
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setCurrentTranscript("");
    toast({
      title: t("live.recordingStopped"),
      description: t("live.recordingStoppedDesc"),
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Re-init recognition when language changes
  useEffect(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = initRecognition();
      recognitionRef.current?.start();
    }
  }, [language, initRecognition, isListening]);

  const getRiskStyles = (risk?: string) => {
    switch (risk) {
      case 'high':
        return 'border-red-500 bg-red-500/10';
      case 'medium':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'low':
        return 'border-green-500 bg-green-500/10';
      default:
        return 'border-border';
    }
  };

  const getRiskIcon = (risk?: string) => {
    switch (risk) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  if (!isSupported) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            {t("live.title")}
          </h1>
        </div>
        <Card className="p-12 text-center border-destructive/20">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Browser Not Supported</h3>
          <p className="text-muted-foreground">
            Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
          {t("live.title")}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t("live.subtitle")}
        </p>
      </div>

      {/* Privacy Notice */}
      <Card className="p-6 mb-6 border-primary/20 bg-primary/5">
        <div className="flex items-start gap-4">
          <Shield className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-lg mb-2">{t("live.privacyTitle")}</h3>
            <p className="text-muted-foreground text-sm">
              {t("live.privacyMessage")}
            </p>
          </div>
        </div>
      </Card>

      {/* Permission Request */}
      {hasPermission === null && (
        <Card className="p-8 text-center border-primary/20 mb-6">
          <Mic className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t("live.permissionRequired")}</h3>
          <p className="text-muted-foreground mb-6">
            {t("live.permissionExplanation")}
          </p>
          <Button onClick={requestPermission} size="lg">
            {t("live.grantPermission")}
          </Button>
        </Card>
      )}

      {/* Permission Denied */}
      {hasPermission === false && (
        <Card className="p-8 text-center border-destructive/20 mb-6">
          <MicOff className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t("live.permissionDenied")}</h3>
          <p className="text-muted-foreground mb-6">
            {t("live.permissionDeniedDesc")}
          </p>
          <Button onClick={requestPermission} variant="outline">
            {t("live.grantPermission")}
          </Button>
        </Card>
      )}

      {/* Main Control */}
      {hasPermission === true && (
        <>
          <Card className="p-8 text-center border-primary/20 mb-6">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300",
              isListening 
                ? "bg-destructive/20 animate-pulse" 
                : "bg-primary/20"
            )}>
              {isListening ? (
                <MicOff className="w-12 h-12 text-destructive" />
              ) : (
                <Mic className="w-12 h-12 text-primary" />
              )}
            </div>

            <h3 className="text-xl font-semibold mb-2">
              {isListening ? t("live.monitoring") : t("live.ready")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {isListening ? t("live.recordingInProgress") : t("live.clickToStart")}
            </p>

            <Button 
              onClick={isListening ? stopListening : startListening}
              size="lg"
              variant={isListening ? "destructive" : "default"}
              className="min-w-[200px]"
            >
              {isListening ? (
                <>
                  <MicOff className="ltr:mr-2 rtl:ml-2 h-5 w-5" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Mic className="ltr:mr-2 rtl:ml-2 h-5 w-5" />
                  Start Monitoring
                </>
              )}
            </Button>
          </Card>

          {/* High Risk Alert Banner */}
          {highRiskDetected && (
            <Card className="p-4 mb-6 border-red-500 bg-red-500/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <span className="font-semibold text-red-500">
                  {t("live.highRiskDetected")}
                </span>
              </div>
            </Card>
          )}

          {/* Transcript & Analysis */}
          {(transcripts.length > 0 || currentTranscript) && (
            <Card className="p-6 border-primary/20">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                {t("live.transcript")}
              </h3>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {transcripts.map((segment) => (
                  <div
                    key={segment.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all",
                      getRiskStyles(segment.risk)
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-foreground">{segment.text}</p>
                        {segment.analyzing ? (
                          <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t("live.analyzing")}
                          </div>
                        ) : segment.reason && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {segment.reason}
                          </p>
                        )}
                      </div>
                      {!segment.analyzing && getRiskIcon(segment.risk)}
                    </div>
                  </div>
                ))}

                {/* Current interim transcript */}
                {currentTranscript && (
                  <div className="p-4 rounded-lg border border-dashed border-primary/50 bg-primary/5">
                    <p className="text-muted-foreground italic">{currentTranscript}</p>
                    <div className="flex items-center gap-2 mt-2 text-primary text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("live.listening")}
                    </div>
                  </div>
                )}

                <div ref={transcriptsEndRef} />
              </div>
            </Card>
          )}

          {/* Usage Tip */}
          <p className="text-center text-muted-foreground text-sm mt-6">
            {t("live.tip")}
          </p>
        </>
      )}
    </div>
  );
};
