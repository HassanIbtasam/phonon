import { useState, useRef } from "react";
import { Hero } from "@/components/Hero";
import { MessageScanner } from "@/components/MessageScanner";
import { Dashboard } from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import { Shield, ScanLine, LayoutDashboard } from "lucide-react";

type View = "hero" | "scanner" | "dashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("hero");
  const scannerRef = useRef<HTMLDivElement>(null);

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
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl">ScamShield AI</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={currentView === "scanner" ? "default" : "ghost"}
              onClick={() => setCurrentView("scanner")}
              className={currentView === "scanner" ? "bg-gradient-primary" : ""}
            >
              <ScanLine className="w-4 h-4 mr-2" />
              Scanner
            </Button>
            <Button
              variant={currentView === "dashboard" ? "default" : "ghost"}
              onClick={() => setCurrentView("dashboard")}
              className={currentView === "dashboard" ? "bg-gradient-primary" : ""}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-20">
        {currentView === "hero" && <Hero onGetStarted={handleGetStarted} />}
        {currentView === "scanner" && (
          <div ref={scannerRef}>
            <MessageScanner />
          </div>
        )}
        {currentView === "dashboard" && <Dashboard />}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 ScamShield AI. Protecting users with advanced AI detection.</p>
          <p className="mt-2">Always verify suspicious messages through official channels.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
