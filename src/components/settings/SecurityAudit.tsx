import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function SecurityAudit() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Security & Audit
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Security settings and activity logs
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Advanced security features and audit logging will be available in a
          future update. For now, basic authentication security is enabled by
          default.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">Current Security Status</Label>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <span className="text-sm">Row Level Security (RLS)</span>
              <span className="text-sm font-medium text-primary">Enabled</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <span className="text-sm">Role-Based Access Control</span>
              <span className="text-sm font-medium text-primary">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <span className="text-sm">Authentication</span>
              <span className="text-sm font-medium text-primary">Required</span>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Label className="text-base font-semibold">Planned Features</Label>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• Activity logging and audit trail</li>
            <li>• Session management and timeout controls</li>
            <li>• Two-factor authentication (2FA)</li>
            <li>• Password strength requirements</li>
            <li>• Failed login attempt tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
