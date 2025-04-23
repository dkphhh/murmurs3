import type { Actions } from "./$types";
import { createMurmur } from "$lib/server/db/utils";
import { fail, redirect } from '@sveltejs/kit';
import { uploadImages } from '$lib/upload-images';


// TODO 先不做：优化图片上传和自动打标签流程，让他们并行执行，或者打标签可以后置，打完以后弹出一个提醒就可以了
// TODO 增加一个内容修改的页面

export const actions = {
    default: async ({ request })
        : Promise<ReturnType<typeof fail>> => {
        try {
            const formData = await request.formData();

            const text = formData.get("text") as string
            const images = formData.getAll('images') as File[]
            const authorId = formData.get("authorId") as string

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

            await createMurmur(finalContent, authorId);


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
