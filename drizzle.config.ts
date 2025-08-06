import { defineConfig } from 'drizzle-kit';

if (!process.env.DEV_DATABASE_URL) throw new Error('DATABASE_URL is not set');

export default defineConfig({
	schema: './src/lib/server/db/scheme',
	dbCredentials: { url: process.env.DEV_DATABASE_URL },
	verbose: true,
	strict: true,
	dialect: 'postgresql'
});
