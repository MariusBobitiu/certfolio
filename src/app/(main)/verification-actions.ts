"use server"

import { actionClient } from "@/lib/safe-action"
import { getCurrentSession } from "@/lib/auth/session"
import { sendEmailVerification } from "@/lib/auth/email-verification"

export const resendVerificationEmailAction = actionClient.action(async () => {
  const currentSession = await getCurrentSession()

  if (!currentSession) {
    return { failure: "You must be signed in to resend verification emails." }
  }

  if (currentSession.user.email_verified_at) {
    return { failure: "Your email is already verified." }
  }

  await sendEmailVerification({
    userId: currentSession.user.id,
    email: currentSession.user.email,
    name: currentSession.user.name,
  })

  return { success: "Verification email sent. Please check your inbox." }
})
