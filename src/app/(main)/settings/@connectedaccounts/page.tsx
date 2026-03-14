import { Github, Linkedin, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const PROVIDERS = [
  { name: "GitHub", icon: Github },
  { name: "LinkedIn", icon: Linkedin },
  { name: "Google", icon: Globe },
]

export default function ConnectedAccountsSlot() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-xl font-semibold">Connected Accounts</h2>
          <p className="text-sm text-muted-foreground">
            Link third-party accounts to your profile.
          </p>
        </div>
        <Badge variant="secondary">Coming soon</Badge>
      </div>

      <div className="space-y-3 opacity-50 pointer-events-none">
        {PROVIDERS.map((provider) => (
          <div
            key={provider.name}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center gap-3">
              <provider.icon className="size-5 text-muted-foreground" />
              <p className="text-sm font-medium">{provider.name}</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Connect
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
