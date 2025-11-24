import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScanResult {
  risk: "low" | "medium" | "high";
  reason: string;
  timestamp: Date;
}

export const MessageScanner = () => {
  const [message, setMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const { toast } = useToast();

  const handleScan = async () => {
    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message to scan",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    
    // Simulate API call with mock detection logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockAnalysis = analyzeMockMessage(message);
    setResult({
      ...mockAnalysis,
      timestamp: new Date(),
    });
    
    setIsScanning(false);

    // Save to history
    const history = JSON.parse(localStorage.getItem("scanHistory") || "[]");
    history.unshift({
      message: message.substring(0, 100),
      ...mockAnalysis,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("scanHistory", JSON.stringify(history.slice(0, 50)));
  };

  const analyzeMockMessage = (text: string): Omit<ScanResult, "timestamp"> => {
    const lowerText = text.toLowerCase();
    
    // High risk indicators
    const highRiskPatterns = [
      /urgent.*account/i,
      /verify.*identity/i,
      /suspended.*account/i,
      /claim.*prize/i,
      /congratulations.*won/i,
      /click.*link.*immediately/i,
      /bitcoin|cryptocurrency/i,
      /transfer.*money/i,
      /tax.*refund/i,
      /social.*security/i,
    ];

    // Medium risk indicators
    const mediumRiskPatterns = [
      /act now/i,
      /limited time/i,
      /confirm.*details/i,
      /update.*information/i,
      /unusual activity/i,
    ];

    // Check for suspicious URLs
    const hasUrl = /https?:\/\//i.test(text);
    const hasShortenedUrl = /bit\.ly|tinyurl|t\.co/i.test(text);

    for (const pattern of highRiskPatterns) {
      if (pattern.test(text)) {
        return {
          risk: "high",
          reason: "Contains urgent language and suspicious requests commonly used in scam messages. Be very cautious and do not click any links or provide personal information.",
        };
      }
    }

    if (hasShortenedUrl) {
      return {
        risk: "high",
        reason: "Contains shortened URLs which are commonly used to hide malicious links. Never click on shortened links from unknown sources.",
      };
    }

    for (const pattern of mediumRiskPatterns) {
      if (pattern.test(text)) {
        return {
          risk: "medium",
          reason: "Contains pressure tactics or requests for information. Verify the sender's identity through official channels before responding.",
        };
      }
    }

    if (hasUrl) {
      return {
        risk: "medium",
        reason: "Contains a URL. Always verify links are from legitimate sources before clicking.",
      };
    }

    return {
      risk: "low",
      reason: "No obvious scam indicators detected. However, always stay vigilant with messages from unknown sources.",
    };
  };

  const getRiskIcon = () => {
    if (!result) return null;
    
    switch (result.risk) {
      case "high":
        return <AlertTriangle className="w-8 h-8 text-destructive" />;
      case "medium":
        return <Shield className="w-8 h-8 text-warning" />;
      case "low":
        return <CheckCircle2 className="w-8 h-8 text-success" />;
    }
  };

  const getRiskColor = () => {
    if (!result) return "";
    
    switch (result.risk) {
      case "high":
        return "border-destructive/50 bg-destructive/5";
      case "medium":
        return "border-warning/50 bg-warning/5";
      case "low":
        return "border-success/50 bg-success/5";
    }
  };

  const getRiskLabel = () => {
    if (!result) return "";
    
    switch (result.risk) {
      case "high":
        return "High Risk - Likely Scam";
      case "medium":
        return "Medium Risk - Be Cautious";
      case "low":
        return "Low Risk - Appears Safe";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="font-display text-4xl font-bold">Scan a Message</h2>
        <p className="text-muted-foreground">Paste any suspicious message below for instant AI analysis</p>
      </div>

      <Card className="p-6 bg-gradient-card border-border shadow-card space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium">Message Content</label>
          <Textarea
            placeholder="Paste the message you want to check here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[200px] bg-secondary border-border resize-none"
          />
        </div>

        <Button
          onClick={handleScan}
          disabled={isScanning}
          className="w-full bg-gradient-primary hover:shadow-glow transition-all font-semibold"
          size="lg"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 mr-2" />
              Scan Message
            </>
          )}
        </Button>
      </Card>

      {result && (
        <Card className={`p-6 border-2 ${getRiskColor()} shadow-card animate-in fade-in slide-in-from-bottom duration-500`}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {getRiskIcon()}
              <div className="flex-1">
                <h3 className="font-display text-xl font-bold">{getRiskLabel()}</h3>
                <p className="text-sm text-muted-foreground">
                  Scanned {result.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <h4 className="font-semibold mb-2">Analysis</h4>
              <p className="text-muted-foreground leading-relaxed">{result.reason}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
