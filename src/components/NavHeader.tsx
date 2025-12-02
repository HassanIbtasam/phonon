import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScanLine, LayoutDashboard, Radio, Link as LinkIcon, Crown, Menu, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import phononLogo from "@/assets/phonon-logo.png";

interface NavItem {
  id: string;
  icon: typeof ScanLine;
  labelKey: string;
  isActive?: boolean;
  onClick?: () => void;
}

interface NavHeaderProps {
  navItems?: NavItem[];
  onLogoClick?: () => void;
}

export const NavHeader = ({ 
  navItems = [],
  onLogoClick
}: NavHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isRTL = language === "ar";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    navigate("/");
  };

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

  const isActivePage = (path: string) => location.pathname === path;

  // Default nav items for pages that don't provide their own
  const defaultNavItems: NavItem[] = [
    { id: "scanner", icon: ScanLine, labelKey: "nav.scanner", onClick: () => navigate("/") },
    { id: "live", icon: Radio, labelKey: "nav.live", onClick: () => navigate("/") },
    { id: "dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard", onClick: () => navigate("/") },
  ];

  const displayNavItems = navItems.length > 0 ? navItems : defaultNavItems;

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
          
          {/* Internal Nav Items */}
          {displayNavItems.map((item) => (
            <Button
              key={item.id}
              variant={item.isActive ? "default" : "ghost"}
              onClick={item.onClick}
              className={item.isActive ? "bg-gradient-primary" : ""}
            >
              <item.icon className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
              {t(item.labelKey)}
            </Button>
          ))}
          
          {/* External Links */}
          <Button 
            variant={isActivePage("/link-analyzer") ? "default" : "ghost"} 
            onClick={() => navigate("/link-analyzer")}
            className={isActivePage("/link-analyzer") ? "bg-gradient-primary" : ""}
          >
            <LinkIcon className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            {t("nav.linkAnalyzer")}
          </Button>
          <Button 
            variant={isActivePage("/subscriptions") ? "default" : "ghost"} 
            onClick={() => navigate("/subscriptions")}
            className={isActivePage("/subscriptions") ? "bg-gradient-primary" : ""}
          >
            <Crown className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            {t("nav.pricing")}
          </Button>
          {user ? (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate("/history")}
                className="border-primary/50"
              >
                <User className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                {t("nav.myAccount")}
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-primary/50 hover:bg-primary/10"
              >
                <LogOut className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                {t("nav.logout")}
              </Button>
            </>
          ) : (
            <Button
              variant={isActivePage("/auth") ? "default" : "outline"}
              onClick={() => navigate("/auth")}
              className={isActivePage("/auth") ? "bg-gradient-primary" : "border-primary/50 hover:bg-primary/10"}
            >
              <User className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
              {t("nav.login")}
            </Button>
          )}
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
            <SheetContent side={isRTL ? "left" : "right"} className="w-[280px] bg-background border-border p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <span className="font-display font-bold text-lg">{t("nav.menu")}</span>
                </div>
                <div className="flex flex-col gap-1 p-4">
                  {/* Internal Nav Items */}
                  {displayNavItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={item.isActive ? "default" : "ghost"}
                      onClick={() => {
                        item.onClick?.();
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full justify-start h-12 ${item.isActive ? "bg-gradient-primary" : ""}`}
                    >
                      <item.icon className="w-5 h-5 ltr:mr-3 rtl:ml-3" />
                      {t(item.labelKey)}
                    </Button>
                  ))}
                  
                  <div className="h-px bg-border my-2" />
                  
                  {/* External Links */}
                  <Button
                    variant={isActivePage("/link-analyzer") ? "default" : "ghost"}
                    onClick={() => handleExternalNav("/link-analyzer")}
                    className={`w-full justify-start h-12 ${isActivePage("/link-analyzer") ? "bg-gradient-primary" : ""}`}
                  >
                    <LinkIcon className="w-5 h-5 ltr:mr-3 rtl:ml-3" />
                    {t("nav.linkAnalyzer")}
                  </Button>
                  <Button
                    variant={isActivePage("/subscriptions") ? "default" : "ghost"}
                    onClick={() => handleExternalNav("/subscriptions")}
                    className={`w-full justify-start h-12 ${isActivePage("/subscriptions") ? "bg-gradient-primary" : ""}`}
                  >
                    <Crown className="w-5 h-5 ltr:mr-3 rtl:ml-3" />
                    {t("nav.pricing")}
                  </Button>
                  <div className="h-px bg-border my-2" />
                  {user ? (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => handleExternalNav("/history")}
                        className="w-full justify-start h-12"
                      >
                        <User className="w-5 h-5 ltr:mr-3 rtl:ml-3" />
                        {t("nav.myAccount")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full justify-start h-12 border-primary/50"
                      >
                        <LogOut className="w-5 h-5 ltr:mr-3 rtl:ml-3" />
                        {t("nav.logout")}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant={isActivePage("/auth") ? "default" : "outline"}
                      onClick={() => handleExternalNav("/auth")}
                      className={`w-full justify-start h-12 ${isActivePage("/auth") ? "bg-gradient-primary" : "border-primary/50"}`}
                    >
                      <User className="w-5 h-5 ltr:mr-3 rtl:ml-3" />
                      {t("nav.login")}
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
