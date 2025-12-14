import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Mic, MicOff, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useUsageTracking } from "@/hooks/use-usage-tracking";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useScribe, CommitStrategy } from "@elevenlabs/react";

interface TranscriptSegment {
  id: number;
  text: string;
  risk?: "low" | "medium" | "high";
  reason?: string;
  matchedPhrases?: string[];
}

// Common scam phrases in English and Arabic
const SCAM_PHRASES = {
  high: [
    // English - High Risk
    "send money", "wire transfer", "western union", "moneygram",
    "gift card", "itunes card", "google play card", "amazon card",
    "bank account details", "credit card number", "cvv", "pin number",
    "social security", "password", "one time code", "otp",
    "verify your account", "account suspended", "urgent action required",
    "you've won", "lottery winner", "inheritance", "prince",
    "remote access", "teamviewer", "anydesk", "download this software",
    "pay now or", "arrest warrant", "legal action", "police",
    "irs", "tax refund", "government grant",
    // Arabic - High Risk
    "أرسل المال", "حوالة مالية", "ويسترن يونيون", "تحويل بنكي",
    "بطاقة هدية", "بطاقة آيتونز", "بطاقة جوجل بلاي",
    "رقم الحساب البنكي", "رقم البطاقة", "الرقم السري", "رمز التحقق",
    "تحقق من حسابك", "حسابك موقوف", "إجراء عاجل",
    "لقد فزت", "جائزة", "ميراث", "أمير",
    "الوصول عن بعد", "حمل هذا البرنامج",
    "ادفع الآن", "أمر اعتقال", "إجراء قانوني", "الشرطة",
  ],
  medium: [
    // English - Medium Risk
    "click this link", "update your information", "confirm your identity",
    "limited time offer", "act now", "don't miss out", "expires today",
    "free money", "easy money", "work from home", "investment opportunity",
    "guaranteed returns", "double your money", "crypto", "bitcoin",
    "urgent", "immediately", "right now", "hurry",
    "keep this secret", "don't tell anyone", "confidential",
    "tech support", "microsoft support", "apple support",
    "your computer has virus", "infected",
    // Arabic - Medium Risk
    "اضغط على الرابط", "حدث معلوماتك", "أكد هويتك",
    "عرض محدود", "تصرف الآن", "لا تفوت الفرصة", "ينتهي اليوم",
    "مال مجاني", "مال سهل", "العمل من المنزل", "فرصة استثمارية",
    "عوائد مضمونة", "ضاعف أموالك", "بيتكوين",
    "عاجل", "فوراً", "الآن", "أسرع",
    "اجعل هذا سراً", "لا تخبر أحداً", "سري",
    "الدعم الفني", "جهازك مصاب بفيروس",
  ],
  low: [
    // English - Low Risk (suspicious but not definitive)
    "special offer", "discount", "promotion", "deal",
    "call back", "return my call", "callback number",
    "verify", "confirm", "update",
    // Arabic - Low Risk
    "عرض خاص", "خصم", "ترويج", "صفقة",
    "اتصل بي", "أعد الاتصال",
    "تأكيد", "تحديث",
  ]
};

// Analyze text for scam phrases
const analyzeForScamPhrases = (text: string): { risk: "low" | "medium" | "high"; matchedPhrases: string[]; reason: string } => {
  const lowerText = text.toLowerCase();
  const matchedHigh: string[] = [];
  const matchedMedium: string[] = [];
  const matchedLow: string[] = [];

  for (const phrase of SCAM_PHRASES.high) {
    if (lowerText.includes(phrase.toLowerCase())) {
      matchedHigh.push(phrase);
    }
  }

  for (const phrase of SCAM_PHRASES.medium) {
    if (lowerText.includes(phrase.toLowerCase())) {
      matchedMedium.push(phrase);
    }
  }

  for (const phrase of SCAM_PHRASES.low) {
    if (lowerText.includes(phrase.toLowerCase())) {
      matchedLow.push(phrase);
    }
  }

  if (matchedHigh.length > 0) {
    return {
      risk: "high",
      matchedPhrases: matchedHigh,
      reason: `Detected high-risk phrases: ${matchedHigh.slice(0, 3).join(", ")}`
    };
  } else if (matchedMedium.length >= 2 || (matchedMedium.length > 0 && matchedLow.length > 0)) {
    return {
      risk: "medium",
      matchedPhrases: [...matchedMedium, ...matchedLow],
      reason: `Detected suspicious phrases: ${[...matchedMedium, ...matchedLow].slice(0, 3).join(", ")}`
    };
  } else if (matchedMedium.length > 0 || matchedLow.length >= 2) {
    return {
      risk: "low",
      matchedPhrases: [...matchedMedium, ...matchedLow],
      reason: `Minor suspicious indicators: ${[...matchedMedium, ...matchedLow].slice(0, 3).join(", ")}`
    };
  }

  return {
    risk: "low",
    matchedPhrases: [],
    reason: "No suspicious phrases detected"
  };
};

export const LiveScamDetection = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { checkAndIncrement } = useUsageTracking();
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [highRiskDetected, setHighRiskDetected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  
  const segmentIdRef = useRef(0);
  const transcriptsEndRef = useRef<HTMLDivElement>(null);

  // Debug logging helper
  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[LiveScam ${timestamp}] ${message}`);
    setDebugLogs(prev => [...prev.slice(-20), `[${timestamp}] ${message}`]);
  }, []);

  // Analyze transcript locally with keyword matching
  const analyzeTranscript = useCallback((text: string) => {
    const result = analyzeForScamPhrases(text);
    const segmentId = ++segmentIdRef.current;

    const newSegment: TranscriptSegment = {
      id: segmentId,
      text: text,
      risk: result.risk,
      reason: result.reason,
      matchedPhrases: result.matchedPhrases
    };

    setTranscripts(prev => [...prev, newSegment]);

    if (result.risk === 'high') {
      setHighRiskDetected(true);
      toast({
        title: t("live.highRiskDetected"),
        description: result.reason,
        variant: "destructive",
      });
    }
  }, [t, toast]);

  // ElevenLabs Scribe hook for realtime transcription
  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    commitStrategy: CommitStrategy.VAD,
    onPartialTranscript: (data) => {
      addDebugLog(`Partial: "${data.text}"`);
    },
    onCommittedTranscript: (data) => {
      addDebugLog(`✓ Committed: "${data.text}"`);
      if (data.text.trim()) {
        analyzeTranscript(data.text.trim());
      }
    },
  });

  // Scroll to latest transcript
  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, scribe.partialTranscript]);

  // Request microphone permission
  const requestPermission = async () => {
    try {
      addDebugLog("Requesting microphone permission...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      addDebugLog("✓ Microphone permission granted");
      toast({
        title: t("live.permissionGranted"),
        description: t("live.permissionDesc"),
      });
    } catch (error) {
      addDebugLog(`ERROR: Permission denied - ${error}`);
      setHasPermission(false);
      toast({
        title: t("live.permissionDenied"),
        description: t("live.permissionDeniedDesc"),
        variant: "destructive",
      });
    }
  };

  // Start listening with ElevenLabs
  const startListening = async () => {
    // Check usage limit
    const canProceed = await checkAndIncrement('live_call', language);
    if (!canProceed) return;

    setIsConnecting(true);
    addDebugLog("Starting ElevenLabs realtime transcription...");

    try {
      // Get token from edge function
      addDebugLog("Fetching ElevenLabs token...");
      const { data, error } = await supabase.functions.invoke("elevenlabs-scribe-token");
      
      if (error) {
        throw new Error(`Token fetch failed: ${error.message}`);
      }

      if (!data?.token) {
        throw new Error("No token received from server");
      }

      addDebugLog("✓ Token received, connecting to ElevenLabs...");

      // Connect to ElevenLabs with microphone
      await scribe.connect({
        token: data.token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      addDebugLog("✓ Connected to ElevenLabs realtime transcription");
      setIsListening(true);
      setHighRiskDetected(false);
      toast({
        title: t("live.recordingStarted"),
        description: t("live.recordingDesc"),
      });
    } catch (error) {
      addDebugLog(`ERROR: ${error}`);
      console.error('Failed to start transcription:', error);
      toast({
        title: t("live.recordingFailed"),
        description: error instanceof Error ? error.message : t("live.recordingFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Stop listening
  const stopListening = () => {
    addDebugLog("Stopping transcription...");
    scribe.disconnect();
    setIsListening(false);
    toast({
      title: t("live.recordingStopped"),
      description: t("live.recordingStoppedDesc"),
    });
  };

  // Update listening state based on scribe connection
  useEffect(() => {
    if (!scribe.isConnected && isListening) {
      addDebugLog("Connection lost, resetting state");
      setIsListening(false);
    }
  }, [scribe.isConnected, isListening, addDebugLog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      scribe.disconnect();
    };
  }, [scribe]);

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
              {isConnecting ? t("live.analyzing") : isListening ? t("live.monitoring") : t("live.ready")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {isConnecting ? "Connecting to transcription service..." : isListening ? t("live.recordingInProgress") : t("live.clickToStart")}
            </p>

            <Button 
              onClick={isListening ? stopListening : startListening}
              size="lg"
              variant={isListening ? "destructive" : "default"}
              className="min-w-[200px]"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="ltr:mr-2 rtl:ml-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : isListening ? (
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

          {/* Live Transcript & Analysis */}
          {isListening && (
            <Card className="p-6 border-primary/20">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                {t("live.transcript")}
                <span className="ml-auto text-sm font-normal text-muted-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {t("live.liveTranscription")}
                </span>
              </h3>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {transcripts.length === 0 && !scribe.partialTranscript && (
                  <div className="p-4 rounded-lg border border-dashed border-muted text-center text-muted-foreground">
                    <Mic className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>{t("live.speakNow")}</p>
                  </div>
                )}

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
                        {segment.reason && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {segment.reason}
                          </p>
                        )}
                      </div>
                      {getRiskIcon(segment.risk)}
                    </div>
                  </div>
                ))}

                {/* Current partial transcript */}
                {scribe.partialTranscript && (
                  <div className="p-4 rounded-lg border-2 border-primary/50 bg-primary/10">
                    <p className="text-foreground font-medium">{scribe.partialTranscript}</p>
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

          {/* Show past transcripts when not listening */}
          {!isListening && transcripts.length > 0 && (
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
                        {segment.reason && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {segment.reason}
                          </p>
                        )}
                      </div>
                      {getRiskIcon(segment.risk)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Usage Tip */}
          <p className="text-center text-muted-foreground text-sm mt-6">
            {t("live.tip")}
          </p>

          {/* Debug Panel */}
          <div className="mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs text-muted-foreground"
            >
              {showDebug ? "Hide Debug Logs" : "Show Debug Logs"}
            </Button>
            
            {showDebug && (
              <Card className="mt-2 p-4 border-yellow-500/30 bg-yellow-500/5">
                <h4 className="font-mono text-sm font-semibold mb-2 text-yellow-600">Debug Logs</h4>
                <div className="font-mono text-xs space-y-1 max-h-[200px] overflow-y-auto">
                  {debugLogs.length === 0 ? (
                    <p className="text-muted-foreground">No logs yet. Start monitoring to see activity.</p>
                  ) : (
                    debugLogs.map((log, i) => (
                      <p key={i} className={cn(
                        "whitespace-pre-wrap",
                        log.includes('ERROR') ? 'text-red-500' : 
                        log.includes('✓') ? 'text-green-500' : 
                        'text-muted-foreground'
                      )}>
                        {log}
                      </p>
                    ))
                  )}
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};
