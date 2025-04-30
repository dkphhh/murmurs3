import type { Actions } from "./$types";
import { updateMurmurs, createTags, createMurmurWithTags, updateMurmurFileUrls, type MurmurToUpdate, type MurmurToCreate } from "$lib/server/db/utils.ts";
import { fail, redirect } from '@sveltejs/kit';
import { uploadFiles } from '$lib/upload-files.ts';



export const actions = {
    create: async ({ request })
        : Promise<ReturnType<typeof fail>> => {
        const formData = await request.formData();

        // 获取表单内容
        const text = formData.get("text") as string
        const files = formData.getAll('files') as File[]
        const authorId = formData.get("authorId") as string
        const displayState = (formData.get("displayState") as string) === "1" ? true : false


        let murmurUid: string
        try {

            // 构建创建murmur的对象，这里把文件和标签留空，留待后台异步操作，避免卡顿
            const murmurTextToCreate: MurmurToCreate = {
                content: text,
                display: displayState,
                authorId: authorId,
                fileUrls: [],
                tagNames: [],
            }

            if ((!text || text.trim() === '') && files.length == 0) {
                throw Error("内容不能为空");
            }
            // 创建murmur文本内容
            const res = await createMurmurWithTags(murmurTextToCreate);

            // 获取创建的murmur的uid
            murmurUid = res.murmur.uid;

            // 后台处理耗时任务
            (async () => {

                try {

                    // 处理文件上传的任务
                    let filesTask: Promise<string[]> = Promise.resolve([]);

                    if (files && files.length > 0) {
                        filesTask = uploadFiles(files);
                    }
                    // 处理标签的任务
                    const tagsTask = createTags(text);

                    // 等待文件上传和标签创建的任务完成
                    const [fileUrls, tags] = await Promise.all([filesTask, tagsTask])

                    // 更新murmur的文件和标签
                    const fullMurmurToUpdate: MurmurToUpdate = {
                        murmurUid: murmurUid,
                        content: text,
                        fileUrls: fileUrls,
                        tagNames: tags,
                    }
                    await updateMurmurs(fullMurmurToUpdate);



                } catch (error) {
                    console.error("处理文件和标签时出错:", (error as Error).message);
                    //由于这个异步函数是在后台执行的，没有 await，所以这里抛出的错误不会被外部的 try catch 模块接收，所以不抛出 error，只返回一个失败的结果
                    return fail(422, {
                        error: true,
                        description: `处理文件和标签时出错:${(error as Error).message}`,
                    })
                }

            })()

        } catch (error) {
            console.log(error);
            // throw error as Error
            return fail(422, {
                error: true,
                description: (error as Error).message,
            })

        }


        // 因为标签和文件上传操作在后台执行，所以跳转时带上提示用户处理中的查询参数
        redirect(303, `/murmur/${murmurUid}?processing=true`);



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

            // 先更新文本内容和显示状态
            if ((!text || text.trim() === '') && files.length == 0) {
                throw Error("内容不能为空");
            }

            const murmursTextToUpdate: MurmurToUpdate = {
                murmurUid: murmurId,
                content: text,
                display: displayState,
                tagNames: tags,

            }

            await updateMurmurs(murmursTextToUpdate);


            // 处理附件更新，这个任务放在后台运行
            (async () => {

                try {  // 处理文件更新
                    let newFilesUrls: string[] = [] // 新文件链接
                    let fileUrls: string[] = [...filesSrc]; // 老文件链接
                    if (files && files.length > 0) {

                        newFilesUrls = await uploadFiles(files);

                        fileUrls = [...fileUrls, ...newFilesUrls] // 将新老链接合并
                    }

                    // 将新的文件链接和标签文本上传到数据库


                    await updateMurmurFileUrls(fileUrls, murmurId)

                    console.log("文件处理完成", fileUrls);
                } catch (error) {
                    console.error("处理文件更新时出错:", (error as Error).message);
                    //由于这个异步函数是在后台执行的，没有 await，所以这里抛出的错误不会被外部的 try catch 模块接收，所以不抛出 error，只返回一个失败的结果
                    return fail(422, {
                        error: true,
                        description: `处理文件更新时出错:${(error as Error).message}`,
                    })
                }

            })()

        } catch (error) {
            console.log(error);
            // throw error as Error
            return fail(422, {
                error: true,
                description: (error as Error).message,
            })

        }

        if (files.length > 0) {
            // 文件上传在后台执行，所以需要给用户一个提示
            redirect(303, `/murmur/${murmurId}?processing=true`);
        }

        redirect(303, `/murmur/${murmurId}`);

    },
} satisfies Actions
