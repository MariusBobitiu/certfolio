export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("at least 8 characters")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("at least 1 uppercase letter")
  }

  if (!/[0-9]/.test(password)) {
    errors.push("at least 1 number")
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("at least 1 symbol (!@#$%^&*...)")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
