
import { auth } from "$lib/auth/auth.ts";


export async function load({ request, locals }) {
    const session = await auth.api.getSession({
        headers: request.headers
    });
    // 获取 notification 消息
    const notification = locals.notification.get();
    return {
        session,
        notification
    }
}