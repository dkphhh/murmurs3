
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
    checkUserExist: async ({ request, locals }) => {

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
            locals.notification.set({
                type: "error",
                description: "检查用户是否存在时发生错误，请稍后再试",
            });


        }


    }
} satisfies Actions;