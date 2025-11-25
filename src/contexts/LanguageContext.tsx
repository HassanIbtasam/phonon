import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    "nav.title": "Phonon AI",
    "nav.scanner": "Scanner",
    "nav.dashboard": "Dashboard",
    
    // Hero
    "hero.title": "Phonon",
    "hero.subtitle": "Protect yourself from scams with AI-powered message analysis. Detect suspicious messages instantly.",
    "hero.cta": "Scan a Message Now",
    "hero.privacy.title": "Your Privacy is Protected",
    "hero.privacy.message": "We don't store your messages or personal information. All scam analysis happens in real-time using AI, and your data is immediately discarded after analysis. Your privacy and security are our top priorities.",
    "hero.feature1.title": "AI Protection",
    "hero.feature1.desc": "Advanced detection algorithms",
    "hero.feature2.title": "Instant Analysis",
    "hero.feature2.desc": "Real-time scam detection",
    "hero.feature3.title": "Privacy First",
    "hero.feature3.desc": "Your data stays secure",
    
    // Scanner
    "scanner.title": "Scan a Message",
    "scanner.subtitle": "Paste any suspicious message below for instant AI analysis",
    "scanner.label": "Message Content",
    "scanner.placeholder": "Paste the message you want to check here...",
    "scanner.phoneLabel": "Phone Number (Optional)",
    "scanner.phonePlaceholder": "Enter sender's phone number...",
    "scanner.button": "Scan Message",
    "scanner.analyzing": "Analyzing...",
    "scanner.empty": "Empty message",
    "scanner.emptyDesc": "Please enter a message to scan",
    "scanner.failed": "Scan failed",
    "scanner.failedDesc": "Failed to analyze message",
    "scanner.flagAsScam": "Flag as Scam",
    "scanner.flagAsSafe": "Flag as Safe",
    "scanner.flagSuccess": "Number flagged successfully",
    "scanner.flagError": "Failed to flag number",
    
    // Results
    "result.high": "High Risk - Likely Scam",
    "result.medium": "Medium Risk - Be Cautious",
    "result.low": "Low Risk - Appears Safe",
    "result.scanned": "Scanned",
    "result.analysis": "Analysis",
    
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Your scam protection analytics",
    "dashboard.totalScans": "Total Scans",
    "dashboard.highRisk": "High Risk",
    "dashboard.mediumRisk": "Medium Risk",
    "dashboard.lowRisk": "Low Risk",
    "dashboard.recentScans": "Recent Scans",
    "dashboard.noScans": "No scans yet. Start by scanning a message above.",
    
    // Footer
    "footer.copyright": "© 2024 Phonon AI. Protecting users with advanced AI detection.",
    "footer.disclaimer": "Always verify suspicious messages through official channels.",
  },
  ar: {
    // Navigation
    "nav.title": "فونون AI",
    "nav.scanner": "الماسح",
    "nav.dashboard": "لوحة التحكم",
    
    // Hero
    "hero.title": "فونون",
    "hero.subtitle": "احمِ نفسك من عمليات الاحتيال بتحليل الرسائل المدعوم بالذكاء الاصطناعي. اكتشف الرسائل المشبوهة على الفور.",
    "hero.cta": "امسح رسالة الآن",
    "hero.privacy.title": "خصوصيتك محمية",
    "hero.privacy.message": "نحن لا نحتفظ برسائلك أو معلوماتك الشخصية. يتم تحليل الاحتيال في الوقت الفعلي باستخدام الذكاء الاصطناعي، ويتم التخلص من بياناتك فوراً بعد التحليل. خصوصيتك وأمانك هما أولويتنا القصوى.",
    "hero.feature1.title": "حماية الذكاء الاصطناعي",
    "hero.feature1.desc": "خوارزميات كشف متقدمة",
    "hero.feature2.title": "تحليل فوري",
    "hero.feature2.desc": "كشف الاحتيال في الوقت الفعلي",
    "hero.feature3.title": "الخصوصية أولاً",
    "hero.feature3.desc": "بياناتك تبقى آمنة",
    
    // Scanner
    "scanner.title": "امسح رسالة",
    "scanner.subtitle": "الصق أي رسالة مشبوهة أدناه للتحليل الفوري بالذكاء الاصطناعي",
    "scanner.label": "محتوى الرسالة",
    "scanner.placeholder": "الصق الرسالة التي تريد فحصها هنا...",
    "scanner.phoneLabel": "رقم الهاتف (اختياري)",
    "scanner.phonePlaceholder": "أدخل رقم هاتف المرسل...",
    "scanner.button": "امسح الرسالة",
    "scanner.analyzing": "جارٍ التحليل...",
    "scanner.empty": "رسالة فارغة",
    "scanner.emptyDesc": "الرجاء إدخال رسالة للمسح",
    "scanner.failed": "فشل المسح",
    "scanner.failedDesc": "فشل في تحليل الرسالة",
    "scanner.flagAsScam": "وضع علامة كاحتيال",
    "scanner.flagAsSafe": "وضع علامة كآمن",
    "scanner.flagSuccess": "تم وضع علامة على الرقم بنجاح",
    "scanner.flagError": "فشل وضع علامة على الرقم",
    
    // Results
    "result.high": "خطر عالٍ - احتيال محتمل",
    "result.medium": "خطر متوسط - كن حذراً",
    "result.low": "خطر منخفض - يبدو آمناً",
    "result.scanned": "تم المسح",
    "result.analysis": "التحليل",
    
    // Dashboard
    "dashboard.title": "لوحة التحكم",
    "dashboard.subtitle": "تحليلات الحماية من الاحتيال الخاصة بك",
    "dashboard.totalScans": "إجمالي عمليات المسح",
    "dashboard.highRisk": "خطر عالٍ",
    "dashboard.mediumRisk": "خطر متوسط",
    "dashboard.lowRisk": "خطر منخفض",
    "dashboard.recentScans": "عمليات المسح الأخيرة",
    "dashboard.noScans": "لا توجد عمليات مسح بعد. ابدأ بمسح رسالة أعلاه.",
    
    // Footer
    "footer.copyright": "© 2024 فونون AI. حماية المستخدمين بالكشف المتقدم بالذكاء الاصطناعي.",
    "footer.disclaimer": "تحقق دائماً من الرسائل المشبوهة من خلال القنوات الرسمية.",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved === "ar" ? "ar" : "en") as Language;
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
