import { hash } from "@node-rs/argon2"
import { eq } from "drizzle-orm"
import { config } from "dotenv"
import { pathToFileURL } from "node:url"
import { client, db, UsersTable } from "./drizzle"

config({ path: process.env.DOTENV_CONFIG_PATH ?? ".env.local", quiet: true })

const ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL ?? "admin@demo.com"
const ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD ?? "test1234"
const ADMIN_NAME = process.env.DEMO_ADMIN_NAME ?? "Admin"
const ADMIN_SLUG = process.env.DEMO_ADMIN_SLUG ?? "admin"
const ADMIN_IMAGE =
  process.env.DEMO_ADMIN_IMAGE ??
  "https://api.dicebear.com/9.x/initials/svg?seed=Admin"

type SeedOptions = {
  closeConnection?: boolean
}

export async function seedDatabase(options: SeedOptions = {}) {
  const { closeConnection = false } = options

  try {
    const [existingAdmin] = await db
      .select({ id: UsersTable.id })
      .from(UsersTable)
      .where(eq(UsersTable.email, ADMIN_EMAIL))
      .limit(1)

    if (existingAdmin) {
      console.log("✓ Admin user already exists")
      return
    }

    const passwordHash = await hash(ADMIN_PASSWORD)

    await db.insert(UsersTable).values({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      image: ADMIN_IMAGE,
      slug: ADMIN_SLUG,
      password_hash: passwordHash,
      email_verified_at: new Date(),
    })

    console.log(`✓ Admin user created: ${ADMIN_EMAIL}`)
    console.log("✓ Database seeded successfully")
  } catch (error) {
    console.error("Error seeding database:", error)
    throw error
  } finally {
    if (closeConnection) {
      await client.end()
    }
  }
}

async function runSeedCli() {
  await seedDatabase({ closeConnection: true })
}

const isMain = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false

if (isMain) {
  runSeedCli()
    .then(() => {
      process.exitCode = 0
    })
    .catch(() => {
      process.exitCode = 1
    })
}
