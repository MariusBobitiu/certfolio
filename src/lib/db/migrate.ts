import path from "node:path"
import { pathToFileURL } from "node:url"
import { config } from "dotenv"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import { client, db } from "./drizzle"

config({ path: process.env.DOTENV_CONFIG_PATH ?? ".env.local", quiet: true })

const migrationsFolder = path.join(process.cwd(), "drizzle")

export async function runMigrations() {
  await migrate(db, { migrationsFolder })
}

async function runMigrationsCli() {
  try {
    await runMigrations()
    console.log("✓ Database migrations applied")
  } catch (error) {
    console.error("Error applying database migrations:", error)
    throw error
  } finally {
    await client.end()
  }
}

const isMain = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false

if (isMain) {
  runMigrationsCli()
    .then(() => {
      process.exitCode = 0
    })
    .catch(() => {
      process.exitCode = 1
    })
}
