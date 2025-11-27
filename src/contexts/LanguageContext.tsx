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
    "scanner.textTab": "Text Message",
    "scanner.screenshotTab": "Screenshot",
    
    // Screenshot Scanner
    "screenshot.title": "Screenshot Analysis",
    "screenshot.subtitle": "Upload a screenshot of any conversation to detect scams",
    "screenshot.uploadPrompt": "Click to upload a screenshot",
    "screenshot.supportedFormats": "Supports JPG, PNG, WebP (max 10MB)",
    "screenshot.analyze": "Analyze Screenshot",
    "screenshot.analyzing": "Analyzing...",
    "screenshot.clear": "Clear",
    "screenshot.error": "Error",
    "screenshot.invalidFile": "Please upload a valid image file",
    "screenshot.fileTooLarge": "File size must be less than 10MB",
    "screenshot.analysisComplete": "Analysis Complete",
    "screenshot.resultsReady": "Your screenshot has been analyzed",
    "screenshot.analysisFailed": "Could not analyze the screenshot. Please try again.",
    "screenshot.risk": "Risk",
    "screenshot.confidence": "Confidence",
    "screenshot.scamType": "Scam Type",
    "screenshot.reasoning": "Analysis",
    "screenshot.redFlags": "Red Flags",
    "screenshot.recommendations": "Recommendations",
    
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
    "footer.copyright": "© 2025 Phonon AI. Protecting users with advanced AI detection.",
    "footer.disclaimer": "Always verify suspicious messages through official channels.",
    
    // Live Detection
    "live.title": "Live Scam Detection",
    "live.subtitle": "Real-time protection during phone calls",
    "live.privacyTitle": "Your Privacy is Protected",
    "live.privacyMessage": "Your calls are NOT recorded or stored. Our AI analyzes audio in real-time only. The moment your call ends, all audio data is immediately and permanently discarded. No sensitive information, conversation content, or personal data is ever kept. Your privacy and security are our highest priorities.",
    "live.permissionRequired": "Microphone Permission Required",
    "live.permissionExplanation": "To monitor calls in real-time, we need access to your microphone. Put your phone on speaker and let our AI listen and protect you.",
    "live.grantPermission": "Grant Microphone Access",
    "live.permissionGranted": "Permission Granted",
    "live.permissionDesc": "You can now use live scam detection",
    "live.permissionDenied": "Permission Denied",
    "live.permissionDeniedDesc": "Microphone access is required for live detection",
    "live.ready": "Ready to Monitor",
    "live.monitoring": "Monitoring Call",
    "live.recordingStarted": "Recording Started",
    "live.recordingDesc": "AI is now monitoring the call",
    "live.recordingFailed": "Recording Failed",
    "live.recordingFailedDesc": "Could not start recording",
    "live.recordingStopped": "Recording Stopped",
    "live.recordingStoppedDesc": "Monitoring has ended",
    "live.clickToStart": "Tap the button to start monitoring your call. Put your phone on speaker for best results.",
    "live.recordingInProgress": "AI is actively listening and analyzing the conversation in real-time.",
    "live.analyzing": "Analyzing...",
    "live.transcript": "Live Transcript & Analysis",
    "live.highRiskDetected": "⚠️ High Risk Detected!",
    "live.tip": "Tip: Put your phone on speaker mode and place it near your ear during the call. The AI will listen and alert you if it detects scam indicators.",
    
    // FAQ
    "faq.title": "Frequently Asked Questions",
    "faq.subtitle": "Everything you need to know about our scam detection service",
    "faq.q1": "How does the AI scam detection work?",
    "faq.a1": "Our advanced AI powered by Google Gemini analyzes message patterns, sender behavior, urgency tactics, and linguistic cues specific to the Middle East region. It compares messages against known scam patterns from Qatar, UAE, Saudi Arabia, and other regional countries to provide accurate risk assessments.",
    "faq.q2": "Is my personal data stored or shared?",
    "faq.a2": "Absolutely not. We prioritize your privacy. All message analysis happens in real-time on secure servers, and no personal information or message content is stored after analysis. Your data is immediately discarded once the scan is complete.",
    "faq.q3": "What types of scams can it detect?",
    "faq.a3": "Our AI detects a wide range of scams including banking fraud, government impersonation, delivery scams, telecom fraud, investment schemes, prize scams, and romance scams. It's specially trained to recognize both common and uncommon scam patterns targeting Middle Eastern users.",
    "faq.q4": "Is this service free to use?",
    "faq.a4": "Yes! Our scam detection service is completely free. We believe everyone deserves protection from fraud. Simply paste any suspicious message and get instant AI-powered analysis at no cost.",
    "faq.q5": "How accurate is the detection?",
    "faq.a5": "Our AI uses state-of-the-art language models trained on regional scam patterns with high accuracy. However, we always recommend using the detection as a helpful guide and verifying suspicious messages through official channels when possible.",
    "faq.q6": "What languages are supported?",
    "faq.a6": "We support both English and Arabic, with full understanding of regional dialects and terminology used across the Middle East. The AI can analyze messages in either language with equal effectiveness.",
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
    "scanner.textTab": "رسالة نصية",
    "scanner.screenshotTab": "لقطة شاشة",
    
    // Screenshot Scanner
    "screenshot.title": "تحليل لقطة الشاشة",
    "screenshot.subtitle": "قم بتحميل لقطة شاشة لأي محادثة للكشف عن الاحتيال",
    "screenshot.uploadPrompt": "انقر لتحميل لقطة شاشة",
    "screenshot.supportedFormats": "يدعم JPG، PNG، WebP (حد أقصى 10 ميجابايت)",
    "screenshot.analyze": "تحليل لقطة الشاشة",
    "screenshot.analyzing": "جارٍ التحليل...",
    "screenshot.clear": "مسح",
    "screenshot.error": "خطأ",
    "screenshot.invalidFile": "الرجاء تحميل ملف صورة صالح",
    "screenshot.fileTooLarge": "يجب أن يكون حجم الملف أقل من 10 ميجابايت",
    "screenshot.analysisComplete": "اكتمل التحليل",
    "screenshot.resultsReady": "تم تحليل لقطة الشاشة الخاصة بك",
    "screenshot.analysisFailed": "تعذر تحليل لقطة الشاشة. يرجى المحاولة مرة أخرى.",
    "screenshot.risk": "الخطر",
    "screenshot.confidence": "الثقة",
    "screenshot.scamType": "نوع الاحتيال",
    "screenshot.reasoning": "التحليل",
    "screenshot.redFlags": "علامات التحذير",
    "screenshot.recommendations": "التوصيات",
    
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
    "footer.copyright": "© 2025 فونون AI. حماية المستخدمين بالكشف المتقدم بالذكاء الاصطناعي.",
    "footer.disclaimer": "تحقق دائماً من الرسائل المشبوهة من خلال القنوات الرسمية.",
    
    // Live Detection
    "live.title": "الكشف المباشر عن الاحتيال",
    "live.subtitle": "حماية في الوقت الفعلي أثناء المكالمات الهاتفية",
    "live.privacyTitle": "خصوصيتك محمية",
    "live.privacyMessage": "مكالماتك لا يتم تسجيلها أو تخزينها. يقوم الذكاء الاصطناعي لدينا بتحليل الصوت في الوقت الفعلي فقط. بمجرد انتهاء مكالمتك، يتم التخلص من جميع بيانات الصوت فوراً ونهائياً. لا يتم الاحتفاظ بأي معلومات حساسة أو محتوى محادثة أو بيانات شخصية على الإطلاق. خصوصيتك وأمانك هما أولويتنا القصوى.",
    "live.permissionRequired": "مطلوب إذن الميكروفون",
    "live.permissionExplanation": "لمراقبة المكالمات في الوقت الفعلي، نحتاج إلى الوصول إلى الميكروفون الخاص بك. ضع هاتفك على مكبر الصوت ودع الذكاء الاصطناعي يستمع ويحميك.",
    "live.grantPermission": "منح الوصول إلى الميكروفون",
    "live.permissionGranted": "تم منح الإذن",
    "live.permissionDesc": "يمكنك الآن استخدام الكشف المباشر عن الاحتيال",
    "live.permissionDenied": "تم رفض الإذن",
    "live.permissionDeniedDesc": "الوصول إلى الميكروفون مطلوب للكشف المباشر",
    "live.ready": "جاهز للمراقبة",
    "live.monitoring": "مراقبة المكالمة",
    "live.recordingStarted": "بدأ التسجيل",
    "live.recordingDesc": "الذكاء الاصطناعي يراقب المكالمة الآن",
    "live.recordingFailed": "فشل التسجيل",
    "live.recordingFailedDesc": "تعذر بدء التسجيل",
    "live.recordingStopped": "توقف التسجيل",
    "live.recordingStoppedDesc": "انتهت المراقبة",
    "live.clickToStart": "انقر على الزر لبدء مراقبة مكالمتك. ضع هاتفك على مكبر الصوت للحصول على أفضل النتائج.",
    "live.recordingInProgress": "الذكاء الاصطناعي يستمع ويحلل المحادثة بنشاط في الوقت الفعلي.",
    "live.analyzing": "جارٍ التحليل...",
    "live.transcript": "النص المباشر والتحليل",
    "live.highRiskDetected": "⚠️ تم اكتشاف خطر عالٍ!",
    "live.tip": "نصيحة: ضع هاتفك على وضع مكبر الصوت وضعه بالقرب من أذنك أثناء المكالمة. سيستمع الذكاء الاصطناعي وينبهك إذا اكتشف مؤشرات احتيال.",
    
    // FAQ
    "faq.title": "الأسئلة الشائعة",
    "faq.subtitle": "كل ما تحتاج معرفته عن خدمة كشف الاحتيال لدينا",
    "faq.q1": "كيف يعمل الكشف عن الاحتيال بالذكاء الاصطناعي؟",
    "faq.a1": "يقوم الذكاء الاصطناعي المتقدم لدينا المدعوم بجوجل جيميني بتحليل أنماط الرسائل، وسلوك المرسل، وتكتيكات الاستعجال، والإشارات اللغوية الخاصة بمنطقة الشرق الأوسط. يقارن الرسائل مع أنماط الاحتيال المعروفة من قطر والإمارات والسعودية ودول المنطقة الأخرى لتوفير تقييمات دقيقة للمخاطر.",
    "faq.q2": "هل يتم تخزين أو مشاركة بياناتي الشخصية؟",
    "faq.a2": "بالتأكيد لا. نحن نولي أهمية قصوى لخصوصيتك. يتم تحليل جميع الرسائل في الوقت الفعلي على خوادم آمنة، ولا يتم تخزين أي معلومات شخصية أو محتوى رسائل بعد التحليل. يتم التخلص من بياناتك فوراً بمجرد اكتمال الفحص.",
    "faq.q3": "ما أنواع عمليات الاحتيال التي يمكنه كشفها؟",
    "faq.a3": "يكتشف الذكاء الاصطناعي لدينا مجموعة واسعة من عمليات الاحتيال بما في ذلك الاحتيال المصرفي، وانتحال هوية الحكومة، وعمليات احتيال التوصيل، والاحتيال في الاتصالات، ومخططات الاستثمار، وعمليات احتيال الجوائز، وعمليات الاحتيال العاطفي. تم تدريبه خصيصاً للتعرف على أنماط الاحتيال الشائعة وغير الشائعة التي تستهدف مستخدمي الشرق الأوسط.",
    "faq.q4": "هل هذه الخدمة مجانية؟",
    "faq.a4": "نعم! خدمة كشف الاحتيال لدينا مجانية تماماً. نؤمن بأن الجميع يستحق الحماية من الاحتيال. ما عليك سوى لصق أي رسالة مشبوهة والحصول على تحليل فوري بالذكاء الاصطناعي دون أي تكلفة.",
    "faq.q5": "ما مدى دقة الكشف؟",
    "faq.a5": "يستخدم الذكاء الاصطناعي لدينا نماذج لغوية متطورة مدربة على أنماط الاحتيال الإقليمية بدقة عالية. ومع ذلك، نوصي دائماً باستخدام الكشف كدليل مفيد والتحقق من الرسائل المشبوهة من خلال القنوات الرسمية عند الإمكان.",
    "faq.q6": "ما اللغات المدعومة؟",
    "faq.a6": "ندعم كلاً من الإنجليزية والعربية، مع الفهم الكامل للهجات الإقليمية والمصطلحات المستخدمة في جميع أنحاء الشرق الأوسط. يمكن للذكاء الاصطناعي تحليل الرسائل بأي من اللغتين بنفس الفعالية.",
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
