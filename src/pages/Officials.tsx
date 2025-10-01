import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddOfficialDialog from "@/components/AddOfficialDialog";
import EditOfficialDialog from "@/components/EditOfficialDialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Official {
  id: string;
  resident_id: string;
  position: string;
  term_start: string;
  term_end: string | null;
  status: string;
  residents: {
    first_name: string;
    middle_name: string | null;
    last_name: string;
  };
}

export default function Officials() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingOfficial, setEditingOfficial] = useState<Official | null>(null);
  const [deletingOfficial, setDeletingOfficial] = useState<Official | null>(null);
  const { toast } = useToast();

  const fetchOfficials = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("officials")
        .select(`
          *,
          residents (
            first_name,
            middle_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOfficials(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch officials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficials();
  }, []);

  const handleDelete = async () => {
    if (!deletingOfficial) return;

    try {
      const { error } = await supabase
        .from("officials")
        .delete()
        .eq("id", deletingOfficial.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Official removed successfully",
      });

      fetchOfficials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove official",
        variant: "destructive",
      });
    } finally {
      setDeletingOfficial(null);
    }
  };

  const filteredOfficials = officials.filter((official) => {
    const fullName = `${official.residents.first_name} ${official.residents.middle_name || ""} ${official.residents.last_name}`.toLowerCase();
    const position = official.position.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || position.includes(query);
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Barangay Officials</h1>
          <p className="text-muted-foreground mt-1">
            Manage barangay officials and their positions
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search officials..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <AddOfficialDialog onSuccess={fetchOfficials} />
      </div>

      {/* Officials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Officials Registry</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading officials...</div>
          ) : filteredOfficials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "No officials found matching your search"
                : "No officials yet. Add your first official to get started."}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Term Start</TableHead>
                    <TableHead>Term End</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOfficials.map((official) => (
                    <TableRow key={official.id}>
                      <TableCell className="font-medium">
                        {official.residents.first_name}{" "}
                        {official.residents.middle_name
                          ? `${official.residents.middle_name} `
                          : ""}
                        {official.residents.last_name}
                      </TableCell>
                      <TableCell>{official.position}</TableCell>
                      <TableCell>{formatDate(official.term_start)}</TableCell>
                      <TableCell>
                        {official.term_end ? formatDate(official.term_end) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={official.status === "Active" ? "default" : "secondary"}
                        >
                          {official.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingOfficial(official)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingOfficial(official)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {editingOfficial && (
        <EditOfficialDialog
          official={editingOfficial}
          open={!!editingOfficial}
          onOpenChange={(open) => !open && setEditingOfficial(null)}
          onSuccess={fetchOfficials}
        />
      )}

      <AlertDialog
        open={!!deletingOfficial}
        onOpenChange={(open) => !open && setDeletingOfficial(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove{" "}
              {deletingOfficial?.residents.first_name}{" "}
              {deletingOfficial?.residents.last_name} from the position of{" "}
              {deletingOfficial?.position}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
