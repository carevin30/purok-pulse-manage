import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Pencil, Trash2, MapPin, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddResidentDialog from "@/components/AddResidentDialog";
import EditResidentDialog from "@/components/EditResidentDialog";
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

interface Resident {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: string;
  gender: string;
  house_number: string | null;
  household_id: string | null;
  status: string;
  is_senior_citizen: boolean;
  is_pwd: boolean;
  is_indigenous: boolean;
}

export default function Residents() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [deletingResident, setDeletingResident] = useState<Resident | null>(null);
  const { toast } = useToast();

  const fetchResidents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("residents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResidents(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch residents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
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

  const getSpecialStatus = (resident: Resident) => {
    const statuses = [];
    if (resident.is_senior_citizen) statuses.push("Senior");
    if (resident.is_pwd) statuses.push("PWD");
    if (resident.is_indigenous) statuses.push("Indigenous");
    return statuses;
  };

  const filteredResidents = residents.filter((resident) => {
    const fullName = `${resident.first_name} ${resident.middle_name || ""} ${resident.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
           resident.house_number?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleViewLocation = async (resident: Resident) => {
    if (!resident.household_id) {
      toast({
        title: "No Household",
        description: "This resident is not assigned to any household",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("households")
        .select("id, house_number, purok, street_address, latitude, longitude")
        .eq("id", resident.household_id)
        .single();

      if (error) throw error;

      if (!data.latitude || !data.longitude) {
        toast({
          title: "No Location",
          description: "This household doesn't have a location set",
          variant: "destructive",
        });
        return;
      }

      // Open Google Maps in a new tab
      const googleMapsUrl = `https://www.google.com/maps?q=${data.latitude},${data.longitude}&z=17&t=m`;
      window.open(googleMapsUrl, '_blank');
      toast({
        title: "Opening location",
        description: `House ${data.house_number}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch household location",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingResident) return;

    try {
      const { error } = await supabase
        .from("residents")
        .delete()
        .eq("id", deletingResident.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resident deleted successfully",
      });

      fetchResidents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete resident",
        variant: "destructive",
      });
    } finally {
      setDeletingResident(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search residents..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
          <AddResidentDialog onSuccess={fetchResidents} />
        </div>
      </div>

      {/* Residents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resident Registry</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading residents...</div>
          ) : filteredResidents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No residents found matching your search" : "No residents yet. Add your first resident to get started."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Age</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">House Number</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Special Status</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Location</th>
                    <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResidents.map((resident) => {
                    const specialStatuses = getSpecialStatus(resident);
                    return (
                      <tr key={resident.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="py-4 text-sm font-medium text-foreground">
                          {resident.first_name} {resident.middle_name ? `${resident.middle_name} ` : ""}{resident.last_name}
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">{calculateAge(resident.date_of_birth)}</td>
                        <td className="py-4 text-sm text-muted-foreground">{resident.house_number || "—"}</td>
                        <td className="py-4">
                          <Badge variant="outline" className="border-accent text-accent">
                            {resident.status}
                          </Badge>
                        </td>
                        <td className="py-4">
                          {specialStatuses.length > 0 ? (
                            <div className="flex gap-1 flex-wrap">
                              {specialStatuses.map((status) => (
                                <Badge key={status} className="bg-primary/10 text-primary hover:bg-primary/20">
                                  {status}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewLocation(resident)}
                            disabled={!resident.household_id}
                            title={resident.household_id ? "Open household location in Google Maps" : "No household assigned"}
                          >
                            <MapPin className="h-4 w-4" />
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingResident(resident)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingResident(resident)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {editingResident && (
        <EditResidentDialog
          resident={editingResident}
          open={!!editingResident}
          onOpenChange={(open) => !open && setEditingResident(null)}
          onSuccess={fetchResidents}
        />
      )}

      <AlertDialog open={!!deletingResident} onOpenChange={(open) => !open && setDeletingResident(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deletingResident?.first_name} {deletingResident?.last_name} from the system.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
