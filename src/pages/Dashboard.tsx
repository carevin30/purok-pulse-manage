import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Home, Calendar, ClipboardList, TrendingUp, Bell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { age: "0-17", population: 245 },
  { age: "18-35", population: 432 },
  { age: "36-59", population: 387 },
  { age: "60+", population: 156 },
];

const notifications = [
  { id: 1, type: "Birth Registration", message: "New birth registration submitted", time: "2 hours ago" },
  { id: 2, type: "Event", message: "Community clean-up drive tomorrow", time: "5 hours ago" },
  { id: 3, type: "Report", message: "Street light maintenance request", time: "1 day ago" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Residents"
          value="1,220"
          icon={Users}
          trend="+12 this month"
        />
        <StatCard
          title="Households"
          value="342"
          icon={Home}
          trend="+5 this month"
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
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Population Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Population Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
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
          </CardContent>
        </Card>

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
    </div>
  );
}
