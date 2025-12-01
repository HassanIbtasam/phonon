import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
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
        title: t("error.title") || "Error",
        description: t("error.loadingPlans") || "Failed to load subscription plans",
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
        title: t("auth.required") || "Authentication Required",
        description: t("auth.signInToSubscribe") || "Please sign in to subscribe to a plan",
      });
      navigate("/auth");
      return;
    }

    // For now, just show a success message
    toast({
      title: t("subscription.selected") || "Plan Selected",
      description: `You've selected the ${tier} plan. Payment integration coming soon!`,
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img src={phononLogo} alt="Phonon Logo" className="w-8 h-8 object-contain" />
            <span className="font-display font-bold text-xl">{t("nav.title")}</span>
          </button>
          
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("nav.back") || "Back"}
          </Button>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {t("subscription.title") || "Choose Your Protection Plan"}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("subscription.subtitle") || "Select the perfect plan to protect yourself from scams"}
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12 animate-in fade-in duration-700 delay-100">
            <div className="bg-card border border-border rounded-full p-1 flex gap-1">
              <Button
                variant={billingPeriod === "monthly" ? "default" : "ghost"}
                onClick={() => setBillingPeriod("monthly")}
                className={billingPeriod === "monthly" ? "bg-gradient-primary rounded-full" : "rounded-full"}
              >
                {t("subscription.monthly") || "Monthly"}
              </Button>
              <Button
                variant={billingPeriod === "yearly" ? "default" : "ghost"}
                onClick={() => setBillingPeriod("yearly")}
                className={billingPeriod === "yearly" ? "bg-gradient-primary rounded-full" : "rounded-full"}
              >
                {t("subscription.yearly") || "Yearly"}
                <Badge className="ml-2 bg-success text-success-foreground">
                  {t("subscription.save20") || "Save 20%"}
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
                      Popular
                    </Badge>
                  )}
                  
                  {isCurrentPlan && (
                    <Badge className="absolute -top-3 right-4 bg-success border-0 px-3 py-1">
                      {t("subscription.current") || "Current Plan"}
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
                        /month
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
                        <strong className="font-semibold">{formatLimit(plan.text_analysis_limit)}</strong> text scans
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">
                        <strong className="font-semibold">{formatLimit(plan.screenshot_analysis_limit)}</strong> screenshot scans
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">
                        <strong className="font-semibold">{formatLimit(plan.link_analysis_limit)}</strong> link analyses
                      </span>
                    </div>
                    {plan.live_call_limit !== null && (
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">
                          <strong className="font-semibold">{formatLimit(plan.live_call_limit)}</strong> live call scans
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
                        ? "w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                        : "w-full transition-all duration-300"
                    }
                    variant={isCurrentPlan ? "outline" : "default"}
                  >
                    {isCurrentPlan
                      ? t("subscription.currentPlan") || "Current Plan"
                      : plan.tier.toLowerCase() === "basic"
                      ? t("subscription.getStarted") || "Get Started"
                      : t("subscription.upgrade") || "Upgrade Now"}
                  </Button>
                </Card>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center animate-in fade-in duration-700 delay-300">
            <div className="max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border border-primary/30 rounded-xl p-8">
              <h3 className="font-display text-2xl font-bold mb-4">
                {t("subscription.enterprise.title") || "Need More?"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("subscription.enterprise.desc") || "Contact us for custom enterprise solutions with dedicated support and unlimited features."}
              </p>
              <Button className="bg-gradient-primary hover:shadow-glow">
                {t("subscription.enterprise.cta") || "Contact Sales"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
