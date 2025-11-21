import { useEffect, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AddReportDialog } from "@/components/AddReportDialog";
import { EditReportDialog } from "@/components/EditReportDialog";
import { Tables } from "@/integrations/supabase/types";
import { Pencil, Trash2, FileText } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Report = Tables<"reports">;

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("reported_date", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    const channel = supabase
      .channel("reports-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reports",
        },
        () => {
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase.from("reports").delete().eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleStatusClick = async (reportId: string, currentStatus: string) => {
    const statusCycle: Record<string, string> = {
      "Pending": "In Progress",
      "In Progress": "Resolved",
      "Resolved": "Closed",
      "Closed": "Pending",
    };

    const newStatus = statusCycle[currentStatus] || "Pending";

    // Optimistic update
    setReports(prevReports =>
      prevReports.map(report =>
        report.id === reportId
          ? { ...report, status: newStatus }
          : report
      )
    );

    try {
      const { error } = await supabase
        .from("reports")
        .update({ status: newStatus })
        .eq("id", reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Status updated to ${newStatus}`,
      });
    } catch (error) {
      // Revert on error
      setReports(prevReports =>
        prevReports.map(report =>
          report.id === reportId
            ? { ...report, status: currentStatus }
            : report
        )
      );
      
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, reportId: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Pending: "outline",
      "In Progress": "secondary",
      Resolved: "default",
      Closed: "destructive",
    };
    return (
      <Badge 
        variant={variants[status] || "default"} 
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => handleStatusClick(reportId, status)}
      >
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Low: "outline",
      Medium: "secondary",
      High: "default",
      Critical: "destructive",
    };
    return <Badge variant={variants[priority] || "default"}>{priority}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Manage barangay incident reports and complaints
          </p>
        </div>
        <AddReportDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reports found. Create your first report to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell>{report.report_type}</TableCell>
                    <TableCell>{report.reported_by || "—"}</TableCell>
                    <TableCell>{report.location || "—"}</TableCell>
                    <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                    <TableCell>{getStatusBadge(report.status, report.id)}</TableCell>
                    <TableCell>
                      {new Date(report.reported_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingReport(report)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(report.id)}
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

      {editingReport && (
        <EditReportDialog
          report={editingReport}
          open={!!editingReport}
          onOpenChange={(open) => !open && setEditingReport(null)}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the report
              from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
