import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL


if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

console.log("DB_URL:", DATABASE_URL);

export const dbClient = postgres(DATABASE_URL!, { prepare: false });

