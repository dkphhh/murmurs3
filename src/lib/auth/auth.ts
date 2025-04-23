import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { dbClient } from "../server/db/db.ts";
import { user, session, account, verification } from "../server/db/scheme/auth-schema.ts";
import { drizzle } from "drizzle-orm/postgres-js";


const db = drizzle({ client: dbClient });

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user,
            session,
            account,
            verification,
        }
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true
    },
    session: {
        cookieCache: {
            enabled: true, // Enable caching session in cookie (default: `false`)	
            maxAge: 60 * 60 * 24,  // Cache session for 1 day
        }
    }
})

