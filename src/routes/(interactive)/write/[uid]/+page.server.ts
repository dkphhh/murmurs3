import { getMurmurByUid } from "$lib/server/db/utils";
import { redirect } from "@sveltejs/kit";





export async function load({ params, locals }) {
    const theMurmur = await getMurmurByUid(params.uid);
    if (!theMurmur) {
        console.error("没有找到对应内容", params.uid);
        locals.notification.set({
            type: "error",
            description: "没有找到对应内容",
        });
        redirect(303, "/");
    }
    return {
        theMurmur
    }
}

