import { Metadata } from "next"

import { CredentialsWorkspace } from "./credentials-workspace"

export const metadata: Metadata = {
  title: "Credentials - Certfolio",
  description:
    "Plan how certifications and credentials should be structured, displayed, and reused inside Certfolio.",
  authors: [
    {
      name: "Marius Bobitiu",
      url: "https://mariusbobitiu.dev",
    },
  ],
}

export default function CredentialsPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-112 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_38%),radial-gradient(circle_at_top_right,rgba(14,116,144,0.14),transparent_28%),linear-gradient(180deg,rgba(71,85,105,0.08),transparent_78%)]" />
      <CredentialsWorkspace />
    </div>
  )
}
