"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { SettingsNotificationsSkeleton } from "@/components/skeletons/settings-notifications-skeleton";

interface NotificationSettings {
  email: boolean;
  push: boolean;
  weekly: boolean;
}

const defaultSettings: NotificationSettings = {
  email: true,
  push: false,
  weekly: true,
};

export function NotificationSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("notification_settings")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data?.notification_settings) {
          setSettings(data.notification_settings);
        }
      } catch (error) {
        console.error("Error loading notification settings:", error);
        toast.error("Failed to load notification settings");
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [user]);

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    if (!user) return;

    try {
      const newSettings = { ...settings, [key]: value };
      
      const { error } = await supabase
        .from("profiles")
        .update({
          notification_settings: newSettings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setSettings(newSettings);
      toast.success("Notification preferences updated");
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast.error("Failed to update notification preferences");
    }
  };

  if (isLoading) {
    return <SettingsNotificationsSkeleton />;
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Notification Preferences</h2>
          <p className="text-sm text-muted-foreground">
            Choose how you want to be notified
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={settings.email}
              onCheckedChange={(checked) => updateSetting("email", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications
              </p>
            </div>
            <Switch
              checked={settings.push}
              onCheckedChange={(checked) => updateSetting("push", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly summary
              </p>
            </div>
            <Switch
              checked={settings.weekly}
              onCheckedChange={(checked) => updateSetting("weekly", checked)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}