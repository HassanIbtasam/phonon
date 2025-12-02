import { useState, useRef } from "react";
import { Hero } from "@/components/Hero";
import { MessageScanner } from "@/components/MessageScanner";
import { LiveScamDetection } from "@/components/LiveScamDetection";
import { Dashboard } from "@/components/Dashboard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { FAQ } from "@/components/FAQ";
import { ScamStats } from "@/components/ScamStats";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScanLine, LayoutDashboard, Radio, Link as LinkIcon, Crown, Menu, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import phononLogo from "@/assets/phonon-logo.png";

type View = "hero" | "scanner" | "live" | "dashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setCurrentView("scanner");
    setTimeout(() => {
      scannerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleNavClick = (view: View) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const handleExternalNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const NavButton = ({ view, icon: Icon, label }: { view: View; icon: typeof ScanLine; label: string }) => (
    <Button
      variant={currentView === view ? "default" : "ghost"}
      onClick={() => handleNavClick(view)}
      className={`w-full justify-start md:w-auto md:justify-center ${currentView === view ? "bg-gradient-primary" : ""}`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <button 
            onClick={() => setCurrentView("hero")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img src={phononLogo} alt="Phonon Logo" className="w-8 h-8 object-contain" />
            <span className="font-display font-bold text-lg md:text-xl">{t("nav.title")}</span>
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <NavButton view="scanner" icon={ScanLine} label={t("nav.scanner")} />
            <NavButton view="live" icon={Radio} label={t("nav.live")} />
            <NavButton view="dashboard" icon={LayoutDashboard} label={t("nav.dashboard")} />
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
              {t("nav.pricing")}
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background border-border p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <span className="font-display font-bold text-lg">{t("nav.menu")}</span>
                  </div>
                  <div className="flex flex-col gap-1 p-4">
                    <Button
                      variant={currentView === "scanner" ? "default" : "ghost"}
                      onClick={() => handleNavClick("scanner")}
                      className={`w-full justify-start h-12 ${currentView === "scanner" ? "bg-gradient-primary" : ""}`}
                    >
                      <ScanLine className="w-5 h-5 mr-3" />
                      {t("nav.scanner")}
                    </Button>
                    <Button
                      variant={currentView === "live" ? "default" : "ghost"}
                      onClick={() => handleNavClick("live")}
                      className={`w-full justify-start h-12 ${currentView === "live" ? "bg-gradient-primary" : ""}`}
                    >
                      <Radio className="w-5 h-5 mr-3" />
                      {t("nav.live")}
                    </Button>
                    <Button
                      variant={currentView === "dashboard" ? "default" : "ghost"}
                      onClick={() => handleNavClick("dashboard")}
                      className={`w-full justify-start h-12 ${currentView === "dashboard" ? "bg-gradient-primary" : ""}`}
                    >
                      <LayoutDashboard className="w-5 h-5 mr-3" />
                      {t("nav.dashboard")}
                    </Button>
                    <div className="h-px bg-border my-2" />
                    <Button
                      variant="ghost"
                      onClick={() => handleExternalNav("/link-analyzer")}
                      className="w-full justify-start h-12"
                    >
                      <LinkIcon className="w-5 h-5 mr-3" />
                      {t("nav.linkAnalyzer")}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleExternalNav("/subscriptions")}
                      className="w-full justify-start h-12"
                    >
                      <Crown className="w-5 h-5 mr-3" />
                      {t("nav.pricing")}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

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