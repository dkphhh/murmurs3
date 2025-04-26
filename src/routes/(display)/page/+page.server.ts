import { readMurmurs } from "$lib/server/db/utils.ts";
import { PAGE_SIZE, displayPageNum } from "$lib/pagination";



export async function load() {
    const murmurs = await readMurmurs(1, PAGE_SIZE);
    return {
        content: murmurs,
        pageNumList: await displayPageNum(1),
    };
}

