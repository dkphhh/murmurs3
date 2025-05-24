import { searchMurmurs } from "$lib/server/db/utils.ts";
import type { MurmursByRead } from "$lib/server/db/utils.ts"
import { displayPageNum, PAGE_SIZE } from "$lib/pagination.ts"
import { redirect } from "@sveltejs/kit";



interface SearchResultType {
    searchResult: {
        content: MurmursByRead[],
        pageNumList: (number | "……")[],
        query: string,
    }
}

export async function load({ url, locals }): Promise<SearchResultType> {
    const query = url.searchParams.get("query") as string;
    const pageNum = Number(url.searchParams.get("page_num"));
    if (!query) {
        locals.notification.set({
            type: "error",
            description: "查询内容不能为空",
        });
        redirect(307, "/search");
    }

    const res = pageNum
        ? await searchMurmurs(query, pageNum, PAGE_SIZE)
        : await searchMurmurs(query, 1, PAGE_SIZE);

    const { allMurmurs, count } = res;

    if (allMurmurs.length == 0) {

        locals.notification.set({
            type: "warning",
            description: `"${query}" 检索结果为空`,
        });
        redirect(307, "/search");
    }

    const pageNumList = pageNum ? await displayPageNum(pageNum, count) : await displayPageNum(1, count);

    return {
        searchResult: {
            content: allMurmurs,
            pageNumList,
            query
        }
    };

}