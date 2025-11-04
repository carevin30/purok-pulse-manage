import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import EditUserRoleDialog from "./EditUserRoleDialog";
import { Shield, ShieldAlert, Eye } from "lucide-react";

type UserWithRole = {
  id: string;
  email: string;
  full_name: string | null;
  position: string | null;
  role: string | null;
};

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const loadUsers = async () => {
    setLoading(true);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, position");

    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role");

    // Get user emails from auth.users is not possible via client
    // So we'll use the profiles + roles data
    const usersMap = new Map<string, UserWithRole>();

    if (profiles) {
      for (const profile of profiles) {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        usersMap.set(profile.id, {
          id: profile.id,
          email: "", // Can't fetch from auth.users
          full_name: profile.full_name,
          position: profile.position,
          role: userRole?.role || null,
        });
      }
    }

    setUsers(Array.from(usersMap.values()));
    setLoading(false);
  };

  const getRoleIcon = (role: string | null) => {
    switch (role) {
      case "admin":
        return <ShieldAlert className="h-4 w-4" />;
      case "staff":
        return <Shield className="h-4 w-4" />;
      case "viewer":
        return <Eye className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string | null) => {
    if (!role) return <Badge variant="outline">No Role</Badge>;

    const variants = {
      admin: "destructive",
      staff: "default",
      viewer: "secondary",
    } as const;

    return (
      <Badge variant={variants[role as keyof typeof variants] || "outline"}>
        {role}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            User Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user roles and permissions
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading users...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-mono text-xs">
                  {user.id.substring(0, 8)}...
                </TableCell>
                <TableCell>{user.full_name || "No name"}</TableCell>
                <TableCell>{user.position || "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    {getRoleBadge(user.role)}
                  </div>
                </TableCell>
                <TableCell>
                  <EditUserRoleDialog
                    userId={user.id}
                    userName={user.full_name || "User"}
                    currentRole={user.role}
                    onRoleUpdated={loadUsers}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!loading && users.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No users found
        </p>
      )}
    </div>
  );
}
