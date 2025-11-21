import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Calendar, MapPin, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddActivityDialog from "@/components/AddActivityDialog";
import EditActivityDialog from "@/components/EditActivityDialog";
import { format } from "date-fns";

export default function Activities() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("activity_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;

    const { error } = await supabase.from("activities").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Activity deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    }
  };

  const handleStatusClick = async (id: string, currentStatus: string) => {
    const statusCycle: Record<string, string> = {
      "Scheduled": "Ongoing",
      "Ongoing": "Completed",
      "Completed": "Cancelled",
      "Cancelled": "Scheduled",
    };

    const newStatus = statusCycle[currentStatus] || "Scheduled";

    try {
      const { error } = await supabase
        .from("activities")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Status updated to ${newStatus}`,
      });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "default";
      case "Ongoing":
        return "secondary";
      case "Completed":
        return "outline";
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusBadge = (status: string, activityId: string) => {
    return (
      <Badge 
        variant={getStatusColor(status)} 
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => handleStatusClick(activityId, status)}
      >
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Barangay Activities</h1>
          <p className="text-muted-foreground">
            Manage community events and activities
          </p>
        </div>
        <AddActivityDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activities & Events</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : activities?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activities found. Add your first activity to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities?.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{activity.title}</div>
                        {activity.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {activity.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{activity.activity_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(activity.activity_date), "MMM dd, yyyy")}
                        <span className="text-muted-foreground">
                          {format(new Date(activity.activity_date), "hh:mm a")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {activity.location && (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {activity.location}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {activity.participants_count !== null && (
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-3 w-3" />
                          {activity.participants_count}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(activity.status, activity.id)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <EditActivityDialog activity={activity} />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(activity.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
