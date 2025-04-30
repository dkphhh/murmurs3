import postgres from "postgres";
import { dev } from '$app/environment';


const DATABASE_URL = dev ? process.env.DEV_DATABASE_URL : process.env.PRO_DATABASE_URL;

if (dev) {
    console.log("Using dev database URL:", DATABASE_URL);
} else {
    console.log("Using prod database URL:", DATABASE_URL);
}

if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}


export const dbClient = postgres(DATABASE_URL!, { prepare: false });

