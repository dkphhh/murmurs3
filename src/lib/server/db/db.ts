import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL


if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

export const dbClient = postgres(DATABASE_URL!, { prepare: false });

