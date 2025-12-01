import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, AlertTriangle, AlertCircle, Link as LinkIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUsageTracking } from "@/hooks/use-usage-tracking";

interface AnalysisResult {
  riskFactor: number;
  confidence: "low" | "medium" | "high";
  concerns: string[];
  analysis: string;
  recommendation: string;
}

export const LinkAnalyzer = () => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { checkAndIncrement } = useUsageTracking();

  const analyzeLink = async () => {
    if (!url.trim()) {
      toast({
        title: t("linkAnalyzer.error"),
        description: t("linkAnalyzer.emptyUrl"),
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`);
    } catch {
      toast({
        title: t("linkAnalyzer.invalidUrl"),
        description: t("linkAnalyzer.invalidUrlDesc"),
        variant: "destructive",
      });
      return;
    }

    // Check usage limit before analyzing
    const canProceed = await checkAndIncrement('link_analysis', language);
    if (!canProceed) {
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-link', {
        body: { url: url.trim() }
      });

      if (error) throw error;

      setResult(data);
    } catch (error: any) {
      console.error('Error analyzing link:', error);
      toast({
        title: t("linkAnalyzer.analysisFailed"),
        description: error.message || t("linkAnalyzer.analysisFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (riskFactor: number) => {
    if (riskFactor < 30) return "text-success";
    if (riskFactor < 70) return "text-warning";
    return "text-destructive";
  };

  const getRiskIcon = (riskFactor: number) => {
    if (riskFactor < 30) return <Shield className="w-8 h-8 text-success" />;
    if (riskFactor < 70) return <AlertTriangle className="w-8 h-8 text-warning" />;
    return <AlertCircle className="w-8 h-8 text-destructive" />;
  };

  const getRiskLabel = (riskFactor: number) => {
    if (riskFactor < 30) return t("linkAnalyzer.lowerRisk");
    if (riskFactor < 70) return t("linkAnalyzer.moderateRisk");
    return t("linkAnalyzer.higherRisk");
  };

  const getRiskBadge = (riskFactor: number) => {
    if (riskFactor < 30) return "bg-success/10 text-success border-success/20";
    if (riskFactor < 70) return "bg-warning/10 text-warning border-warning/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  return (
    <div className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
      <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-700">
        <LinkIcon className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="font-display text-4xl font-bold mb-3">
          {t("linkAnalyzer.title")}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t("linkAnalyzer.subtitle")}
        </p>
      </div>

      <Card className="p-6 mb-6 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("linkAnalyzer.label")}
            </label>
            <Textarea
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t("linkAnalyzer.placeholder")}
              className="min-h-[100px] font-mono text-sm"
              disabled={isAnalyzing}
            />
          </div>

          <Button 
            onClick={analyzeLink}
            disabled={isAnalyzing || !url.trim()}
            className="w-full bg-gradient-primary hover:opacity-90"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("linkAnalyzer.analyzing")}
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                {t("linkAnalyzer.button")}
              </>
            )}
          </Button>
        </div>
      </Card>

      {result && (
        <Card className="p-6 animate-in fade-in slide-in-from-bottom duration-700">
          <div className="space-y-6">
            {/* Risk Level Header */}
            <div className="flex items-center gap-4 pb-4 border-b">
              {getRiskIcon(result.riskFactor)}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={`text-3xl font-bold ${getRiskColor(result.riskFactor)}`}>
                    {result.riskFactor}/100
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskBadge(result.riskFactor)}`}>
                    {getRiskLabel(result.riskFactor)}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        result.riskFactor < 30 ? 'bg-success' : 
                        result.riskFactor < 70 ? 'bg-warning' : 'bg-destructive'
                      }`}
                      style={{ width: `${result.riskFactor}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {result.confidence.toUpperCase()} {t("linkAnalyzer.confidence")} • {t("linkAnalyzer.securityAnalysis")}
                </p>
              </div>
            </div>

            {/* Concerns */}
            {result.concerns && result.concerns.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {t("linkAnalyzer.concerns")}
                </h4>
                <ul className="space-y-2">
                  {result.concerns.map((concern, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-destructive mt-1">•</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed Analysis */}
            <div>
              <h4 className="font-semibold mb-2">{t("linkAnalyzer.detailedAnalysis")}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {result.analysis}
              </p>
            </div>

            {/* Recommendation */}
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t("linkAnalyzer.recommendation")}
              </h4>
              <p className="text-sm">
                {result.recommendation}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card className="p-6 mt-6 bg-muted/30 border-dashed animate-in fade-in duration-700 delay-500">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          {t("linkAnalyzer.howItWorks")}
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{t("linkAnalyzer.feature1")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{t("linkAnalyzer.feature2")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{t("linkAnalyzer.feature3")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{t("linkAnalyzer.feature4")}</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};
