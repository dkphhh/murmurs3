export const allowedMediaFileTypes = {
    image: ["jpg", "jpeg", "png", "webp", "gif"],
    video: ["mp4", "mov"],
    audio: ["mp3", "wav", "ogg"],
    other: ["pdf", "docx", "pptx", "ppt", "txt", "md", "zip", "rar", "doc", "xls", "xlsx"],
    all: () => {
        return [...allowedMediaFileTypes.image, ...allowedMediaFileTypes.video, ...allowedMediaFileTypes.audio, ...allowedMediaFileTypes.other]
    }
}

/**
  * 获取文件链接的后缀名（不含点），如 jpg、webp、mp4、mp3 等
  * @param url 文件链接
  * @returns 后缀名字符串（小写），如果没有后缀返回空字符串
  */
export function getFileExtension(url: string): string {
    // 去除查询参数和哈希
    const cleanUrl = url.split(/[?#]/)[0];
    // 匹配最后一个点后的内容
    const match = cleanUrl.match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1].toLowerCase() : "";
}

/**
 * 获取文件链接中的文件名（包含扩展名）
 * @param url 文件链接
 * @returns 文件名字符串，如果没有则返回空字符串
 */
export function getFileName(url: string): string {
    // 去除查询参数和哈希
    const cleanUrl = url.split(/[?#]/)[0];
    // 匹配最后一个斜杠后的内容
    const match = cleanUrl.match(/\/([^/]+)$/);
    return match ? match[1] : "";
}
