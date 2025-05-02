import { searchMurmurs } from "$lib/server/db/utils.ts";
import type { MurmursByRead } from "$lib/server/db/utils.ts"
import { displayPageNum, PAGE_SIZE } from "$lib/pagination.ts"



interface SearchResultType {
    searchResult: {
        isValidQuery: boolean,
        content: MurmursByRead[],
        pageNumList: (number | "……")[],
        query: string,
    }
}

export async function load({ url }): Promise<SearchResultType> {
    const query = url.searchParams.get("q");
    const pageNum = Number(url.searchParams.get("page_num"));
    if (!query) {
        return {
            searchResult: {
                isValidQuery: false,
                content: [],
                pageNumList: [],
                query: ""
            }
        };
    }
    const res = pageNum
        ? await searchMurmurs(query, pageNum, PAGE_SIZE)
        : await searchMurmurs(query, 1, PAGE_SIZE);

    const { allMurmurs, count } = res;

    if (allMurmurs.length == 0) {
        return {
            searchResult: {
                isValidQuery: false,
                content: [],
                pageNumList: [],
                query
            }


        };
    }

    const pageNumList = pageNum ? await displayPageNum(pageNum, count) : await displayPageNum(1, count);

    return {
        searchResult: {
            isValidQuery: true,
            content: allMurmurs,
            pageNumList,
            query
        }
    };

}