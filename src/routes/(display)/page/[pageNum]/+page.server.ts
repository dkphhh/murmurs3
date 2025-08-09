import { readMurmurs } from "$lib/server/db/utils";
import { error, redirect } from '@sveltejs/kit';
import { PAGE_SIZE, displayPageNum, countTotalPages } from "$lib/pagination";



export async function load({ params }): Promise<{
    pageContent: {
        murmurs: MurmursByRead[];
        pageNumList: (number | "……")[];
        currentPage: number;
    }
}> {
    const pageNum = Number(params.pageNum);
    if (pageNum < 1 || pageNum > await countTotalPages()) {
        return redirect(307, "/page/1");
    }
    const murmurs = await readMurmurs(pageNum, PAGE_SIZE);
    if (!murmurs) {
        return error(404, "没有找到内容");
    }
    return {
        pageContent: {
            murmurs,
            pageNumList: await displayPageNum(pageNum),
            currentPage: pageNum,
        }
    };
}

