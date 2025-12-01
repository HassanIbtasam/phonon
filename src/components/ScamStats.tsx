import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertTriangle, Phone, MessageSquare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
  { month: "Jan", cases: 780 },
  { month: "Feb", cases: 920 },
  { month: "Mar", cases: 1050 },
  { month: "Apr", cases: 1180 },
  { month: "May", cases: 1340 },
  { month: "Jun", cases: 1620 },
];

const chartConfig = {
  cases: {
    label: "Cases",
    color: "hsl(var(--primary))",
  },
};

export const ScamStats = () => {
  const { t } = useLanguage();
  const totalCases = countryData.reduce((sum, item) => sum + item.cases, 0);
  const totalScamTypes = scamTypeData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="py-20 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              GCC Scam Statistics 2024
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time data on fraud and scam attempts across Gulf Cooperation Council countries
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <CardDescription>Total Cases</CardDescription>
              <CardTitle className="text-3xl font-bold text-primary">{totalCases.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-success">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+12% from last quarter</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-warning/30">
            <CardHeader className="pb-3">
              <CardDescription>High Risk Attempts</CardDescription>
              <CardTitle className="text-3xl font-bold text-warning">4,520</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span>Prevented by AI</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-chart-3/30">
            <CardHeader className="pb-3">
              <CardDescription>SMS Scams</CardDescription>
              <CardTitle className="text-3xl font-bold" style={{ color: "hsl(var(--chart-3))" }}>8,940</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <MessageSquare className="w-4 h-4 mr-1" />
                <span>65% of total</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-chart-4/30">
            <CardHeader className="pb-3">
              <CardDescription>Phone Call Scams</CardDescription>
              <CardTitle className="text-3xl font-bold" style={{ color: "hsl(var(--chart-4))" }}>4,680</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="w-4 h-4 mr-1" />
                <span>35% of total</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scam Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Scam Types Distribution</CardTitle>
              <CardDescription>Most common fraud categories in GCC region</CardDescription>
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
          <Card>
            <CardHeader>
              <CardTitle>Cases by Country</CardTitle>
              <CardDescription>Scam reports across GCC nations</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="country" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="cases" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Monthly Trend - Full Width */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>2024 Monthly Trend</CardTitle>
              <CardDescription>Scam cases reported per month in GCC region</CardDescription>
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
