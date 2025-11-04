import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import MapPicker from "@/components/map/MapPicker";

interface EditHouseholdDialogProps {
  household: any;
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

export default function EditHouseholdDialog({
  household,
  open,
  onOpenChange,
  onSuccess,
}: EditHouseholdDialogProps) {
  const [houseNumber, setHouseNumber] = useState("");
  const [purok, setPurok] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [hasElectricity, setHasElectricity] = useState(false);
  const [hasWater, setHasWater] = useState(false);
  const [latitude, setLatitude] = useState<number>(17.65);
  const [longitude, setLongitude] = useState<number>(120.85);
  const [selectedResidents, setSelectedResidents] = useState<string[]>([]);
  const [availableResidents, setAvailableResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (household && open) {
      setHouseNumber(household.house_number || "");
      setPurok(household.purok || "");
      setStreetAddress(household.street_address || "");
      setHasElectricity(household.has_electricity || false);
      setHasWater(household.has_water || false);
      setLatitude(household.latitude || 17.65);
      setLongitude(household.longitude || 120.85);
      fetchResidents();
    }
  }, [household, open]);

  const fetchResidents = async () => {
    try {
      const { data, error } = await supabase
        .from("residents")
        .select("id, first_name, last_name, household_id")
        .order("first_name", { ascending: true });

      if (error) throw error;
      setAvailableResidents(data || []);

      // Set selected residents who belong to this household
      const householdResidents = (data || [])
        .filter((r) => r.household_id === household.id)
        .map((r) => r.id);
      setSelectedResidents(householdResidents);
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
      // Update household
      const { error: householdError } = await supabase
        .from("households")
        .update({
          house_number: houseNumber.trim(),
          purok: purok.trim() || null,
          street_address: streetAddress.trim() || null,
          has_electricity: hasElectricity,
          has_water: hasWater,
          latitude,
          longitude,
        })
        .eq("id", household.id);

      if (householdError) throw householdError;

      // Get current residents in this household
      const { data: currentResidents, error: currentError } = await supabase
        .from("residents")
        .select("id")
        .eq("household_id", household.id);

      if (currentError) throw currentError;

      const currentResidentIds = (currentResidents || []).map((r) => r.id);

      // Remove residents that are no longer selected
      const residentsToRemove = currentResidentIds.filter(
        (id) => !selectedResidents.includes(id)
      );
      if (residentsToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from("residents")
          .update({ household_id: null, house_number: null })
          .in("id", residentsToRemove);

        if (removeError) throw removeError;
      }

      // Add newly selected residents
      const residentsToAdd = selectedResidents.filter(
        (id) => !currentResidentIds.includes(id)
      );
      if (residentsToAdd.length > 0) {
        const { error: addError } = await supabase
          .from("residents")
          .update({
            household_id: household.id,
            house_number: houseNumber.trim(),
          })
          .in("id", residentsToAdd);

        if (addError) throw addError;
      }

      toast({
        title: "Success",
        description: "Household updated successfully",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating household:", error);
      toast({
        title: "Error",
        description: "Failed to update household",
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Household</DialogTitle>
          <DialogDescription>
            Update household information and manage residents.
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

            <div className="space-y-2">
              <Label>Location on Map</Label>
              <MapPicker
                initialLat={latitude}
                initialLng={longitude}
                onLocationSelect={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
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
              <Label>Assign Residents</Label>
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
                        {resident.household_id &&
                          resident.household_id !== household.id && (
                            <span className="text-muted-foreground ml-2">
                              (Assigned to another household)
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
              {loading ? "Updating..." : "Update Household"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
