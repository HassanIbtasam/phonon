import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const LiveScamDetection = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
          {t("live.title")}
        </h1>
        <p className="text-muted-foreground text-lg">
          Coming Soon
        </p>
      </div>

      <Card className="p-12 text-center border-primary/20">
        <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Feature In Development</h3>
        <p className="text-muted-foreground">
          Live call monitoring will be available in a future update.
        </p>
      </Card>
    </div>
  );
};
