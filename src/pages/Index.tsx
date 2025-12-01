import { useState, useRef } from "react";
import { Hero } from "@/components/Hero";
import { MessageScanner } from "@/components/MessageScanner";
import { LiveScamDetection } from "@/components/LiveScamDetection";
import { Dashboard } from "@/components/Dashboard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { FAQ } from "@/components/FAQ";
import { ScamStats } from "@/components/ScamStats";
import { Button } from "@/components/ui/button";
import { ScanLine, LayoutDashboard, Radio, Link as LinkIcon, Crown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import phononLogo from "@/assets/phonon-logo.png";

type View = "hero" | "scanner" | "live" | "dashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("hero");
  const scannerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setCurrentView("scanner");
    setTimeout(() => {
      scannerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => setCurrentView("hero")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img src={phononLogo} alt="Phonon Logo" className="w-8 h-8 object-contain" />
            <span className="font-display font-bold text-xl">{t("nav.title")}</span>
          </button>
          
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              variant={currentView === "scanner" ? "default" : "ghost"}
              onClick={() => setCurrentView("scanner")}
              className={currentView === "scanner" ? "bg-gradient-primary" : ""}
            >
              <ScanLine className="w-4 h-4 mr-2" />
              {t("nav.scanner")}
            </Button>
            <Button
              variant={currentView === "live" ? "default" : "ghost"}
              onClick={() => setCurrentView("live")}
              className={currentView === "live" ? "bg-gradient-primary" : ""}
            >
              <Radio className="w-4 h-4 mr-2" />
              {t("nav.live")}
            </Button>
            <Button
              variant={currentView === "dashboard" ? "default" : "ghost"}
              onClick={() => setCurrentView("dashboard")}
              className={currentView === "dashboard" ? "bg-gradient-primary" : ""}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              {t("nav.dashboard")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/link-analyzer")}
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              {t("nav.linkAnalyzer")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/subscriptions")}
            >
              <Crown className="w-4 h-4 mr-2" />
              {t("nav.pricing") || "Pricing"}
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-20">
        {currentView === "hero" && (
          <>
            <Hero onGetStarted={handleGetStarted} />
            <ScamStats />
          </>
        )}
        {currentView === "scanner" && (
          <div ref={scannerRef}>
            <MessageScanner />
          </div>
        )}
        {currentView === "live" && <LiveScamDetection />}
        {currentView === "dashboard" && <Dashboard />}
      </div>

      {/* FAQ Section - Only show on hero view */}
      {currentView === "hero" && <FAQ />}

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>{t("footer.copyright")}</p>
          <p className="mt-2">{t("footer.disclaimer")}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
