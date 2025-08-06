import postgres from "postgres";
import { PRD_DATABASE_URL, DEV_DATABASE_URL } from '$env/static/private';
import { dev } from '$app/environment';


const DATABASE_URL = dev ? DEV_DATABASE_URL : PRD_DATABASE_URL;


if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

export const dbClient = postgres(DATABASE_URL!, { prepare: false });

