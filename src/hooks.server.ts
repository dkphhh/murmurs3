import { auth } from "$lib/auth/auth"; // path to your auth file
import { svelteKitHandler } from "better-auth/svelte-kit";

export async function handle({ event, resolve }) {

    if (event.url.pathname === "/ping") {
        return new Response("pong", {
            headers: {
                "content-type": "text/plain"
            }
        });
    }

    return svelteKitHandler({ event, resolve, auth });
}

export async function handleFetch({ request, fetch }) {
    const requestedUrl = new URL(request.url);
    if (requestedUrl.pathname === "/tik") {
        return await fetch("/ping")
    }
    return await fetch(request);

}


export async function handleError({ error }: { error: Error }) {
    //  TODO:  Handle the error
    console.error("Error in handleError:", error);
}