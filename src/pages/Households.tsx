import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Users, Zap, Droplet } from "lucide-react";
import AddHouseholdDialog from "@/components/AddHouseholdDialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Household {
  id: string;
  house_number: string;
  purok: string | null;
  street_address: string | null;
  has_electricity: boolean;
  has_water: boolean;
  head_of_household_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Resident {
  id: string;
  first_name: string;
  last_name: string;
}

export default function Households() {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [residentsMap, setResidentsMap] = useState<Record<string, Resident[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchHouseholds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("households")
        .select("*")
        .order("house_number", { ascending: true });

      if (error) throw error;

      setHouseholds(data || []);

      // Fetch residents for each household
      if (data && data.length > 0) {
        const householdIds = data.map(h => h.id);
        const { data: residents, error: residentsError } = await supabase
          .from("residents")
          .select("id, first_name, last_name, household_id")
          .in("household_id", householdIds);

        if (residentsError) throw residentsError;

        // Group residents by household_id
        const grouped = (residents || []).reduce((acc, resident) => {
          if (resident.household_id) {
            if (!acc[resident.household_id]) {
              acc[resident.household_id] = [];
            }
            acc[resident.household_id].push(resident);
          }
          return acc;
        }, {} as Record<string, Resident[]>);

        setResidentsMap(grouped);
      }
    } catch (error) {
      console.error("Error fetching households:", error);
      toast({
        title: "Error",
        description: "Failed to load households",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const filteredHouseholds = households.filter((household) =>
    household.house_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (household.purok && household.purok.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Households</h1>
          <p className="text-muted-foreground mt-1">
            Manage household information and utilities
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by house number or purok..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <AddHouseholdDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={fetchHouseholds}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Household
          </Button>
        </AddHouseholdDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Households</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading households...
            </div>
          ) : filteredHouseholds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No households found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>House Number</TableHead>
                    <TableHead>Purok</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Residents</TableHead>
                    <TableHead>Utilities</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHouseholds.map((household) => (
                    <TableRow key={household.id}>
                      <TableCell className="font-medium">
                        {household.house_number}
                      </TableCell>
                      <TableCell>{household.purok || "-"}</TableCell>
                      <TableCell>{household.street_address || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{residentsMap[household.id]?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {household.has_electricity && (
                            <Badge variant="secondary" className="gap-1">
                              <Zap className="h-3 w-3" />
                              Electricity
                            </Badge>
                          )}
                          {household.has_water && (
                            <Badge variant="secondary" className="gap-1">
                              <Droplet className="h-3 w-3" />
                              Water
                            </Badge>
                          )}
                          {!household.has_electricity && !household.has_water && (
                            <span className="text-muted-foreground text-sm">No utilities</span>
                          )}
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
    </div>
  );
}
