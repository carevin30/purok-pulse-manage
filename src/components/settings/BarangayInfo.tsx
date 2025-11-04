import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const barangaySchema = z.object({
  barangay_name: z.string().min(1, "Barangay name is required"),
  municipality: z.string().optional(),
  province: z.string().optional(),
  region: z.string().optional(),
  barangay_code: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
});

type BarangayFormData = z.infer<typeof barangaySchema>;

export default function BarangayInfo() {
  const [loading, setLoading] = useState(false);
  const [barangayId, setBarangayId] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BarangayFormData>({
    resolver: zodResolver(barangaySchema),
  });

  useEffect(() => {
    loadBarangayInfo();
  }, []);

  const loadBarangayInfo = async () => {
    const { data } = await supabase
      .from("barangay_info")
      .select("*")
      .limit(1)
      .single();

    if (data) {
      setBarangayId(data.id);
      setValue("barangay_name", data.barangay_name);
      setValue("municipality", data.municipality || "");
      setValue("province", data.province || "");
      setValue("region", data.region || "");
      setValue("barangay_code", data.barangay_code || "");
      setValue("phone_number", data.phone_number || "");
      setValue("email", data.email || "");
      setValue("address", data.address || "");
    }
  };

  const onSubmit = async (data: BarangayFormData) => {
    setLoading(true);

    const payload = {
      barangay_name: data.barangay_name,
      municipality: data.municipality,
      province: data.province,
      region: data.region,
      barangay_code: data.barangay_code,
      phone_number: data.phone_number,
      email: data.email,
      address: data.address,
    };

    let error;
    if (barangayId) {
      const result = await supabase
        .from("barangay_info")
        .update(payload)
        .eq("id", barangayId);
      error = result.error;
    } else {
      const result = await supabase.from("barangay_info").insert(payload);
      error = result.error;
    }

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save barangay information",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Barangay information saved successfully",
      });
      loadBarangayInfo();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Barangay Information
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your barangay details
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="barangay_name">Barangay Name *</Label>
            <Input
              id="barangay_name"
              {...register("barangay_name")}
              placeholder="Enter barangay name"
            />
            {errors.barangay_name && (
              <p className="text-sm text-destructive mt-1">
                {errors.barangay_name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="barangay_code">Barangay Code</Label>
            <Input
              id="barangay_code"
              {...register("barangay_code")}
              placeholder="Enter barangay code"
            />
          </div>

          <div>
            <Label htmlFor="municipality">Municipality</Label>
            <Input
              id="municipality"
              {...register("municipality")}
              placeholder="Enter municipality"
            />
          </div>

          <div>
            <Label htmlFor="province">Province</Label>
            <Input
              id="province"
              {...register("province")}
              placeholder="Enter province"
            />
          </div>

          <div>
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              {...register("region")}
              placeholder="Enter region"
            />
          </div>

          <div>
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              {...register("phone_number")}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="address">Physical Address</Label>
          <Textarea
            id="address"
            {...register("address")}
            placeholder="Enter complete address"
            rows={3}
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Barangay Information"}
        </Button>
      </form>
    </div>
  );
}
