import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type FeatureType = 'text_analysis' | 'screenshot_analysis' | 'link_analysis' | 'live_call';

interface UsageLimit {
  canUse: boolean;
  currentUsage: number;
  limit: number | null;
  planName: string;
}

export const useUsageTracking = () => {
  const [checking, setChecking] = useState(false);
  const { toast } = useToast();

  const checkLimit = async (featureType: FeatureType): Promise<UsageLimit | null> => {
    try {
      setChecking(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      // If not logged in, allow unlimited usage (no tracking)
      if (!session) {
        return {
          canUse: true,
          currentUsage: 0,
          limit: null,
          planName: 'Guest',
        };
      }

      const { data, error } = await supabase.functions.invoke('check-usage-limit', {
        body: { featureType },
      });

      if (error) throw error;
      
      return data as UsageLimit;
    } catch (error) {
      console.error('Error checking usage limit:', error);
      toast({
        title: "Error",
        description: "Failed to check usage limit",
        variant: "destructive",
      });
      return null;
    } finally {
      setChecking(false);
    }
  };

  const incrementUsage = async (featureType: FeatureType): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If not logged in, don't track
      if (!session) {
        return true;
      }

      const { error } = await supabase.functions.invoke('increment-usage', {
        body: { featureType },
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  };

  const checkAndIncrement = async (
    featureType: FeatureType,
    language: 'en' | 'ar' = 'en'
  ): Promise<boolean> => {
    const limitCheck = await checkLimit(featureType);
    
    if (!limitCheck) {
      return false;
    }

    if (!limitCheck.canUse) {
      const featureNames = {
        text_analysis: language === 'ar' ? 'تحليل النصوص' : 'text scans',
        screenshot_analysis: language === 'ar' ? 'تحليل لقطات الشاشة' : 'screenshot scans',
        link_analysis: language === 'ar' ? 'تحليل الروابط' : 'link analyses',
        live_call: language === 'ar' ? 'المكالمات المباشرة' : 'live call scans',
      };

      toast({
        title: language === 'ar' ? 'تم الوصول إلى الحد' : 'Limit Reached',
        description: language === 'ar' 
          ? `لقد وصلت إلى الحد الأقصى الشهري لـ ${featureNames[featureType]} (${limitCheck.limit}). قم بالترقية للحصول على المزيد!`
          : `You've reached your monthly limit for ${featureNames[featureType]} (${limitCheck.limit}). Upgrade for more!`,
        variant: "destructive",
      });
      return false;
    }

    // Increment usage after successful check
    await incrementUsage(featureType);
    return true;
  };

  return {
    checkLimit,
    incrementUsage,
    checkAndIncrement,
    checking,
  };
};