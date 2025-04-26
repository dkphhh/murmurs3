
import { auth } from "$lib/auth/auth.ts";


export async function load({ request }) {
    const session = await auth.api.getSession({
        headers: request.headers
    })

    return {
        session
    }
}