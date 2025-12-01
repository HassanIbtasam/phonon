import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Check, Zap, Crown, Rocket, Gift, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import phononLogo from "@/assets/phonon-logo.png";

interface SubscriptionPlan {
  id: string;
  tier: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: unknown;
  text_analysis_limit: number | null;
  screenshot_analysis_limit: number | null;
  link_analysis_limit: number | null;
  live_call_limit: number | null;
}

interface UserSubscription {
  plan_id: string;
  status: string;
  billing_period: string;
}

const Subscriptions = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadPlansAndSubscription();
  }, []);

  const loadPlansAndSubscription = async () => {
    try {
      // Load plans
      const { data: plansData, error: plansError } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price_monthly", { ascending: true });

      if (plansError) throw plansError;
      setPlans(plansData || []);

      // Load user subscription if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: subData } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();

        setUserSubscription(subData);
      }
    } catch (error) {
      console.error("Error loading subscriptions:", error);
      toast({
        title: t("pricing.error"),
        description: t("pricing.errorDesc"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "free":
        return <Gift className="w-8 h-8" />;
      case "basic":
        return <Zap className="w-8 h-8" />;
      case "pro":
        return <Rocket className="w-8 h-8" />;
      case "enterprise":
        return <Crown className="w-8 h-8" />;
      default:
        return <Zap className="w-8 h-8" />;
    }
  };

  const handleSelectPlan = async (planId: string, tier: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: t("pricing.authRequired"),
        description: t("pricing.signInRequired"),
      });
      navigate("/auth");
      return;
    }

    // For now, just show a success message
    toast({
      title: t("pricing.planSelected"),
      description: t("pricing.planSelectedDesc").replace("{tier}", tier),
    });
  };

  const formatLimit = (limit: number | null) => {
    if (limit === null) return "Unlimited";
    return limit.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-all cursor-pointer group"
          >
            <img src={phononLogo} alt="Phonon AI" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
            <span className="font-display font-bold text-xl text-foreground">{t("nav.title")}</span>
          </button>
          
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              size="lg"
              className="font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("pricing.backToHome")}
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-36 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-in fade-in slide-in-from-top duration-700">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {t("pricing.title")}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t("pricing.subtitle")}
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-16 animate-in fade-in duration-700 delay-100">
            <div className="bg-card/80 backdrop-blur-sm border-2 border-border/50 rounded-full p-1.5 flex gap-2 shadow-lg">
              <Button
                variant={billingPeriod === "monthly" ? "default" : "ghost"}
                onClick={() => setBillingPeriod("monthly")}
                size="lg"
                className={billingPeriod === "monthly" ? "bg-gradient-primary rounded-full px-8 font-semibold" : "rounded-full px-8 font-medium"}
              >
                {t("pricing.monthly")}
              </Button>
              <Button
                variant={billingPeriod === "yearly" ? "default" : "ghost"}
                onClick={() => setBillingPeriod("yearly")}
                size="lg"
                className={billingPeriod === "yearly" ? "bg-gradient-primary rounded-full px-8 font-semibold" : "rounded-full px-8 font-medium"}
              >
                {t("pricing.yearly")}
                <Badge className="ml-2 bg-success text-success-foreground font-semibold px-2">
                  {t("pricing.save")}
                </Badge>
              </Button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto animate-in fade-in duration-700 delay-200">
            {plans.map((plan, index) => {
              const isCurrentPlan = userSubscription?.plan_id === plan.id;
              const isPro = plan.tier.toLowerCase() === "pro";
              const price = billingPeriod === "monthly" ? plan.price_monthly : plan.price_yearly;
              
              return (
                <Card
                  key={plan.id}
                  className={`relative p-8 flex flex-col hover-scale transition-all duration-300 ${
                    isPro
                      ? "border-2 border-primary shadow-glow bg-gradient-to-b from-card to-card/50 scale-105"
                      : "border border-border/50 hover:border-primary/30 bg-card"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {isPro && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary border-0 px-4 py-1">
                      {t("pricing.popular")}
                    </Badge>
                  )}
                  
                  {isCurrentPlan && (
                    <Badge className="absolute -top-3 right-4 bg-success border-0 px-3 py-1 font-semibold">
                      {t("pricing.currentPlan")}
                    </Badge>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6 transition-transform hover:scale-110">
                      {getPlanIcon(plan.tier)}
                    </div>
                    <h3 className="font-display text-2xl font-bold mb-4 text-foreground">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-5xl font-bold text-foreground">${price}</span>
                      <span className="text-lg text-muted-foreground">
                        {t("pricing.perMonth")}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-border/50 mb-6" />

                  {/* Features List */}
                  <div className="flex-1 space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">
                        <strong className="font-semibold">{formatLimit(plan.text_analysis_limit)}</strong> {t("pricing.textScans")}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">
                        <strong className="font-semibold">{formatLimit(plan.screenshot_analysis_limit)}</strong> {t("pricing.screenshotScans")}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">
                        <strong className="font-semibold">{formatLimit(plan.link_analysis_limit)}</strong> {t("pricing.linkAnalyses")}
                      </span>
                    </div>
                    {plan.live_call_limit !== null && (
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">
                          <strong className="font-semibold">{formatLimit(plan.live_call_limit)}</strong> {t("pricing.liveCallScans")}
                        </span>
                      </div>
                    )}
                    
                    {Array.isArray(plan.features) && (plan.features as string[]).map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSelectPlan(plan.id, plan.tier)}
                    disabled={isCurrentPlan}
                    size="lg"
                    className={
                      isPro
                        ? "w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 font-semibold text-base"
                        : "w-full transition-all duration-300 font-semibold text-base"
                    }
                    variant={isCurrentPlan ? "outline" : "default"}
                  >
                    {isCurrentPlan
                      ? t("pricing.currentPlan")
                      : plan.tier.toLowerCase() === "basic"
                      ? t("pricing.getStarted")
                      : t("pricing.subscribe")}
                  </Button>
                </Card>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center animate-in fade-in duration-700 delay-300">
            <div className="max-w-3xl mx-auto bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-lg border-2 border-primary/20 rounded-2xl p-12 shadow-xl">
              <Crown className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h3 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
                {t("pricing.enterprise.title")}
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                {t("pricing.enterprise.desc")}
              </p>
              <Button size="lg" className="bg-gradient-primary hover:shadow-glow font-semibold text-base px-8">
                {t("pricing.enterprise.cta")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
