
import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import 'dotenv/config';
import { client, db, UsersTable } from './drizzle';

const ADMIN_EMAIL = 'admin@demo.com';
const ADMIN_PASSWORD = 'test1234';

export async function seed() {
	try {
		await db.execute(sql`
			CREATE TABLE IF NOT EXISTS users (
				id SERIAL PRIMARY KEY,
				name TEXT NOT NULL,
				email TEXT NOT NULL UNIQUE,
				image TEXT NOT NULL,
				password_hash TEXT NOT NULL,
				email_verified_at TIMESTAMP,
				created_at TIMESTAMP NOT NULL DEFAULT NOW(),
				updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
				archived_at TIMESTAMP,
				deleted_at TIMESTAMP
			)
		`);

		const [existingAdmin] = await db
			.select({ id: UsersTable.id })
			.from(UsersTable)
			.where(eq(UsersTable.email, ADMIN_EMAIL))
			.limit(1);

		if (existingAdmin) {
			console.log('✓ Admin user already exists');
			return;
		}

		const passwordHash = await hash(ADMIN_PASSWORD);

		await db.insert(UsersTable).values({
			name: 'Admin',
			email: ADMIN_EMAIL,
			image: 'https://api.dicebear.com/9.x/initials/svg?seed=Admin',
			password_hash: passwordHash,
			email_verified_at: new Date(),
		});

		console.log('✓ Admin user created: admin@demo.com');
		console.log('✓ Database seeded successfully');

		// Add any additional seeding logic here (e.g., creating sample posts, comments, etc.)
	} catch (error) {
		console.error('Error seeding database:', error);
		throw error;
	} finally {
		await client.end();
	}
}

seed()
	.then(() => {
		process.exitCode = 0;
	})
	.catch(() => {
		process.exitCode = 1;
	});