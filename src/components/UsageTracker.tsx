import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, Image, Link as LinkIcon, Phone, TrendingUp } from "lucide-react";

interface UsageStat {
  featureType: string;
  currentUsage: number;
  limit: number | null;
  percentageUsed: number;
  periodStart: string;
  periodEnd: string;
}

interface UsageData {
  stats: UsageStat[];
  planName: string;
  planTier: string;
}

export const UsageTracker = () => {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    loadUsageStats();
  }, []);

  const loadUsageStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('get-usage-stats');
      
      if (error) throw error;
      setUsageData(data);
    } catch (error) {
      console.error('Error loading usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFeatureIcon = (featureType: string) => {
    switch (featureType) {
      case 'text_analysis':
        return <FileText className="w-5 h-5" />;
      case 'screenshot_analysis':
        return <Image className="w-5 h-5" />;
      case 'link_analysis':
        return <LinkIcon className="w-5 h-5" />;
      case 'live_call':
        return <Phone className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getFeatureName = (featureType: string) => {
    const names: Record<string, string> = {
      text_analysis: language === 'ar' ? 'تحليل النصوص' : 'Text Scans',
      screenshot_analysis: language === 'ar' ? 'تحليل لقطات الشاشة' : 'Screenshot Scans',
      link_analysis: language === 'ar' ? 'تحليل الروابط' : 'Link Analyses',
      live_call: language === 'ar' ? 'مكالمات مباشرة' : 'Live Call Scans',
    };
    return names[featureType] || featureType;
  };

  const formatLimit = (limit: number | null) => {
    if (limit === null) return language === 'ar' ? 'غير محدود' : 'Unlimited';
    return limit.toLocaleString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!usageData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'إحصائيات الاستخدام' : 'Usage Statistics'}</CardTitle>
          <CardDescription>
            {language === 'ar' ? 'سجّل الدخول لعرض إحصائيات الاستخدام' : 'Sign in to view usage statistics'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">
            {language === 'ar' ? 'إحصائيات الاستخدام' : 'Usage Statistics'}
          </h2>
          <p className="text-muted-foreground mt-2">
            {language === 'ar' ? 'تتبع استخدامك الشهري مقابل حدود الخطة' : 'Track your monthly usage against plan limits'}
          </p>
        </div>
        <Badge className="bg-primary text-primary-foreground px-4 py-2 text-base">
          {usageData.planName}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {usageData.stats.map((stat) => (
          <Card key={stat.featureType} className="hover-scale">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {getFeatureIcon(stat.featureType)}
                  </div>
                  <CardTitle className="text-lg">{getFeatureName(stat.featureType)}</CardTitle>
                </div>
                <Badge variant={stat.percentageUsed >= 100 ? "destructive" : stat.percentageUsed >= 80 ? "secondary" : "outline"}>
                  {stat.percentageUsed}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'ar' ? 'المستخدم' : 'Used'}
                </span>
                <span className="font-semibold text-foreground">
                  {stat.currentUsage} / {formatLimit(stat.limit)}
                </span>
              </div>
              <Progress 
                value={stat.limit === null ? 0 : Math.min((stat.currentUsage / stat.limit) * 100, 100)} 
                className="h-2"
              />
              {stat.percentageUsed >= 100 && (
                <p className="text-sm text-destructive font-medium">
                  {language === 'ar' ? 'تم الوصول إلى الحد الأقصى' : 'Limit reached'}
                </p>
              )}
              {stat.percentageUsed >= 80 && stat.percentageUsed < 100 && (
                <p className="text-sm text-secondary font-medium">
                  {language === 'ar' ? 'قريب من الحد الأقصى' : 'Approaching limit'}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            {language === 'ar' 
              ? `الفترة: ${new Date(usageData.stats[0]?.periodStart).toLocaleDateString('ar')} - ${new Date(usageData.stats[0]?.periodEnd).toLocaleDateString('ar')}`
              : `Period: ${new Date(usageData.stats[0]?.periodStart).toLocaleDateString()} - ${new Date(usageData.stats[0]?.periodEnd).toLocaleDateString()}`
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};