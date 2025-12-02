import { useState, useRef } from "react";
import { Hero } from "@/components/Hero";
import { MessageScanner } from "@/components/MessageScanner";
import { LiveScamDetection } from "@/components/LiveScamDetection";
import { Dashboard } from "@/components/Dashboard";
import { FAQ } from "@/components/FAQ";
import { ScamStats } from "@/components/ScamStats";
import { NavHeader } from "@/components/NavHeader";
import { ScanLine, LayoutDashboard, Radio, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type View = "hero" | "scanner" | "live" | "dashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("hero");
  const scannerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const handleGetStarted = () => {
    setCurrentView("scanner");
    setTimeout(() => {
      scannerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const navItems = [
    { id: "scanner", icon: ScanLine, labelKey: "nav.scanner", isActive: currentView === "scanner", onClick: () => setCurrentView("scanner") },
    { id: "live", icon: Radio, labelKey: "nav.live", isActive: currentView === "live", onClick: () => setCurrentView("live") },
    { id: "dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard", isActive: currentView === "dashboard", onClick: () => setCurrentView("dashboard") },
  ];

  return (
    <div className="min-h-screen">
      <NavHeader 
        variant="full" 
        navItems={navItems}
        onLogoClick={() => setCurrentView("hero")}
      />

      {/* Content */}
      <div className="pt-16 md:pt-20">
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

      {/* Feedback Section */}
      {currentView === "hero" && (
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Mail className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              {t("feedback.title")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("feedback.description")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("feedback.emailUs")}{" "}
              <a 
                href="mailto:support@phonon.live" 
                className="text-primary hover:underline font-medium"
              >
                support@phonon.live
              </a>
            </p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border mt-12 md:mt-20 py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs md:text-sm text-muted-foreground">
          <p>{t("footer.copyright")}</p>
          <p className="mt-2">{t("footer.disclaimer")}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
