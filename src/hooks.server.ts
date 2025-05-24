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
    // 为每个请求添加简单的 notification 通知系统
    const getNotification = () => {

        const notification = event.cookies.get('notification');

        if (notification) {
            event.cookies.delete('notification', { path: '/' });
            try {
                const parsed = JSON.parse(notification);

                return parsed
            } catch (e) {
                console.error('[hooks.server.ts] Error parsing notification cookie:', e);
                return null;
            }
        }
        return null;
    };

    const setNotification = (data: NotificationType) => {

        event.cookies.set('notification', JSON.stringify(data), {
            path: '/',
            maxAge: 30, // 只保留30秒，避免通知持久化
            httpOnly: false, // 允许 JavaScript 访问
        });
    };

    // 将 notification 方法附加到 event.locals 上
    event.locals.notification = { get: getNotification, set: setNotification };

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