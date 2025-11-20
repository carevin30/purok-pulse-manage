import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus } from "lucide-react";

const certificateSchema = z.object({
  certificate_type: z.string().min(1, "Certificate type is required"),
  resident_id: z.string().min(1, "Resident is required"),
  purpose: z.string().min(1, "Purpose is required"),
  issued_by: z.string().min(1, "Issued by is required"),
  valid_until: z.string().optional(),
  notes: z.string().optional(),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

type GenerateCertificateDialogProps = {
  onSuccess: () => void;
};

export default function GenerateCertificateDialog({
  onSuccess,
}: GenerateCertificateDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [residents, setResidents] = useState<
    Array<{ id: string; first_name: string; last_name: string }>
  >([]);
  const { toast } = useToast();

  const form = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      certificate_type: "",
      resident_id: "",
      purpose: "",
      issued_by: "",
      valid_until: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      loadResidents();
    }
  }, [open]);

  const loadResidents = async () => {
    const { data } = await supabase
      .from("residents")
      .select("id, first_name, last_name")
      .eq("status", "Active")
      .order("last_name");

    if (data) {
      setResidents(data);
    }
  };

  const generateCertificateNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `CERT-${year}-${random}`;
  };

  const onSubmit = async (data: CertificateFormData) => {
    setLoading(true);

    const { error } = await supabase.from("certificates").insert([{
      certificate_type: data.certificate_type as any,
      resident_id: data.resident_id,
      certificate_number: generateCertificateNumber(),
      purpose: data.purpose,
      issued_by: data.issued_by,
      valid_until: data.valid_until || null,
      notes: data.notes,
      status: "Active",
    }]);

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to generate certificate",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Certificate generated successfully",
      });
      form.reset();
      setOpen(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Generate Certificate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Certificate</DialogTitle>
          <DialogDescription>
            Create a new certificate for a resident
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="certificate_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select certificate type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="certificate_of_indigency">
                        Certificate of Indigency
                      </SelectItem>
                      <SelectItem value="certificate_of_residency">
                        Certificate of Residency
                      </SelectItem>
                      <SelectItem value="business_permit">
                        Business Permit Clearance
                      </SelectItem>
                      <SelectItem value="barangay_clearance">
                        Barangay Clearance
                      </SelectItem>
                      <SelectItem value="mayors_permit">
                        Mayor's Permit
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resident_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resident</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resident" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {residents.map((resident) => (
                        <SelectItem key={resident.id} value={resident.id}>
                          {resident.first_name} {resident.last_name}
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
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the purpose of the certificate"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="issued_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issued By</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Name of issuing official"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valid_until"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valid Until (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Generating..." : "Generate Certificate"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
