import { countMurmursRow } from "$lib/server/db/utils";

export const PAGE_SIZE = Number(process.env.PAGE_SIZE as string);




/**
 * 计算需要展示的 murmurs 的总页数
 * 这里计算的总页数是根据数据库中需要展示的 murmurs 总数计算的
 *
 * @export
 * @return {*}  {Promise<number>}
 */
export async function countTotalPages(): Promise<number> {
    const totalMurmurs = await countMurmursRow()
    return Math.ceil(totalMurmurs / PAGE_SIZE)
}


/**
 * 根据当前页码和需要展示的murmurs总数，返回需要展示的页码列表
 * 如果不提供 murmurs 总数，就按数据库中需要展示的 murmurs 总数计算 
 *
 * @export
 * @param {number} currentPage 当前页码
 * @param {number} [totalCount] 需要展示的 murmurs 总数
 * @return {*}  {(Promise<(number | "……")[]>)}
 */
export async function displayPageNum(currentPage: number, totalCount?: number): Promise<(number | "……")[]> {
    const totalMurmurs = totalCount ? totalCount : await countMurmursRow()
    const totalPages = Math.ceil(totalMurmurs / PAGE_SIZE)

    const pageNumList: (number | "……")[] = []

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            pageNumList.push(i)
        }
    } else if (currentPage <= 3) {
        return [1, 2, 3, 4, 5, "……", totalPages]
    } else if (currentPage >= totalPages - 2) {
        return [1, "……", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    } else {
        return [1, "……", currentPage - 1, currentPage, currentPage + 1, "……", totalPages]
    }

    return pageNumList
}

