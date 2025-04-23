import { redirect } from '@sveltejs/kit';
import { auth } from "$lib/auth/auth.js";

export async function load({ request }) {
    const session = await auth.api.getSession({
        headers: request.headers
    })
    if (!session?.user) {
        redirect(302, "/auth")
    }
}
