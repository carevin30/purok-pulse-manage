import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const officialSchema = z.object({
  position: z.string().min(1, "Position is required").max(100),
  term_start: z.string().min(1, "Term start date is required"),
  term_end: z.string().optional(),
  status: z.enum(["Active", "Inactive"], { required_error: "Please select a status" }),
});

type OfficialFormData = z.infer<typeof officialSchema>;

interface EditOfficialDialogProps {
  official: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditOfficialDialog({
  official,
  open,
  onOpenChange,
  onSuccess,
}: EditOfficialDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<OfficialFormData>({
    resolver: zodResolver(officialSchema),
    defaultValues: {
      position: "",
      term_start: "",
      term_end: "",
      status: "Active",
    },
  });

  useEffect(() => {
    if (official && open) {
      form.reset({
        position: official.position || "",
        term_start: official.term_start || "",
        term_end: official.term_end || "",
        status: official.status || "Active",
      });
    }
  }, [official, open, form]);

  const onSubmit = async (data: OfficialFormData) => {
    setIsLoading(true);
    try {
      const officialData = {
        position: data.position,
        term_start: data.term_start,
        term_end: data.term_end || null,
        status: data.status,
      };

      const { error } = await supabase
        .from("officials")
        .update(officialData)
        .eq("id", official.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Official updated successfully",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update official",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Official</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Official"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
