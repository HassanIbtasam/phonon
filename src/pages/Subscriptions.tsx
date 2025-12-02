import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { NavHeader } from "@/components/NavHeader";
import { Check, Zap, Crown, Rocket, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      const { data: plansData, error: plansError } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price_monthly", { ascending: true });

      if (plansError) throw plansError;
      setPlans(plansData || []);

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

    toast({
      title: t("pricing.planSelected"),
      description: t("pricing.planSelectedDesc").replace("{tier}", tier),
    });
  };

  const formatLimit = (limit: number | null) => {
    if (limit === null) return t("pricing.unlimited");
    return limit.toLocaleString();
  };

  const translateFeature = (feature: string): string => {
    const featureMap: Record<string, string> = {
      "Community support": t("pricing.communitySupport"),
      "Unlimited text analysis": t("pricing.unlimitedText"),
      "Advanced speech recognition": t("pricing.advancedSpeech"),
      "Priority processing": t("pricing.priorityProcessing"),
      "24/7 email support": t("pricing.emailSupport"),
      "All PRO features": t("pricing.allProFeatures"),
      "API access": t("pricing.apiAccess"),
      "Priority on-spot response": t("pricing.priorityResponse"),
      "Usage analytics dashboard": t("pricing.analytics"),
      "Dedicated account manager": t("pricing.accountManager"),
    };
    return featureMap[feature] || feature;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">{t("pricing.loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavHeader variant="full" showBackButton />

      {/* Content */}
      <div className="pt-20 md:pt-28 pb-12 md:pb-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 md:mb-16 animate-in fade-in slide-in-from-top duration-700">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {t("pricing.title")}
              </span>
            </h1>
            <p className="text-base md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
              {t("pricing.subtitle")}
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-8 md:mb-16 animate-in fade-in duration-700 delay-100">
            <div className="bg-card/80 backdrop-blur-sm border-2 border-border/50 rounded-full p-1 md:p-1.5 flex gap-1 md:gap-2 shadow-lg">
              <Button
                variant={billingPeriod === "monthly" ? "default" : "ghost"}
                onClick={() => setBillingPeriod("monthly")}
                size="sm"
                className={`text-xs md:text-sm ${billingPeriod === "monthly" ? "bg-gradient-primary rounded-full px-4 md:px-8 font-semibold" : "rounded-full px-4 md:px-8 font-medium"}`}
              >
                {t("pricing.monthly")}
              </Button>
              <Button
                variant={billingPeriod === "yearly" ? "default" : "ghost"}
                onClick={() => setBillingPeriod("yearly")}
                size="sm"
                className={`text-xs md:text-sm ${billingPeriod === "yearly" ? "bg-gradient-primary rounded-full px-4 md:px-8 font-semibold" : "rounded-full px-4 md:px-8 font-medium"}`}
              >
                {t("pricing.yearly")}
                <Badge className="ml-1 md:ml-2 bg-success text-success-foreground font-semibold px-1.5 md:px-2 text-xs">
                  {t("pricing.save")}
                </Badge>
              </Button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto animate-in fade-in duration-700 delay-200">
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
                        <span className="text-sm text-foreground">{translateFeature(feature)}</span>
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
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
