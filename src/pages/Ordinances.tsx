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
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddOrdinanceDialog from "@/components/AddOrdinanceDialog";
import EditOrdinanceDialog from "@/components/EditOrdinanceDialog";
import { format } from "date-fns";

export default function Ordinances() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ordinances, isLoading } = useQuery({
    queryKey: ["ordinances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordinances")
        .select("*")
        .order("date_enacted", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ordinance?")) return;

    const { error } = await supabase.from("ordinances").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Ordinance deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["ordinances"] });
    }
  };

  const handleStatusClick = async (id: string, currentStatus: string) => {
    const statusCycle: Record<string, string> = {
      "Active": "Amended",
      "Amended": "Repealed",
      "Repealed": "Active",
    };

    const newStatus = statusCycle[currentStatus] || "Active";

    try {
      const { error } = await supabase
        .from("ordinances")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Status updated to ${newStatus}`,
      });
      queryClient.invalidateQueries({ queryKey: ["ordinances"] });
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
      case "Active":
        return "default";
      case "Repealed":
        return "destructive";
      case "Amended":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusBadge = (status: string, ordinanceId: string) => {
    return (
      <Badge 
        variant={getStatusColor(status)} 
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => handleStatusClick(ordinanceId, status)}
      >
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Barangay Ordinances</h1>
          <p className="text-muted-foreground">
            Manage barangay ordinances and regulations
          </p>
        </div>
        <AddOrdinanceDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ordinances List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : ordinances?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No ordinances found. Add your first ordinance to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordinance No.</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Date Enacted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordinances?.map((ordinance) => (
                  <TableRow key={ordinance.id}>
                    <TableCell className="font-medium">
                      {ordinance.ordinance_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ordinance.title}</div>
                        {ordinance.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {ordinance.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(ordinance.date_enacted), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(ordinance.status, ordinance.id)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <EditOrdinanceDialog ordinance={ordinance} />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(ordinance.id)}
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
