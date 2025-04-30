import { readMurmurs } from "$lib/server/db/utils.ts";

const PAGE_SIZE = Number(process.env.PAGE_SIZE as string);






export async function load() {
    const murmurs = await readMurmurs(1, PAGE_SIZE);

    return {
        murmurs,
    };
}



