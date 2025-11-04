import { useState, useEffect } from "react";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Home, Calendar, ClipboardList, TrendingUp, Bell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const notifications = [
  { id: 1, type: "Birth Registration", message: "New birth registration submitted", time: "2 hours ago" },
  { id: 2, type: "Event", message: "Community clean-up drive tomorrow", time: "5 hours ago" },
  { id: 3, type: "Report", message: "Street light maintenance request", time: "1 day ago" },
];

const COLORS = {
  Male: "hsl(var(--primary))",
  Female: "hsl(var(--accent))",
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

  return (
    <div className="space-y-6">
      {/* Hero Section - Total Residents */}
      <Card className="bg-gradient-to-br from-primary/90 to-primary border-none shadow-strong">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary-foreground/80">Total Population</p>
              <div className="flex items-baseline gap-3">
                <h1 className="text-5xl font-bold text-primary-foreground">
                  {isLoading ? "..." : totalResidents.toLocaleString()}
                </h1>
                <span className="text-sm font-medium text-primary-foreground/80">{growthRate}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors shadow-md">
                Add Resident
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Households Card */}
        <Card className="hover:shadow-medium transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <Home className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Households</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-bold">{isLoading ? "..." : totalHouseholds.toLocaleString()}</p>
                  <span className="text-xs font-medium text-accent">+2.1%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">vs. Last Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities Card */}
        <Card className="hover:shadow-medium transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Activities</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-bold">8</p>
                  <span className="text-xs font-medium text-primary">Ongoing</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Card */}
        <Card className="hover:shadow-medium transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-destructive/10">
                <ClipboardList className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Reports</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-bold">23</p>
                  <span className="text-xs font-medium text-destructive">15 Pending</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Age Distribution Chart - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                Age Distribution
              </CardTitle>
              <div className="flex gap-1 text-xs">
                <button className="px-3 py-1 bg-primary text-primary-foreground rounded-md font-medium">Weekly</button>
                <button className="px-3 py-1 hover:bg-muted rounded-md">Monthly</button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                Loading...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={ageData}>
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
                    cursor={{ fill: "hsl(var(--accent) / 0.1)" }}
                  />
                  <Bar 
                    dataKey="population" 
                    fill="hsl(var(--primary))" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gender Distribution - Compact Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gender Split</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                Loading...
              </div>
            ) : genderData.every((item) => item.value === 0) ? (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                No data
              </div>
            ) : (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {genderData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {genderData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold">
                        {((item.value / totalResidents) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Updates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-accent" />
              Recent Updates
            </CardTitle>
            <button className="text-sm font-medium text-primary hover:underline">See All</button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-accent/10">
                  <Bell className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{notif.type}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{notif.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
