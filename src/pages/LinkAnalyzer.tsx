import { LinkAnalyzer as LinkAnalyzerComponent } from "@/components/LinkAnalyzer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import phononLogo from "@/assets/phonon-logo.jpeg";

const LinkAnalyzer = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img src={phononLogo} alt="Phonon Logo" className="w-8 h-8 object-contain" />
            <span className="font-display font-bold text-xl">Phonon AI</span>
          </button>
          
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-20">
        <LinkAnalyzerComponent />
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Phonon AI. All rights reserved.</p>
          <p className="mt-2">Your privacy is protected. No data is stored on our servers.</p>
        </div>
      </footer>
    </div>
  );
};

export default LinkAnalyzer;
