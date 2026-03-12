import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL!
const isLocalConnection = /localhost|127\.0\.0\.1/.test(connectionString)

export const client = postgres(connectionString, {
	ssl: isLocalConnection ? false : 'require',
})

export const UsersTable = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    image: text('image').notNull(),
		password_hash: text('password_hash').notNull(),
		email_verified_at: timestamp('email_verified_at'),
    created_at: timestamp('created_at').defaultNow().notNull(),
		updated_at: timestamp('updated_at').defaultNow().notNull(),
		archived_at: timestamp('archived_at'),
		deleted_at: timestamp('deleted_at'),
  },
  (users) => [
      uniqueIndex('unique_idx').on(users.email),
	]
)

export const SessionsTable = pgTable(
	'sessions',
	{
		id: serial('id').primaryKey(),
		user_id: serial('user_id').notNull(),
		session_token_hash: text('session_token_hash').notNull(),
		expires_at: timestamp('expires_at').notNull(),
		created_at: timestamp('created_at').defaultNow().notNull(),
		last_seen_at: timestamp('last_seen_at'),
		ip_address: text('ip_address'),
		user_agent: text('user_agent'),
		
	},
)

export type User = InferSelectModel<typeof UsersTable>
export type NewUser = InferInsertModel<typeof UsersTable>

// Connect to  Postgres
export const db = drizzle(client)