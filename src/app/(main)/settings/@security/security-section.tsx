import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ChangePasswordDialog,
  MfaCard,
  RecoveryCodesCard,
  RevokeAllSessionsButton,
  RevokeSessionButton,
} from "./security-form"

type SessionData = {
  id: string
  user_agent: string | null
  ip_address: string | null
  last_seen_at: Date | null
  created_at: Date
}

type ActivityEvent = {
  label: string
  timestamp: Date
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return "Unknown device"
  if (ua.includes("Firefox")) return "Firefox"
  if (ua.includes("Edg")) return "Microsoft Edge"
  if (ua.includes("Chrome")) return "Chrome"
  if (ua.includes("Safari")) return "Safari"
  return "Unknown browser"
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function ActiveSessions({
  sessions,
  currentSessionId,
}: {
  sessions: SessionData[]
  currentSessionId: string
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Active Sessions</p>
        </div>
        {sessions.length > 1 && <RevokeAllSessionsButton />}
      </div>

      <div className="space-y-2">
        {sessions.map((session) => {
          const isCurrent = session.id === currentSessionId

          return (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {parseUserAgent(session.user_agent)}
                  </p>
                  {isCurrent && (
                    <Badge variant="secondary" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {session.ip_address ?? "Unknown IP"} &middot;{" "}
                  {session.last_seen_at
                    ? `Last seen ${formatDate(session.last_seen_at)}`
                    : `Created ${formatDate(session.created_at)}`}
                </p>
              </div>
              {!isCurrent && <RevokeSessionButton sessionId={session.id} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RecentActivity({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Recent Security Activity</p>
        </div>
        <p className="text-sm text-muted-foreground">No recent activity.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">Recent Security Activity</p>
      </div>
      <div className="space-y-2">
        {events.map((event, index) => (
          <div
            key={`${event.label}-${event.timestamp.toISOString()}-${index}`}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <p className="text-sm">{event.label}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(event.timestamp)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SecuritySection({
  currentSessionId,
  sessions,
  recentActivity,
}: {
  currentSessionId: string
  sessions: SessionData[]
  recentActivity: ActivityEvent[]
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Security</h2>
        <p className="text-sm text-muted-foreground">
          Manage your password, sessions, and security settings.
        </p>
      </div>

      <div className="space-y-3">
        <ChangePasswordDialog />
        <MfaCard />
        <RecoveryCodesCard />
      </div>

      <Separator />

      <ActiveSessions
        sessions={sessions}
        currentSessionId={currentSessionId}
      />

      <Separator />

      <RecentActivity events={recentActivity} />
    </div>
  )
}
