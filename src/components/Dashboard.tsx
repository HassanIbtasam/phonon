import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ScanHistoryItem {
  message: string;
  risk: "low" | "medium" | "high";
  reason: string;
  timestamp: string;
}

export const Dashboard = () => {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const { t } = useLanguage();

  useEffect(() => {
    const loadHistory = () => {
      const stored = JSON.parse(localStorage.getItem("scanHistory") || "[]");
      setHistory(stored);
      
      const total = stored.length;
      const high = stored.filter((s: ScanHistoryItem) => s.risk === "high").length;
      const medium = stored.filter((s: ScanHistoryItem) => s.risk === "medium").length;
      const low = stored.filter((s: ScanHistoryItem) => s.risk === "low").length;
      
      setStats({ total, high, medium, low });
    };

    loadHistory();
    
    // Refresh every 5 seconds to catch new scans
    const interval = setInterval(loadHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "high":
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case "medium":
        return <Shield className="w-5 h-5 text-warning" />;
      case "low":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
    }
  };

  const getRiskBadge = (risk: string) => {
    const classes = {
      high: "bg-destructive/10 text-destructive border-destructive/20",
      medium: "bg-warning/10 text-warning border-warning/20",
      low: "bg-success/10 text-success border-success/20",
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${classes[risk as keyof typeof classes]}`}>
        {risk.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="font-display text-4xl font-bold">{t("dashboard.title")}</h2>
        <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-card border-border shadow-card hover:shadow-glow transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("dashboard.totalScans")}</p>
              <p className="text-3xl font-bold font-display">{stats.total}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border-border shadow-card hover:border-destructive/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("dashboard.highRisk")}</p>
              <p className="text-3xl font-bold font-display text-destructive">{stats.high}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-destructive opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border-border shadow-card hover:border-warning/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("dashboard.mediumRisk")}</p>
              <p className="text-3xl font-bold font-display text-warning">{stats.medium}</p>
            </div>
            <Shield className="w-8 h-8 text-warning opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border-border shadow-card hover:border-success/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("dashboard.lowRisk")}</p>
              <p className="text-3xl font-bold font-display text-success">{stats.low}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-success opacity-50" />
          </div>
        </Card>
      </div>

      {/* Recent Scans */}
      <Card className="p-6 bg-gradient-card border-border shadow-card">
        <h3 className="font-display text-2xl font-bold mb-6">{t("dashboard.recentScans")}</h3>
        
        {history.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>{t("dashboard.noScans")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 10).map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <div className="mt-1">{getRiskIcon(item.risk)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {getRiskBadge(item.risk)}
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mb-1 truncate">{item.message}</p>
                  <p className="text-xs text-muted-foreground">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
