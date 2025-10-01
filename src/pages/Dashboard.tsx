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

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Residents"
          value={isLoading ? "..." : totalResidents.toString()}
          icon={Users}
          trend={isLoading ? "" : `Active residents`}
        />
        <StatCard
          title="Households"
          value={isLoading ? "..." : totalHouseholds.toString()}
          icon={Home}
          trend={isLoading ? "" : `Registered households`}
        />
        <StatCard
          title="Ongoing Activities"
          value="8"
          icon={Calendar}
          variant="accent"
        />
        <StatCard
          title="Reports Submitted"
          value="23"
          icon={ClipboardList}
          trend="15 pending"
        />
      </div>

      {/* Charts and Notifications */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Age Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Age Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Loading...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="age" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
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

        {/* Gender Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Gender Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Loading...
              </div>
            ) : genderData.every((item) => item.value === 0) ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-accent" />
            Recent Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="rounded-lg border border-border bg-secondary/50 p-4 transition-all hover:bg-secondary"
              >
                <p className="text-xs font-semibold text-primary">{notif.type}</p>
                <p className="mt-1 text-sm text-foreground">{notif.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{notif.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
