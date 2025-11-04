import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import ChangePasswordDialog from "./ChangePasswordDialog";
import { User } from "@supabase/supabase-js";

const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  position: z.string().optional(),
  phone_number: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileSettings() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setValue("full_name", profile.full_name || "");
        setValue("position", profile.position || "");
        setValue("phone_number", profile.phone_number || "");
      }
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: data.full_name,
        position: data.position,
        phone_number: data.phone_number,
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Profile Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update your personal information
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user?.email || ""}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Email cannot be changed
          </p>
        </div>

        <div>
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            {...register("full_name")}
            placeholder="Enter your full name"
          />
          {errors.full_name && (
            <p className="text-sm text-destructive mt-1">
              {errors.full_name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            {...register("position")}
            placeholder="e.g., Barangay Captain, Secretary"
          />
        </div>

        <div>
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            id="phone_number"
            {...register("phone_number")}
            placeholder="Enter your phone number"
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Change Password
        </h3>
        <ChangePasswordDialog />
      </div>
    </div>
  );
}
