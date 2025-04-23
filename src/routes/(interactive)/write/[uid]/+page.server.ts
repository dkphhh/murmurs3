import type { Actions, PageServerLoad } from "./$types";
import { updateMurmurs } from "$lib/server/db/utils";
import { fail, redirect } from '@sveltejs/kit';
import { uploadImages } from '$lib/upload-images';
import { getMurmurByUid } from "$lib/server/db/utils";




export const load: PageServerLoad = async ({ params }) => {
    const theMurmur = await getMurmurByUid(params.uid);
    if (!theMurmur) {
        return {
            error: true,
            errorMessage: "没有找到对应内容",
        }
    }
    return {
        theMurmur
    }
}

export const actions = {

    default: async ({ request })
        : Promise<ReturnType<typeof fail>> => {
        try {
            const formData = await request.formData();

            const text = formData.get("text") as string
            const images = formData.getAll('images') as File[]
            const murmurId = formData.get("murmurId") as string
            const displayState = formData.get("displayState") as string == "1" ? true : false
            const tags = formData.getAll("tags") as string[]

            if ((!text || text.trim() === '') && images.length == 0) {
                throw Error("内容不能为空");
            }

            let imageUrls: string[] = [];
            if (images && images.length > 0) {

                imageUrls = await uploadImages(images);
            }


            const finalContent = text +
                (imageUrls.length > 0
                    ? '\n' + imageUrls.map((imageUrl) => `![](${imageUrl})\n`).join("\n")
                    : '');

            await updateMurmurs(murmurId, finalContent, displayState, tags);


        } catch (error) {
            // console.log(error);
            // throw error as Error
            return fail(422, {
                error: true,
                description: (error as Error).message,
            })

        }

        redirect(303, '/');
    },
} satisfies Actions
