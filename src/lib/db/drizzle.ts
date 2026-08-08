import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as authSchema from "@/lib/db/auth/schema"
import * as credentialsSchema from "@/lib/db/credentials/schema"
import * as preferencesSchema from "@/lib/db/preferences/schema"
import * as profileSchema from "@/lib/db/profile/schema"
import * as projectsSchema from "@/lib/db/projects/schema"
import * as skillsSchema from "@/lib/db/skills/schema"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is required to initialize the database client.")
}

const databaseUrl: string = connectionString

const isLocalConnection = /localhost|127\.0\.0\.1/.test(databaseUrl)

const schema = {
  ...authSchema,
  ...preferencesSchema,
  ...profileSchema,
  ...projectsSchema,
  ...credentialsSchema,
  ...skillsSchema,
}

declare global {
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
  UserRecoveryCodesTable,
  AuthRateLimitsTable,
  TrustedMfaDevicesTable,
  UsersTable,
} from "@/lib/db/auth/schema"

export { UserPreferencesTable } from "@/lib/db/preferences/schema"
export { UserLinksTable } from "@/lib/db/profile/schema"
export { SkillsTable } from "@/lib/db/skills/schema"
export {
  ProjectsTable,
  ProjectEvidenceLinksTable,
  projectStatusEnum,
  projectEvidenceKindEnum,
} from "@/lib/db/projects/schema"

export {
  CredentialsTable,
  IssuersTable,
  credentialStatusEnum,
  credentialSourceTypeEnum,
  credentialVerificationStatusEnum,
  issuerKindEnum,
} from "@/lib/db/credentials/schema"

export type {
  Verification,
  NewVerification,
  NewSession,
  NewUser,
  NewUserMfaMethod,
  NewUserRecoveryCode,
  AuthRateLimit,
  NewAuthRateLimit,
  NewTrustedMfaDevice,
  Session,
  TrustedMfaDevice,
  User,
  UserMfaMethod,
  UserRecoveryCode,
} from "@/lib/db/auth/schema"

export type {
  Credential,
  Issuer,
  NewCredential,
  NewIssuer,
} from "@/lib/db/credentials/schema"

export type {
  UserPreferences,
  NewUserPreferences,
} from "@/lib/db/preferences/schema"

export type { UserLink, NewUserLink } from "@/lib/db/profile/schema"
export type { Skill, NewSkill } from "@/lib/db/skills/schema"

export type {
  Project,
  NewProject,
  ProjectEvidenceLink,
  NewProjectEvidenceLink,
} from "@/lib/db/projects/schema"
