import { getMurmurByUid, deleteMurmurs } from "$lib/server/db/utils";
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from "./$types";



export const load: PageServerLoad = async ({ params }) => {

    const theMurmur = await getMurmurByUid(params.murmurUid);

    if (!theMurmur) {
        return error(404, "没有找到内容");
    }

    return {
        pageContent: {
            theMurmur
        },

    };
}

export const actions = {
    delete: async ({ request, locals }) => {

        const formData = await request.formData();

        const murmurUid = formData.get("murmurUid") as string

        try {
            await deleteMurmurs([murmurUid]);
        }
        catch (err) {
            console.error(err);
            locals.notification.set({
                type: "error",
                description: "删除失败，请稍后再试",
            })

        }
        redirect(303, "/");
    }
} satisfies Actions