import type { Actions } from "./$types";
import { createMurmur, updateMurmurs } from "$lib/server/db/utils";
import { fail, redirect } from '@sveltejs/kit';
import { uploadFiles } from '$lib/upload-files.ts';



// TODO 先不做：优化图片上传和自动打标签流程，让他们并行执行，或者打标签可以后置，打完以后弹出一个提醒就可以了

export const actions = {
    create: async ({ request })
        : Promise<ReturnType<typeof fail>> => {
        const formData = await request.formData();

        const text = formData.get("text") as string
        const files = formData.getAll('files') as File[]
        const authorId = formData.get("authorId") as string
        const displayState = (formData.get("displayState") as string) === "1" ? true : false



        let murmurUid: string
        try {
  

            if ((!text || text.trim() === '') && files.length == 0) {
                throw Error("内容不能为空");
            }

            let fileUrls: string[] = [];
            if (files && files.length > 0) {

                fileUrls = await uploadFiles(files);
            }


            const res = await createMurmur(text, fileUrls, authorId, displayState);

            murmurUid = res.murmur.uid


        } catch (error) {
            console.log(error);
            // throw error as Error
  

            return fail(422, {
                error: true,
                description: (error as Error).message,
            })

        }

        redirect(303, `/murmur/${murmurUid}`);
    },

    update: async ({ request })
        : Promise<ReturnType<typeof fail>> => {

        // 获取表单内容
        const formData = await request.formData();
        // 获取需要更新的 murmur 的uid
        const murmurId = formData.get("murmurId") as string

        const text = formData.get("text") as string // 更新的文本内容

        const filesSrc = formData.getAll('filesSrc') as string[] // 原有的图片文件

        const files = formData.getAll('files') as File[] // 更新的图片文件

        // 是否展示
        const displayState = (formData.get("displayState") as string) === "1" ? true : false

        // 获取对应的标签
        const tags = formData.getAll("tags") as string[]

        try {

            if ((!text || text.trim() === '') && files.length == 0) {
                throw Error("内容不能为空");
            }

            // 处理文件更新，因为上传的文件都是blob格式的链接

            let fileUrls: string[] = [...filesSrc];
            if (files && files.length > 0) {

                const uploadedUrls = await uploadFiles(files);

                fileUrls = [...fileUrls, ...uploadedUrls]
            }

            await updateMurmurs(murmurId, text, displayState, fileUrls, tags);



        } catch (error) {
            console.log(error);
            // throw error as Error
            return fail(422, {
                error: true,
                description: (error as Error).message,
            })

        }

        redirect(303, `/murmur/${murmurId}`);

    },
} satisfies Actions
