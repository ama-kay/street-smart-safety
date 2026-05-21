import { createFileRoute } from '@tanstack/react-router'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute('/admin/settings')({
  component: AdminSettings,
})



export default function AdminSettings() {
  return (
    <div>
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-1">System Settings</h1>
      <p className="text-sm text-muted-foreground mb-8">Configure emergency system parameters</p>

      <div className="space-y-8">
        {/* Timer */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-1">Cancellation Timer</h2>
          <p className="text-sm text-muted-foreground mb-4">Time before alert is sent after trigger</p>
          <div className="flex items-center gap-3">
            <Input type="number" defaultValue="30" className="w-24" />
            <span className="text-sm text-muted-foreground">seconds</span>
          </div>
        </div>

        {/* SMS */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-1">SMS Gateway</h2>
          <p className="text-sm text-muted-foreground mb-4">Configure SMS delivery service</p>
          <div className="space-y-3">
            <Input placeholder="API Key" />
            <Input placeholder="Sender ID" />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-1">Notification Settings</h2>
          <p className="text-sm text-muted-foreground mb-4">Admin alert preferences</p>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-info" />
              <span className="text-sm text-foreground">Email notifications for new emergencies</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-info" />
              <span className="text-sm text-foreground">Push notifications for active alerts</span>
            </label>
          </div>
        </div>

        <Button className="bg-foreground text-background hover:bg-foreground/90">Save Settings</Button>
      </div>
    </div>
    </div>
);
};


