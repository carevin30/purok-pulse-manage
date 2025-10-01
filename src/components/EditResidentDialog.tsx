import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const residentSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  middle_name: z.string().max(100).optional(),
  last_name: z.string().min(1, "Last name is required").max(100),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female"], { required_error: "Please select a gender" }),
  house_number: z.string().max(50).optional(),
  purok: z.string().max(50).optional(),
  street_address: z.string().max(200).optional(),
  phone_number: z.string().max(20).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  is_senior_citizen: z.boolean().default(false),
  is_pwd: z.boolean().default(false),
  is_indigenous: z.boolean().default(false),
});

type ResidentFormData = z.infer<typeof residentSchema>;

interface EditResidentDialogProps {
  resident: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditResidentDialog({
  resident,
  open,
  onOpenChange,
  onSuccess,
}: EditResidentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ResidentFormData>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      date_of_birth: "",
      gender: undefined,
      house_number: "",
      purok: "",
      street_address: "",
      phone_number: "",
      email: "",
      is_senior_citizen: false,
      is_pwd: false,
      is_indigenous: false,
    },
  });

  useEffect(() => {
    if (resident && open) {
      form.reset({
        first_name: resident.first_name || "",
        middle_name: resident.middle_name || "",
        last_name: resident.last_name || "",
        date_of_birth: resident.date_of_birth || "",
        gender: resident.gender || undefined,
        house_number: resident.house_number || "",
        purok: resident.purok || "",
        street_address: resident.street_address || "",
        phone_number: resident.phone_number || "",
        email: resident.email || "",
        is_senior_citizen: resident.is_senior_citizen || false,
        is_pwd: resident.is_pwd || false,
        is_indigenous: resident.is_indigenous || false,
      });
    }
  }, [resident, open, form]);

  const onSubmit = async (data: ResidentFormData) => {
    setIsLoading(true);
    try {
      const residentData = {
        first_name: data.first_name,
        middle_name: data.middle_name || null,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        house_number: data.house_number || null,
        purok: data.purok || null,
        street_address: data.street_address || null,
        phone_number: data.phone_number || null,
        email: data.email || null,
        is_senior_citizen: data.is_senior_citizen,
        is_pwd: data.is_pwd,
        is_indigenous: data.is_indigenous,
      };

      const { error } = await supabase
        .from("residents")
        .update(residentData)
        .eq("id", resident.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resident updated successfully",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update resident",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Resident</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="middle_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="house_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>House Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., HH-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purok"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purok/Zone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="street_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Special Status</FormLabel>
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="is_senior_citizen"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Senior Citizen</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_pwd"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">PWD</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_indigenous"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Indigenous</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                {isLoading ? "Updating..." : "Update Resident"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
