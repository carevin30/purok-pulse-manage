import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import ProfileSettings from "@/components/settings/ProfileSettings";
import BarangayInfo from "@/components/settings/BarangayInfo";
import UserManagement from "@/components/settings/UserManagement";
import SystemPreferences from "@/components/settings/SystemPreferences";
import SecurityAudit from "@/components/settings/SecurityAudit";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account, barangay information, and system preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="barangay">Barangay Info</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            <ProfileSettings />
          </Card>
        </TabsContent>

        <TabsContent value="barangay">
          <Card className="p-6">
            <BarangayInfo />
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="p-6">
            <UserManagement />
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="p-6">
            <SystemPreferences />
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6">
            <SecurityAudit />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
