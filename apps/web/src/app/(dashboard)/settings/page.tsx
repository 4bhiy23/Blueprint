"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SettingsPage() {
  const handleSave = () => {
    toast.success("Settings saved successfully.");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your organization settings, custom domain and team members.
        </p>
      </div>

      <Card className="p-6 bg-card border border-border space-y-6">
        {/* Workspace settings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground text-base">Workspace Profile</h3>
          <Separator />
          
          <div className="grid gap-2">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input id="workspace-name" defaultValue="My Personal Workspace" />
            <p className="text-[11px] text-muted-foreground">
              This is your workspace's visible name inside Blueprint.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="workspace-url">Workspace URL</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">blueprint.to/</span>
              <Input id="workspace-url" defaultValue="personal" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4 pt-4">
          <h3 className="font-semibold text-foreground text-base">Email Notifications</h3>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Response alerts</Label>
              <p className="text-[11px] text-muted-foreground">
                Get an email daily digest of form submissions.
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly analytics digest</Label>
              <p className="text-[11px] text-muted-foreground">
                Summary of views and conversion rates on your forms.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-4 pt-4">
          <h3 className="font-semibold text-destructive text-base">Danger Zone</h3>
          <Separator className="bg-destructive/20" />

          <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div className="space-y-0.5">
              <Label className="text-foreground">Delete Workspace</Label>
              <p className="text-[11px] text-muted-foreground">
                Permanently delete this workspace and all associated forms.
              </p>
            </div>
            <Button variant="destructive" size="sm">Delete Workspace</Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline">Reset</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </Card>
    </div>
  );
}
