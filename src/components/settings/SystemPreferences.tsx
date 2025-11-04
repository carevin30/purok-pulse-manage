import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

type Setting = {
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
};

export default function SystemPreferences() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from("system_settings")
      .select("*")
      .order("setting_key");

    if (data) {
      setSettings(data);
    }
    setLoading(false);
  };

  const updateSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from("system_settings")
      .update({ setting_value: value })
      .eq("setting_key", key);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
      loadSettings();
    }
  };

  const getSetting = (key: string): Setting | undefined => {
    return settings.find((s) => s.setting_key === key);
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading settings...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          System Preferences
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure system-wide settings
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              {getSetting("email_notifications")?.description}
            </p>
          </div>
          <Switch
            checked={getSetting("email_notifications")?.setting_value === "true"}
            onCheckedChange={(checked) =>
              updateSetting("email_notifications", checked.toString())
            }
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Date Format</Label>
          <p className="text-sm text-muted-foreground">
            {getSetting("date_format")?.description}
          </p>
          <Select
            value={getSetting("date_format")?.setting_value || "MM/DD/YYYY"}
            onValueChange={(value) => updateSetting("date_format", value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Records Per Page</Label>
          <p className="text-sm text-muted-foreground">
            {getSetting("records_per_page")?.description}
          </p>
          <Input
            type="number"
            min="5"
            max="100"
            className="w-[200px]"
            value={getSetting("records_per_page")?.setting_value || "10"}
            onChange={(e) => updateSetting("records_per_page", e.target.value)}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Public Reports</Label>
            <p className="text-sm text-muted-foreground">
              {getSetting("public_reports")?.description}
            </p>
          </div>
          <Switch
            checked={getSetting("public_reports")?.setting_value === "true"}
            onCheckedChange={(checked) =>
              updateSetting("public_reports", checked.toString())
            }
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Auto-Archive Duration (Days)</Label>
          <p className="text-sm text-muted-foreground">
            {getSetting("auto_archive_days")?.description}
          </p>
          <Input
            type="number"
            min="30"
            max="3650"
            className="w-[200px]"
            value={getSetting("auto_archive_days")?.setting_value || "365"}
            onChange={(e) => updateSetting("auto_archive_days", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
