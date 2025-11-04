import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Edit } from "lucide-react";

type EditUserRoleDialogProps = {
  userId: string;
  userName: string;
  currentRole: string | null;
  onRoleUpdated: () => void;
};

export default function EditUserRoleDialog({
  userId,
  userName,
  currentRole,
  onRoleUpdated,
}: EditUserRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>(currentRole || "viewer");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);

    // Delete existing role
    if (currentRole) {
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", currentRole as "admin" | "staff" | "viewer");
    }

    // Insert new role
    const { error } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: selectedRole as "admin" | "staff" | "viewer",
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Role updated to ${selectedRole}`,
      });
      setOpen(false);
      onRoleUpdated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>
            Change the role for {userName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin - Full Access</SelectItem>
                <SelectItem value="staff">Staff - Edit Data</SelectItem>
                <SelectItem value="viewer">Viewer - Read Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Admin:</strong> Full system access including settings
            </p>
            <p>
              <strong>Staff:</strong> Can view and edit data
            </p>
            <p>
              <strong>Viewer:</strong> Read-only access to data
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
