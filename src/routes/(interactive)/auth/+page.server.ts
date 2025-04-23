
import { fail } from "@sveltejs/kit";
import type { Actions } from './$types';
import { user, account, verification, session } from "$lib/server/db/scheme/auth-schema.ts";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { dbClient } from "$lib/server/db/db.ts";



const db = drizzle({
    client: dbClient, schema: {
        user, account, verification, session
    }
});



export const actions = {
    checkUserExist: async ({ request }) => {

        try {
            const formData = await request.formData();
            const email = formData.get('email') as string;

            const [theUser] = await db.select().from(user).where(eq(user.email, email))


            if (theUser) {
                return {
                    userExist: true,
                    Image: theUser.image
                }
            }

            return {
                userExist: false,
                Image: ""
            }


        } catch (err) {
            console.log(err);
            return fail(422, {
                error: true,
                description: (err as Error).message,
            })

        }


    }
} satisfies Actions;