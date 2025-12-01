import { Zap, Lock, ScanLine, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import phononLogo from "@/assets/phonon-logo.jpeg";
import { ScamStats } from "@/components/ScamStats";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-6 animate-in fade-in slide-in-from-top duration-700">
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur-3xl opacity-40" />
            <img src={phononLogo} alt="Phonon Logo" className="w-32 h-32 object-contain relative z-10" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom duration-700 delay-100">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            {t("hero.title")}
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom duration-700 delay-200">
          {t("hero.subtitle")}
        </p>

        {/* CTA Button */}
        <div className="pt-4 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          <Button
            size="lg"
            onClick={onGetStarted}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg px-8 py-6 font-semibold"
          >
            <Zap className="w-5 h-5 mr-2" />
            {t("hero.cta")}
          </Button>
        </div>

        {/* Privacy Disclaimer */}
        <div className="pt-8 animate-in fade-in duration-700 delay-400">
          <div className="max-w-2xl mx-auto bg-card/70 backdrop-blur-sm border border-primary/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div className="text-left">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  {t("hero.privacy.title")}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("hero.privacy.message")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 animate-in fade-in duration-700 delay-500">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <ScanLine className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-display font-semibold mb-2">{t("hero.feature1.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("hero.feature1.desc")}</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <Zap className="w-8 h-8 text-warning mx-auto mb-3" />
            <h3 className="font-display font-semibold mb-2">{t("hero.feature2.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("hero.feature2.desc")}</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <Lock className="w-8 h-8 text-success mx-auto mb-3" />
            <h3 className="font-display font-semibold mb-2">{t("hero.feature3.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("hero.feature3.desc")}</p>
          </div>
        </div>
      </div>

      {/* Scam Statistics Section */}
      <ScamStats />
    </div>
  );
};
