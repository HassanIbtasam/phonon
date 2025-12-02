import { Mail, Instagram } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <>
      {/* Feedback Section */}
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <p>
              {t("feedback.emailUs")}{" "}
              <a 
                href="mailto:support@phonon.live" 
                className="text-primary hover:underline font-medium"
              >
                support@phonon.live
              </a>
            </p>
            <span className="hidden sm:inline text-border">|</span>
            <a 
              href="https://instagram.com/phonon.live" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline font-medium"
            >
              <Instagram className="w-4 h-4" />
              @phonon.live
            </a>
          </div>
        </div>
      </section>

      {/* Copyright Footer */}
      <footer className="border-t border-border py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs md:text-sm text-muted-foreground">
          <p>{t("footer.copyright")}</p>
          <p className="mt-2">{t("footer.disclaimer")}</p>
        </div>
      </footer>
    </>
  );
};
