import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

const officialSchema = z.object({
  resident_id: z.string().min(1, "Please select a resident"),
  position: z.string().min(1, "Position is required").max(100),
  term_start: z.string().min(1, "Term start date is required"),
  term_end: z.string().optional(),
  status: z.enum(["Active", "Inactive"], { required_error: "Please select a status" }),
});

type OfficialFormData = z.infer<typeof officialSchema>;

interface Resident {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
}

interface AddOfficialDialogProps {
  onSuccess?: () => void;
}

export default function AddOfficialDialog({ onSuccess }: AddOfficialDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [residents, setResidents] = useState<Resident[]>([]);
  const { toast } = useToast();

  const form = useForm<OfficialFormData>({
    resolver: zodResolver(officialSchema),
    defaultValues: {
      resident_id: "",
      position: "",
      term_start: "",
      term_end: "",
      status: "Active",
    },
  });

  useEffect(() => {
    if (open) {
      fetchResidents();
    }
  }, [open]);

  const fetchResidents = async () => {
    try {
      const { data, error } = await supabase
        .from("residents")
        .select("id, first_name, middle_name, last_name")
        .order("last_name", { ascending: true });

      if (error) throw error;
      setResidents(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch residents",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: OfficialFormData) => {
    setIsLoading(true);
    try {
      const officialData = {
        resident_id: data.resident_id,
        position: data.position,
        term_start: data.term_start,
        term_end: data.term_end || null,
        status: data.status,
      };

      const { error } = await supabase.from("officials").insert([officialData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Official added successfully",
      });

      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add official",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Official
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Official</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="resident_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Resident *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a resident" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {residents.map((resident) => (
                        <SelectItem key={resident.id} value={resident.id}>
                          {resident.first_name} {resident.middle_name ? `${resident.middle_name} ` : ""}
                          {resident.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Barangay Captain, Kagawad" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="term_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="term_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Official"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
