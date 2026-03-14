import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth/session"
import {
  getActiveSessions,
  getRecentSecurityActivity,
} from "./action"
import { Separator } from "@/components/ui/separator"
import { ChangePasswordDialog, MfaCard, RecoveryCodesCard, RevokeAllSessionsButton, RevokeSessionButton } from "./security-form"
import { Badge } from "@/components/ui/badge"
import { formatDate, parseUserAgent } from "@/lib/utils"

export default async function SecuritySlot() {
  const session = await getCurrentSession()
  if (!session) redirect("/sign-in")

  const [sessions, activity] = await Promise.all([
    getActiveSessions(session.user.id),
    getRecentSecurityActivity(session.user.id),
  ])

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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Active Sessions</p>
          </div>
          {sessions.length > 1 && <RevokeAllSessionsButton />}
        </div>

        <div className="space-y-2">
          {sessions.map((sess) => {
            const isCurrent = sess.id === session.session.id

            return (
              <div
                key={sess.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {parseUserAgent(sess.user_agent)}
                    </p>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {sess.ip_address ?? "Unknown IP"} &middot;{" "}
                    {sess.last_seen_at
                      ? `Last seen ${formatDate(sess.last_seen_at)}`
                      : `Created ${formatDate(sess.created_at)}`}
                  </p>
                </div>
                {!isCurrent && <RevokeSessionButton sessionId={sess.id} />}
              </div>
            )
          })}
        </div>
      </div>

      <Separator />

      {activity.length > 0 ? (
        <>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Recent Security Activity</p>
            </div>
            <div className="space-y-2">
              {activity.map((event, index) => (
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
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Recent Security Activity</p>
          </div>
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        </div>
      )}
      {/* <RecentActivity events={recentActivity} /> */}
    </div>
  )
}
