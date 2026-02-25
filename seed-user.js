const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { pgTable, uuid, varchar, timestamp, pgEnum, boolean } = require('drizzle-orm/pg-core');
require('dotenv').config();

const userRoleEnum = pgEnum('user_role', ['admin', 'analyst', 'cashier']);

const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: userRoleEnum('role').default('analyst').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

async function main() {
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    console.log('Seed: Creando usuario administrador...');

    try {
        await db.insert(users).values({
            name: 'Administrador',
            email: 'admin@test.com',
            passwordHash: 'admin123', // En un sistema real usaríamos bcrypt
            role: 'admin',
        }).onConflictDoNothing();

        console.log('Seed exitoso: Usuario admin@test.com / admin123 creado.');
    } catch (error) {
        console.error('Error durante el seed:', error);
    }
}

main();
