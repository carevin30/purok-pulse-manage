import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Home, FileText, Share2, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart, Line, LineChart } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const COLORS = {
  Male: "hsl(var(--primary))",
  Female: "hsl(var(--accent))",
};

const STAT_COLORS = {
  primary: "hsl(142 18% 45%)",
  accent: "hsl(29 35% 60%)",
  destructive: "hsl(0 72% 51%)",
  info: "hsl(200 80% 50%)",
};


export default function Dashboard() {
  const [totalResidents, setTotalResidents] = useState(0);
  const [totalHouseholds, setTotalHouseholds] = useState(0);
  const [genderData, setGenderData] = useState<{ name: string; value: number }[]>([]);
  const [ageData, setAgeData] = useState<{ age: string; population: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch residents
      const { data: residents, error: residentsError } = await supabase
        .from("residents")
        .select("gender, date_of_birth");

      if (residentsError) throw residentsError;

      // Fetch households
      const { data: households, error: householdsError } = await supabase
        .from("households")
        .select("id");

      if (householdsError) throw householdsError;

      // Calculate totals
      setTotalResidents(residents?.length || 0);
      setTotalHouseholds(households?.length || 0);

      // Calculate gender distribution
      const maleCount = residents?.filter((r) => r.gender === "Male").length || 0;
      const femaleCount = residents?.filter((r) => r.gender === "Female").length || 0;

      setGenderData([
        { name: "Male", value: maleCount },
        { name: "Female", value: femaleCount },
      ]);

      // Calculate age distribution
      const ageGroups = {
        "0-17": 0,
        "18-35": 0,
        "36-59": 0,
        "60+": 0,
      };

      residents?.forEach((resident) => {
        if (resident.date_of_birth) {
          const age = calculateAge(resident.date_of_birth);
          if (age <= 17) ageGroups["0-17"]++;
          else if (age <= 35) ageGroups["18-35"]++;
          else if (age <= 59) ageGroups["36-59"]++;
          else ageGroups["60+"]++;
        }
      });

      setAgeData([
        { age: "0-17", population: ageGroups["0-17"] },
        { age: "18-35", population: ageGroups["18-35"] },
        { age: "36-59", population: ageGroups["36-59"] },
        { age: "60+", population: ageGroups["60+"] },
      ]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const growthRate = totalResidents > 0 ? "+5.2%" : "0%";
  const currentDate = new Date();
  const monthName = currentDate.toLocaleString('default', { month: 'long' }).toUpperCase();
  const dayNumber = currentDate.getDate();

  return (
    <div className="space-y-4 p-6">
      {/* Top Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Circular Progress Card */}
        <Card className="bg-card border-border shadow-soft hover:shadow-medium transition-shadow">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={STAT_COLORS.primary}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(totalResidents / 10000) * 351.86} 351.86`}
                  strokeLinecap="round"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="48"
                  stroke={STAT_COLORS.accent}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(totalHouseholds / 2000) * 301.59} 301.59`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{totalResidents}</p>
                  <p className="text-xs text-muted-foreground">{totalHouseholds}</p>
                </div>
              </div>
            </div>
            <button className="mt-4 px-4 py-1.5 bg-muted text-foreground text-xs rounded hover:bg-muted/80 transition-colors">
              READ MORE
            </button>
          </CardContent>
        </Card>

        {/* Total Residents Stat */}
        <Card className="shadow-soft hover:shadow-medium transition-shadow" style={{ backgroundColor: STAT_COLORS.primary }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-white/90" />
            </div>
            <p className="text-sm font-medium text-white/80 mb-1">TOTAL RESIDENTS</p>
            <p className="text-3xl font-bold text-white">{isLoading ? "..." : totalResidents.toLocaleString()}</p>
          </CardContent>
        </Card>

        {/* Total Households Stat */}
        <Card className="shadow-soft hover:shadow-medium transition-shadow" style={{ backgroundColor: STAT_COLORS.accent }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Home className="h-8 w-8 text-white/90" />
            </div>
            <p className="text-sm font-medium text-white/80 mb-1">HOUSEHOLDS</p>
            <p className="text-3xl font-bold text-white">{isLoading ? "..." : totalHouseholds.toLocaleString()}</p>
          </CardContent>
        </Card>

        {/* Reports Stat */}
        <Card className="shadow-soft hover:shadow-medium transition-shadow" style={{ backgroundColor: STAT_COLORS.destructive }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-8 w-8 text-white/90" />
            </div>
            <p className="text-sm font-medium text-white/80 mb-1">REPORTS VIEW</p>
            <p className="text-3xl font-bold text-white">23</p>
          </CardContent>
        </Card>

        {/* Calendar Widget */}
        <Card className="bg-card border-border shadow-soft hover:shadow-medium transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-xs font-medium text-muted-foreground mb-2">{monthName}</p>
              <p className="text-5xl font-bold text-foreground mb-2">{dayNumber}</p>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" style={{ color: STAT_COLORS.info }} />
                <span className="text-muted-foreground">Today</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bars Card */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-card border-border shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Population Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Male</span>
                <span className="font-semibold text-foreground">
                  {genderData.find(g => g.name === "Male")?.value || 0}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all" 
                  style={{ 
                    backgroundColor: STAT_COLORS.primary,
                    width: `${totalResidents > 0 ? ((genderData.find(g => g.name === "Male")?.value || 0) / totalResidents * 100) : 0}%` 
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Female</span>
                <span className="font-semibold text-foreground">
                  {genderData.find(g => g.name === "Female")?.value || 0}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all" 
                  style={{ 
                    backgroundColor: STAT_COLORS.accent,
                    width: `${totalResidents > 0 ? ((genderData.find(g => g.name === "Female")?.value || 0) / totalResidents * 100) : 0}%` 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-card border-border shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Age Groups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ageData.map((item, index) => (
              <div key={item.age} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.age} years</span>
                <span className="text-sm font-semibold text-foreground">{item.population}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Age Distribution Area Chart */}
        <Card className="bg-card border-border shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Age Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                Loading...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={ageData}>
                  <defs>
                    <linearGradient id="colorPopulation1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={STAT_COLORS.destructive} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={STAT_COLORS.destructive} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorPopulation2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={STAT_COLORS.accent} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={STAT_COLORS.accent} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorPopulation3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={STAT_COLORS.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={STAT_COLORS.primary} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="age" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="population" 
                    stroke={STAT_COLORS.primary}
                    fillOpacity={1}
                    fill="url(#colorPopulation3)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gender Distribution Multi-line Chart */}
        <Card className="bg-card border-border shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Trends Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                Loading...
              </div>
            ) : (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={ageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="age" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        fontSize: "12px",
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="population" 
                      stroke={STAT_COLORS.accent} 
                      strokeWidth={2}
                      dot={{ fill: STAT_COLORS.accent, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4">
                  {genderData.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] }}
                        />
                        <span className="text-xs font-medium text-foreground">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
