import { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import { SettingsSidebar } from "../../../components/settings/sidebar"

export const metadata: Metadata = {
  title: "Settings - Certfolio",
  description: "Manage your account settings and preferences on Certfolio.",
}

type SlotProps = {
  children: React.ReactNode
  general: React.ReactNode
  security: React.ReactNode
  connectedaccounts: React.ReactNode
  notifications: React.ReactNode
  appearance: React.ReactNode
  privacy: React.ReactNode
  data: React.ReactNode
}

const SECTIONS = [
  { id: "general", key: "general" },
  { id: "security", key: "security" },
  { id: "connected-accounts", key: "connectedaccounts" },
  { id: "notifications", key: "notifications" },
  { id: "appearance", key: "appearance" },
  { id: "privacy", key: "privacy" },
  { id: "data", key: "data" },
] as const

export default function SettingsLayout(props: SlotProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-1 text-muted-foreground">
        Manage your account settings and preferences.
      </p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <SettingsSidebar />
        <div className="min-w-0 flex-1 space-y-12">
          {SECTIONS.map((section, i) => (
            <div key={section.id}>
              {i > 0 && <Separator className="mb-12" />}
              <section id={section.id} className="scroll-mt-32 sm:scroll-mt-36">
                {props[section.key]}
              </section>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
