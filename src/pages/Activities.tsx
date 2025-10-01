import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Users } from "lucide-react";

const activities = [
  { 
    id: 1, 
    name: "Community Clean-up Drive", 
    date: "March 15, 2025", 
    status: "Upcoming",
    participants: 45,
    budget: "₱5,000"
  },
  { 
    id: 2, 
    name: "Feeding Program for Children", 
    date: "March 10, 2025", 
    status: "Ongoing",
    participants: 120,
    budget: "₱15,000"
  },
  { 
    id: 3, 
    name: "Senior Citizens Checkup", 
    date: "March 5, 2025", 
    status: "Completed",
    participants: 67,
    budget: "₱8,000"
  },
  { 
    id: 4, 
    name: "Vaccination Drive", 
    date: "March 20, 2025", 
    status: "Upcoming",
    participants: 200,
    budget: "₱25,000"
  },
];

export default function Activities() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Activities & Programs</h2>
          <p className="text-sm text-muted-foreground">Manage barangay events and community programs</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-accent to-accent/80 hover:opacity-90">
          <Plus className="h-4 w-4" />
          New Activity
        </Button>
      </div>

      {/* Activities Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {activities.map((activity) => (
          <Card key={activity.id} className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{activity.name}</CardTitle>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {activity.date}
                  </p>
                </div>
                <Badge 
                  className={
                    activity.status === "Completed" 
                      ? "bg-muted text-muted-foreground" 
                      : activity.status === "Ongoing"
                      ? "bg-accent/10 text-accent hover:bg-accent/20"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }
                >
                  {activity.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{activity.participants} participants</span>
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {activity.budget}
                </div>
              </div>
              <Button variant="outline" className="mt-4 w-full">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
