import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as authSchema from "@/lib/db/auth/schema"
import * as preferencesSchema from "@/lib/db/preferences/schema"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is required to initialize the database client.")
}

const databaseUrl: string = connectionString

const isLocalConnection = /localhost|127\.0\.0\.1/.test(databaseUrl)

const schema = { ...authSchema, ...preferencesSchema }

declare global {
  // eslint-disable-next-line no-var
  var __certfolioSqlClient: ReturnType<typeof postgres> | undefined
}

function createClient() {
  return postgres(databaseUrl, {
    ssl: isLocalConnection ? false : "require",
    max: process.env.NODE_ENV === "development" ? 5 : 10,
    idle_timeout: 30,
    connect_timeout: 10,
  })
}

export const client =
  process.env.NODE_ENV === "development"
    ? (globalThis.__certfolioSqlClient ??= createClient())
    : createClient()

export const db = drizzle(client, { schema })

export {
  VerificationsTable,
  SessionsTable,
  UserMfaMethodsTable,
  UsersTable,
} from "@/lib/db/auth/schema"

export { UserPreferencesTable } from "@/lib/db/preferences/schema"

export type {
  Verification,
  NewVerification,
  NewSession,
  NewUser,
  NewUserMfaMethod,
  Session,
  User,
  UserMfaMethod,
} from "@/lib/db/auth/schema"

export type {
  UserPreferences,
  NewUserPreferences,
} from "@/lib/db/preferences/schema"
