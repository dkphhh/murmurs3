import { getMurmurByUid } from "$lib/server/db/utils";





export async function load({ params }) {
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

