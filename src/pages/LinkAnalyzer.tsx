import { LinkAnalyzer as LinkAnalyzerComponent } from "@/components/LinkAnalyzer";
import { NavHeader } from "@/components/NavHeader";
import { useLanguage } from "@/contexts/LanguageContext";

const LinkAnalyzer = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <NavHeader variant="full" showBackButton />

      {/* Content */}
      <div className="pt-20">
        <LinkAnalyzerComponent />
      </div>

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

export default LinkAnalyzer;
