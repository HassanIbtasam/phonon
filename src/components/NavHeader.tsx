import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScanLine, LayoutDashboard, Radio, Link as LinkIcon, Crown, Menu, User, ArrowLeft } from "lucide-react";
import phononLogo from "@/assets/phonon-logo.png";

interface NavItem {
  id: string;
  icon: typeof ScanLine;
  labelKey: string;
  isActive?: boolean;
  onClick?: () => void;
}

interface NavHeaderProps {
  variant?: "full" | "simple";
  navItems?: NavItem[];
  showBackButton?: boolean;
  onLogoClick?: () => void;
}

export const NavHeader = ({ 
  variant = "simple", 
  navItems = [],
  showBackButton = false,
  onLogoClick
}: NavHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      navigate("/");
    }
  };

  const handleExternalNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={handleLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <img src={phononLogo} alt="Phonon Logo" className="w-8 h-8 object-contain" />
          <span className="font-display font-bold text-lg md:text-xl">{t("nav.title")}</span>
        </button>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          
          {/* Internal Nav Items (for Index page) */}
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={item.isActive ? "default" : "ghost"}
              onClick={item.onClick}
              className={item.isActive ? "bg-gradient-primary" : ""}
            >
              <item.icon className="w-4 h-4 mr-2" />
              {t(item.labelKey)}
            </Button>
          ))}
          
          {/* External Links */}
          {variant === "full" && (
            <>
              <Button variant="ghost" onClick={() => navigate("/link-analyzer")}>
                <LinkIcon className="w-4 h-4 mr-2" />
                {t("nav.linkAnalyzer")}
              </Button>
              <Button variant="ghost" onClick={() => navigate("/subscriptions")}>
                <Crown className="w-4 h-4 mr-2" />
                {t("nav.pricing")}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/auth")}
                className="border-primary/50 hover:bg-primary/10"
              >
                <User className="w-4 h-4 mr-2" />
                {t("nav.login")}
              </Button>
            </>
          )}
          
          {/* Back Button for simple pages */}
          {showBackButton && (
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("nav.backToHome")}
            </Button>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          
          {variant === "full" ? (
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
                    {/* Internal Nav Items */}
                    {navItems.map((item) => (
                      <Button
                        key={item.id}
                        variant={item.isActive ? "default" : "ghost"}
                        onClick={() => {
                          item.onClick?.();
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full justify-start h-12 ${item.isActive ? "bg-gradient-primary" : ""}`}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        {t(item.labelKey)}
                      </Button>
                    ))}
                    
                    {navItems.length > 0 && <div className="h-px bg-border my-2" />}
                    
                    {/* External Links */}
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
                    <div className="h-px bg-border my-2" />
                    <Button
                      variant="outline"
                      onClick={() => handleExternalNav("/auth")}
                      className="w-full justify-start h-12 border-primary/50"
                    >
                      <User className="w-5 h-5 mr-3" />
                      {t("nav.login")}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            showBackButton && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )
          )}
        </div>
      </div>
    </nav>
  );
};
