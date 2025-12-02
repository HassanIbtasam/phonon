import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle2, Clock, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { NavHeader } from "@/components/NavHeader";
import type { User } from "@supabase/supabase-js";

interface ScanHistoryItem {
  id: string;
  message_preview: string;
  phone_number: string | null;
  risk_level: string;
  reason: string;
  scanned_at: string;
}

export default function History() {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      loadHistory();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadHistory();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scan_history')
        .select('*')
        .order('scanned_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "high":
        return <AlertTriangle className="w-6 h-6 text-destructive" />;
      case "medium":
        return <Shield className="w-6 h-6 text-warning" />;
      case "low":
        return <CheckCircle2 className="w-6 h-6 text-success" />;
      default:
        return null;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "border-destructive/50 bg-destructive/5";
      case "medium":
        return "border-warning/50 bg-warning/5";
      case "low":
        return "border-success/50 bg-success/5";
      default:
        return "";
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "high":
        return t("result.high");
      case "medium":
        return t("result.medium");
      case "low":
        return t("result.low");
      default:
        return risk;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <div className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="font-display text-4xl font-bold">{t("history.title")}</h1>
            <p className="text-muted-foreground">
              {t("history.subtitle")}
            </p>
          </div>

          {isLoading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">{t("history.loading")}</p>
            </Card>
          ) : history.length === 0 ? (
            <Card className="p-8 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">{t("history.noScans")}</h3>
              <p className="text-muted-foreground mb-4">
                {t("history.noScansDesc")}
              </p>
              <Button onClick={() => navigate("/")}>
                {t("history.startScanning")}
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <Card
                  key={item.id}
                  className={`p-6 border-2 ${getRiskColor(item.risk_level)} shadow-card`}
                >
                  <div className="flex items-start gap-4">
                    {getRiskIcon(item.risk_level)}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">
                          {getRiskLabel(item.risk_level)}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {new Date(item.scanned_at).toLocaleString()}
                        </div>
                      </div>

                      {item.phone_number && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono">{item.phone_number}</span>
                        </div>
                      )}

                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground mb-1">{t("history.messagePreview")}</p>
                        <p className="text-sm">{item.message_preview}</p>
                      </div>

                      <div className="pt-2 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-1">{t("history.analysis")}</p>
                        <p className="text-sm">{item.reason}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
