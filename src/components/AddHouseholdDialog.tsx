import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddHouseholdDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Resident {
  id: string;
  first_name: string;
  last_name: string;
  household_id: string | null;
}

export default function AddHouseholdDialog({
  children,
  open,
  onOpenChange,
  onSuccess,
}: AddHouseholdDialogProps) {
  const [houseNumber, setHouseNumber] = useState("");
  const [purok, setPurok] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [hasElectricity, setHasElectricity] = useState(false);
  const [hasWater, setHasWater] = useState(false);
  const [selectedResidents, setSelectedResidents] = useState<string[]>([]);
  const [availableResidents, setAvailableResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchAvailableResidents();
    }
  }, [open]);

  const fetchAvailableResidents = async () => {
    try {
      const { data, error } = await supabase
        .from("residents")
        .select("id, first_name, last_name, household_id")
        .order("first_name", { ascending: true });

      if (error) throw error;
      setAvailableResidents(data || []);
    } catch (error) {
      console.error("Error fetching residents:", error);
      toast({
        title: "Error",
        description: "Failed to load residents",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!houseNumber.trim()) {
      toast({
        title: "Error",
        description: "House number is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create household
      const { data: household, error: householdError } = await supabase
        .from("households")
        .insert({
          house_number: houseNumber.trim(),
          purok: purok.trim() || null,
          street_address: streetAddress.trim() || null,
          has_electricity: hasElectricity,
          has_water: hasWater,
        })
        .select()
        .single();

      if (householdError) throw householdError;

      // Update selected residents with household_id and house_number
      if (selectedResidents.length > 0 && household) {
        const { error: updateError } = await supabase
          .from("residents")
          .update({
            household_id: household.id,
            house_number: houseNumber.trim(),
          })
          .in("id", selectedResidents);

        if (updateError) throw updateError;
      }

      toast({
        title: "Success",
        description: "Household created successfully",
      });

      // Reset form
      setHouseNumber("");
      setPurok("");
      setStreetAddress("");
      setHasElectricity(false);
      setHasWater(false);
      setSelectedResidents([]);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating household:", error);
      toast({
        title: "Error",
        description: "Failed to create household",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleResident = (residentId: string) => {
    setSelectedResidents((prev) =>
      prev.includes(residentId)
        ? prev.filter((id) => id !== residentId)
        : [...prev, residentId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Household</DialogTitle>
          <DialogDescription>
            Create a new household record and assign residents to it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="houseNumber">
                House Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="houseNumber"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="e.g., 101, 102A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purok">Purok</Label>
              <Input
                id="purok"
                value={purok}
                onChange={(e) => setPurok(e.target.value)}
                placeholder="e.g., Purok 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="streetAddress">Street Address</Label>
              <Input
                id="streetAddress"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="e.g., Sampaguita Street"
              />
            </div>

            <div className="space-y-4 pt-2">
              <Label>Utility Connections</Label>
              <div className="flex items-center justify-between">
                <Label htmlFor="electricity" className="cursor-pointer">
                  Connected to Electricity
                </Label>
                <Switch
                  id="electricity"
                  checked={hasElectricity}
                  onCheckedChange={setHasElectricity}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="water" className="cursor-pointer">
                  Connected to Water Supply
                </Label>
                <Switch
                  id="water"
                  checked={hasWater}
                  onCheckedChange={setHasWater}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assign Residents (Optional)</Label>
              <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
                {availableResidents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No residents available
                  </p>
                ) : (
                  availableResidents.map((resident) => (
                    <div
                      key={resident.id}
                      className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                      onClick={() => toggleResident(resident.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedResidents.includes(resident.id)}
                        onChange={() => toggleResident(resident.id)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm flex-1">
                        {resident.first_name} {resident.last_name}
                        {resident.household_id && (
                          <span className="text-muted-foreground ml-2">
                            (Already assigned)
                          </span>
                        )}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Household"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
