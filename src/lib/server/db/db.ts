import postgres from "postgres";


if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}


export const dbClient = postgres(process.env.DATABASE_URL!, { prepare: false });

