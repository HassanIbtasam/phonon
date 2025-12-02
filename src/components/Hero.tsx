import { Zap, Lock, ScanLine, Shield, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import phononLogo from "@/assets/phonon-logo.png";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="relative min-h-[calc(100vh-4rem)] md:min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6 md:space-y-8 py-12 md:py-20">
        {/* Beta Disclaimer */}
        <div className="animate-in fade-in slide-in-from-top duration-500 px-2">
          <Alert className="max-w-2xl mx-auto bg-warning/10 border-warning/30 text-left">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-xs md:text-sm text-muted-foreground">
              {t("hero.betaDisclaimer")}
            </AlertDescription>
          </Alert>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-4 md:mb-6 animate-in fade-in slide-in-from-top duration-700">
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur-3xl opacity-40" />
            <img src={phononLogo} alt="Phonon Logo" className="w-20 h-20 md:w-32 md:h-32 object-contain relative z-10" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom duration-700 delay-100 px-2">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            {t("hero.title")}
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom duration-700 delay-200 px-4">
          {t("hero.subtitle")}
        </p>

        {/* CTA Button */}
        <div className="pt-2 md:pt-4 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          <Button
            size="lg"
            onClick={onGetStarted}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-base md:text-lg px-6 md:px-8 py-5 md:py-6 font-semibold"
          >
            <Zap className="w-5 h-5 mr-2" />
            {t("hero.cta")}
          </Button>
        </div>

        {/* Privacy Disclaimer */}
        <div className="pt-6 md:pt-8 animate-in fade-in duration-700 delay-400 px-2">
          <div className="max-w-2xl mx-auto bg-card/70 backdrop-blur-sm border border-primary/30 rounded-xl p-4 md:p-6">
            <div className="flex items-start gap-3 md:gap-4">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0 mt-0.5 md:mt-1" />
              <div className="text-left">
                <h4 className="font-semibold text-foreground text-sm md:text-base mb-1 md:mb-2 flex items-center gap-2">
                  {t("hero.privacy.title")}
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {t("hero.privacy.message")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 pt-8 md:pt-12 animate-in fade-in duration-700 delay-500 px-2">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 md:p-6 hover:border-primary/50 transition-all hover-scale">
            <ScanLine className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2 md:mb-3" />
            <h3 className="font-display font-semibold text-sm md:text-base mb-1 md:mb-2">{t("hero.feature1.title")}</h3>
            <p className="text-xs md:text-sm text-muted-foreground">{t("hero.feature1.desc")}</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 md:p-6 hover:border-primary/50 transition-all hover-scale">
            <Zap className="w-6 h-6 md:w-8 md:h-8 text-warning mx-auto mb-2 md:mb-3" />
            <h3 className="font-display font-semibold text-sm md:text-base mb-1 md:mb-2">{t("hero.feature2.title")}</h3>
            <p className="text-xs md:text-sm text-muted-foreground">{t("hero.feature2.desc")}</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 md:p-6 hover:border-primary/50 transition-all hover-scale">
            <Lock className="w-6 h-6 md:w-8 md:h-8 text-success mx-auto mb-2 md:mb-3" />
            <h3 className="font-display font-semibold text-sm md:text-base mb-1 md:mb-2">{t("hero.feature3.title")}</h3>
            <p className="text-xs md:text-sm text-muted-foreground">{t("hero.feature3.desc")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
