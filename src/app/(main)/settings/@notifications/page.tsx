import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

const NOTIFICATION_TOGGLES = [
  { label: "Email Notifications", description: "Receive email updates about your account" },
  { label: "Verification Alerts", description: "Get notified when credentials are verified" },
  { label: "Credential Expiry Reminders", description: "Reminders before your credentials expire" },
  { label: "Profile View Summaries", description: "Weekly summary of profile views" },
]

export default function NotificationsSlot() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-xl font-semibold">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Choose what notifications you receive.
          </p>
        </div>
        <Badge variant="secondary">Coming soon</Badge>
      </div>

      <div className="space-y-3 opacity-50 pointer-events-none">
        {NOTIFICATION_TOGGLES.map((toggle) => (
          <div
            key={toggle.label}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div>
              <p className="text-sm font-medium">{toggle.label}</p>
              <p className="text-xs text-muted-foreground">
                {toggle.description}
              </p>
            </div>
            <Switch disabled />
          </div>
        ))}
      </div>
    </div>
  )
}
