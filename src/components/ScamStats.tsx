import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, AlertTriangle, Phone, MessageSquare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const scamTypeData = [
  { type: "Financial", count: 2840, color: "hsl(var(--chart-1))" },
  { type: "Romance", count: 1620, color: "hsl(var(--chart-2))" },
  { type: "Phishing", count: 2150, color: "hsl(var(--chart-3))" },
  { type: "Investment", count: 1890, color: "hsl(var(--chart-4))" },
  { type: "Identity", count: 1340, color: "hsl(var(--chart-5))" },
];

const countryData = [
  { country: "UAE", cases: 3450 },
  { country: "KSA", cases: 4120 },
  { country: "Qatar", cases: 1580 },
  { country: "Kuwait", cases: 1920 },
  { country: "Bahrain", cases: 890 },
  { country: "Oman", cases: 1200 },
];

const monthlyTrendData = [
  { month: "Jan", cases: 980 },
  { month: "Feb", cases: 1120 },
  { month: "Mar", cases: 1290 },
  { month: "Apr", cases: 1450 },
  { month: "May", cases: 1680 },
  { month: "Jun", cases: 1920 },
  { month: "Jul", cases: 2150 },
  { month: "Aug", cases: 2380 },
  { month: "Sep", cases: 2620 },
  { month: "Oct", cases: 2890 },
  { month: "Nov", cases: 3150 },
  { month: "Dec", cases: 3420 },
];

const chartConfig = {
  cases: {
    label: "Cases",
    color: "hsl(var(--primary))",
  },
};

const useCountingAnimation = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
};

export const ScamStats = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const totalCases = countryData.reduce((sum, item) => sum + item.cases, 0);
  const totalScamTypes = scamTypeData.reduce((sum, item) => sum + item.count, 0);
  
  const animatedTotalCases = useCountingAnimation(totalCases);
  const animatedHighRisk = useCountingAnimation(4520);
  const animatedSMS = useCountingAnimation(8940);
  const animatedPhone = useCountingAnimation(4680);

  // Custom legend for pie chart
  const renderLegend = () => (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {scamTypeData.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">
            {entry.type}: {Math.round((entry.count / totalScamTypes) * 100)}%
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 md:space-y-4 animate-fade-in">
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {t("stats.title")}
            </span>
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("stats.subtitle")}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <Card className="border-primary/30 animate-fade-in hover-scale" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
              <CardDescription className="text-xs md:text-sm">{t("stats.totalCases")}</CardDescription>
              <CardTitle className="text-xl md:text-3xl font-bold text-primary">{animatedTotalCases.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="flex items-center text-xs md:text-sm text-success">
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                <span>+12%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-warning/30 animate-fade-in hover-scale" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
              <CardDescription className="text-xs md:text-sm">{t("stats.highRiskAttempts")}</CardDescription>
              <CardTitle className="text-xl md:text-3xl font-bold text-warning">{animatedHighRisk.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                <span>{t("stats.preventedByAI")}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-chart-3/30 animate-fade-in hover-scale" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
              <CardDescription className="text-xs md:text-sm">{t("stats.smsScams")}</CardDescription>
              <CardTitle className="text-xl md:text-3xl font-bold" style={{ color: "hsl(var(--chart-3))" }}>{animatedSMS.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                <MessageSquare className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                <span>65%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-chart-4/30 animate-fade-in hover-scale" style={{ animationDelay: "0.4s" }}>
            <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
              <CardDescription className="text-xs md:text-sm">{t("stats.phoneCallScams")}</CardDescription>
              <CardTitle className="text-xl md:text-3xl font-bold" style={{ color: "hsl(var(--chart-4))" }}>{animatedPhone.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                <Phone className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                <span>35%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {/* Scam Types Distribution */}
          <Card className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">{t("stats.scamTypes")}</CardTitle>
              <CardDescription className="text-xs md:text-sm">{t("stats.scamTypesDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <ChartContainer config={chartConfig} className="h-[200px] md:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scamTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={isMobile ? 60 : 80}
                      innerRadius={isMobile ? 30 : 40}
                      fill="hsl(var(--primary))"
                      dataKey="count"
                      animationBegin={0}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    >
                      {scamTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              {renderLegend()}
            </CardContent>
          </Card>

          {/* Cases by Country */}
          <Card className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">{t("stats.casesByCountry")}</CardTitle>
              <CardDescription className="text-xs md:text-sm">{t("stats.casesByCountryDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <ChartContainer config={chartConfig} className="h-[220px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryData} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="country" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={isMobile ? 10 : 12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={isMobile ? 10 : 12}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="cases" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      animationBegin={0}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Monthly Trend - Full Width */}
          <Card className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "0.7s" }}>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">{t("stats.monthlyTrend")}</CardTitle>
              <CardDescription className="text-xs md:text-sm">{t("stats.monthlyTrendDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <ChartContainer config={chartConfig} className="h-[200px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={isMobile ? 9 : 12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={isMobile ? 10 : 12}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="cases"
                      stroke="hsl(var(--primary))"
                      strokeWidth={isMobile ? 2 : 3}
                      dot={{ fill: "hsl(var(--primary))", r: isMobile ? 3 : 5 }}
                      animationBegin={0}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
