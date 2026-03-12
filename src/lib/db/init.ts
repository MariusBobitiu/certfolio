import "server-only"
import { runMigrations } from "./migrate"
import { seedDatabase } from "./seed"

declare global {
  var __dbInitializationPromise: Promise<void> | undefined
}

export async function initializeDatabase() {
  if (globalThis.__dbInitializationPromise) {
    return globalThis.__dbInitializationPromise
  }

  globalThis.__dbInitializationPromise = (async () => {
    await runMigrations()

    if (process.env.SEED_ON_STARTUP !== "false") {
      await seedDatabase()
    }
  })()

  return globalThis.__dbInitializationPromise
}
