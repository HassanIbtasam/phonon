import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Image as ImageIcon, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  riskLevel: "low" | "medium" | "high";
  confidence: number;
  scamType: string;
  reasoning: string;
  redFlags: string[];
  recommendations: string[];
}

export const ScreenshotScanner = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: t("screenshot.error"),
        description: t("screenshot.invalidFile"),
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: t("screenshot.error"),
        description: t("screenshot.fileTooLarge"),
        variant: "destructive",
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSelectedImage(base64);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeScreenshot = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-screenshot', {
        body: { 
          image: selectedImage,
          language 
        }
      });

      if (error) throw error;

      setAnalysisResult(data);
      
      toast({
        title: t("screenshot.analysisComplete"),
        description: t("screenshot.resultsReady"),
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: t("screenshot.error"),
        description: t("screenshot.analysisFailed"),
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "high": return <XCircle className="w-6 h-6 text-destructive" />;
      case "medium": return <AlertTriangle className="w-6 h-6 text-warning" />;
      case "low": return <CheckCircle className="w-6 h-6 text-success" />;
      default: return null;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "border-destructive bg-destructive/10";
      case "medium": return "border-warning bg-warning/10";
      case "low": return "border-success bg-success/10";
      default: return "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          {t("screenshot.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("screenshot.subtitle")}
        </p>
      </div>

      {/* Upload Section */}
      <Card className="p-6 mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {!selectedImage ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">{t("screenshot.uploadPrompt")}</p>
            <p className="text-sm text-muted-foreground">{t("screenshot.supportedFormats")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img src={selectedImage} alt="Preview" className="w-full h-auto" />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={analyzeScreenshot}
                disabled={isAnalyzing}
                className="flex-1 bg-gradient-primary"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("screenshot.analyzing")}
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {t("screenshot.analyze")}
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setSelectedImage(null);
                  setAnalysisResult(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                variant="outline"
              >
                {t("screenshot.clear")}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Results Section */}
      {analysisResult && (
        <Card className={`p-6 border-2 ${getRiskColor(analysisResult.riskLevel)}`}>
          <div className="flex items-start gap-4 mb-4">
            {getRiskIcon(analysisResult.riskLevel)}
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">
                {t(`scanner.${analysisResult.riskLevel}`)} {t("screenshot.risk")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("screenshot.confidence")}: {analysisResult.confidence}%
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{t("screenshot.scamType")}</h4>
              <p className="text-muted-foreground">{analysisResult.scamType}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">{t("screenshot.reasoning")}</h4>
              <p className="text-muted-foreground whitespace-pre-line">{analysisResult.reasoning}</p>
            </div>

            {analysisResult.redFlags.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">{t("screenshot.redFlags")}</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysisResult.redFlags.map((flag, idx) => (
                    <li key={idx} className="text-muted-foreground">{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.recommendations.length > 0 && (
              <Alert>
                <AlertDescription>
                  <h4 className="font-semibold mb-2">{t("screenshot.recommendations")}</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysisResult.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
