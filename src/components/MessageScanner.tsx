import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle2, Loader2, Flag, Phone, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface ScanResult {
  risk: "low" | "medium" | "high";
  reason: string;
  timestamp: Date;
}

export const MessageScanner = () => {
  const [message, setMessage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleScan = async () => {
    if (!message.trim()) {
      toast({
        title: t("scanner.empty"),
        description: t("scanner.emptyDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('detect-scam', {
        body: { message, phoneNumber: phoneNumber.trim() || null }
      });

      if (error) throw error;

      setResult({
        risk: data.risk,
        reason: data.reason,
        timestamp: new Date(),
      });

      // Save to database if user is logged in
      if (user) {
        await supabase.from('scan_history').insert({
          user_id: user.id,
          message_preview: message.substring(0, 100),
          phone_number: phoneNumber.trim() || null,
          risk_level: data.risk,
          reason: data.reason
        });
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast({
        title: t("scanner.failed"),
        description: error instanceof Error ? error.message : t("scanner.failedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleFlag = async (status: 'scam' | 'safe') => {
    if (!phoneNumber.trim()) {
      toast({
        title: t("scanner.empty"),
        description: "Please enter a phone number to flag",
        variant: "destructive",
      });
      return;
    }

    setIsFlagging(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }
      
      const { data, error } = await supabase.functions.invoke('detect-scam', {
        body: { 
          action: 'flag',
          phoneNumber: phoneNumber.trim(),
          status,
          message
        },
        headers: Object.keys(headers).length > 0 ? headers : undefined
      });

      if (error) throw error;

      toast({
        title: t("scanner.flagSuccess"),
        description: `Number flagged as ${status}`,
      });
    } catch (error) {
      console.error("Flag error:", error);
      toast({
        title: t("scanner.flagError"),
        description: error instanceof Error ? error.message : t("scanner.failedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsFlagging(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
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
        return t("result.high");
      case "medium":
        return t("result.medium");
      case "low":
        return t("result.low");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-end gap-2 mb-4">
          {user && (
            <Button
              onClick={() => navigate("/history")}
              variant="outline"
              size="sm"
            >
              My History
            </Button>
          )}
          {user ? (
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
              variant="outline"
              size="sm"
            >
              Sign In
            </Button>
          )}
        </div>
        <h2 className="font-display text-4xl font-bold">{t("scanner.title")}</h2>
        <p className="text-muted-foreground">{t("scanner.subtitle")}</p>
      </div>

      <Card className="p-6 bg-gradient-card border-border shadow-card space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium">{t("scanner.label")}</label>
          <Textarea
            placeholder={t("scanner.placeholder")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[200px] bg-secondary border-border resize-none"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {t("scanner.phoneLabel")}
          </label>
          <Input
            type="tel"
            placeholder={t("scanner.phonePlaceholder")}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="bg-secondary border-border"
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
              {t("scanner.analyzing")}
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 mr-2" />
              {t("scanner.button")}
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
                  {t("result.scanned")} {result.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <h4 className="font-semibold mb-2">{t("result.analysis")}</h4>
              <p className="text-muted-foreground leading-relaxed">{result.reason}</p>
            </div>

            {phoneNumber && (
              <div className="pt-4 border-t border-border flex gap-3">
                <Button
                  onClick={() => handleFlag('scam')}
                  disabled={isFlagging}
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  {t("scanner.flagAsScam")}
                </Button>
                <Button
                  onClick={() => handleFlag('safe')}
                  disabled={isFlagging}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {t("scanner.flagAsSafe")}
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
