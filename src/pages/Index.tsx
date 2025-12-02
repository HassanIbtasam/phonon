import { useState, useRef } from "react";
import { Hero } from "@/components/Hero";
import { MessageScanner } from "@/components/MessageScanner";
import { LiveScamDetection } from "@/components/LiveScamDetection";
import { Dashboard } from "@/components/Dashboard";
import { FAQ } from "@/components/FAQ";
import { ScamStats } from "@/components/ScamStats";
import { NavHeader } from "@/components/NavHeader";
import { Footer } from "@/components/Footer";
import { ScanLine, LayoutDashboard, Radio } from "lucide-react";
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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
