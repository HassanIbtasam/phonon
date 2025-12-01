import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertTriangle, Phone, MessageSquare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const scamTypeData = [
  { type: "Financial", count: 2840, color: "hsl(var(--chart-1))" },
  { type: "Romance", count: 1620, color: "hsl(var(--chart-2))" },
  { type: "Phishing", count: 2150, color: "hsl(var(--chart-3))" },
  { type: "Investment", count: 1890, color: "hsl(var(--chart-4))" },
  { type: "Identity Theft", count: 1340, color: "hsl(var(--chart-5))" },
];

const countryData = [
  { country: "UAE", cases: 3450 },
  { country: "Saudi Arabia", cases: 4120 },
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
  const totalCases = countryData.reduce((sum, item) => sum + item.cases, 0);
  const totalScamTypes = scamTypeData.reduce((sum, item) => sum + item.count, 0);
  
  const animatedTotalCases = useCountingAnimation(totalCases);
  const animatedHighRisk = useCountingAnimation(4520);
  const animatedSMS = useCountingAnimation(8940);
  const animatedPhone = useCountingAnimation(4680);

  return (
    <div className="py-20 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {t("stats.title")}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("stats.subtitle")}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-primary/30 animate-fade-in hover-scale" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-3">
              <CardDescription>{t("stats.totalCases")}</CardDescription>
              <CardTitle className="text-3xl font-bold text-primary">{animatedTotalCases.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-success">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+12% {t("stats.fromLastQuarter")}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-warning/30 animate-fade-in hover-scale" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="pb-3">
              <CardDescription>{t("stats.highRiskAttempts")}</CardDescription>
              <CardTitle className="text-3xl font-bold text-warning">{animatedHighRisk.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span>{t("stats.preventedByAI")}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-chart-3/30 animate-fade-in hover-scale" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="pb-3">
              <CardDescription>{t("stats.smsScams")}</CardDescription>
              <CardTitle className="text-3xl font-bold" style={{ color: "hsl(var(--chart-3))" }}>{animatedSMS.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <MessageSquare className="w-4 h-4 mr-1" />
                <span>65% {t("stats.ofTotal")}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-chart-4/30 animate-fade-in hover-scale" style={{ animationDelay: "0.4s" }}>
            <CardHeader className="pb-3">
              <CardDescription>{t("stats.phoneCallScams")}</CardDescription>
              <CardTitle className="text-3xl font-bold" style={{ color: "hsl(var(--chart-4))" }}>{animatedPhone.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="w-4 h-4 mr-1" />
                <span>35% {t("stats.ofTotal")}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scam Types Distribution */}
          <Card className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <CardHeader>
              <CardTitle>{t("stats.scamTypes")}</CardTitle>
              <CardDescription>{t("stats.scamTypesDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scamTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
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
            </CardContent>
          </Card>

          {/* Cases by Country */}
          <Card className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <CardHeader>
              <CardTitle>{t("stats.casesByCountry")}</CardTitle>
              <CardDescription>{t("stats.casesByCountryDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="country" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="cases" 
                      fill="hsl(var(--primary))" 
                      radius={[8, 8, 0, 0]}
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
            <CardHeader>
              <CardTitle>{t("stats.monthlyTrend")}</CardTitle>
              <CardDescription>{t("stats.monthlyTrendDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="cases"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", r: 6 }}
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
