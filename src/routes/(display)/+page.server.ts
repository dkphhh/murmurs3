import { readMurmurs } from "$lib/server/db/utils";

const PAGE_SIZE = Number(process.env.PAGE_SIZE as string);

// TODO：将 write 作为一个组件放到首页，用户输入密码后可以呼出
// TODO: 重写 write 的ui，增加上传gif、视频、音频、附件等功能，再加一个点击上传图片
// TODO: 增加类似 threads 的逻辑 


export async function load() {
    const murmurs = await readMurmurs(1, PAGE_SIZE);

    return {
        murmurs,
    };
}



