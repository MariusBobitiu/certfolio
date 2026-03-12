import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: process.env.DOTENV_CONFIG_PATH ?? ".env.local", quiet: true })

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run Drizzle.")
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/**/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
})
