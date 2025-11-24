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
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-scam`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ message }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze message");
      }

      const analysis = await response.json();
      
      setResult({
        risk: analysis.risk,
        reason: analysis.reason,
        timestamp: new Date(),
      });

      // Save to history
      const history = JSON.parse(localStorage.getItem("scanHistory") || "[]");
      history.unshift({
        message: message.substring(0, 100),
        risk: analysis.risk,
        reason: analysis.reason,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("scanHistory", JSON.stringify(history.slice(0, 50)));
    } catch (error) {
      console.error("Scan error:", error);
      toast({
        title: "Scan failed",
        description: error instanceof Error ? error.message : "Failed to analyze message",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
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
