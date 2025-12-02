import { LinkAnalyzer as LinkAnalyzerComponent } from "@/components/LinkAnalyzer";
import { NavHeader } from "@/components/NavHeader";
import { Footer } from "@/components/Footer";

const LinkAnalyzer = () => {
  return (
    <div className="min-h-screen">
      <NavHeader />

      {/* Content */}
      <div className="pt-20">
        <LinkAnalyzerComponent />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LinkAnalyzer;
