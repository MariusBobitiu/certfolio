import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as authSchema from "@/lib/db/auth/schema"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is required to initialize the database client.")
}

const isLocalConnection = /localhost|127\.0\.0\.1/.test(connectionString)

export const client = postgres(connectionString, {
  ssl: isLocalConnection ? false : "require",
})

export const db = drizzle(client, { schema: authSchema })

export {
  VerificationsTable,
  SessionsTable,
  UserMfaMethodsTable,
  UsersTable,
} from "@/lib/db/auth/schema"

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
