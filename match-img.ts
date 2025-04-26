// import * as fs from 'fs';
// import * as csv from 'fast-csv';
// import { createMediaFiles } from "./src/lib/server/db/utils"
// import type { SelectMediaFile } from "./src/lib/server/db/scheme/content-scheme"

// interface murmurType {
//     uid: string,
//     content: string,
// }

/**
 * 从 Markdown 文本中提取所有内联图片链接。
 * 支持格式： ![alt text](image_url) 和 ![alt text](image_url "title")
 * @param markdownText 包含 Markdown 格式的文本字符串。
 * @returns 一个包含所有提取到的图片 URL 的字符串数组。
 */
export function extractImageUrls(markdownText: string): string[] {
    const imageUrls: string[] = [];
    // 正则表达式匹配 Markdown 图片语法 ![alt](url "title") 或 ![alt](url)
    // 它会捕获括号内的 URL 部分
    const imageRegex = /!\[.*?\]\(([^)\s]+)(?:\s+["'].*?["'])?\)/g;

    let match;
    while ((match = imageRegex.exec(markdownText)) !== null) {
        // match[1] 包含捕获的 URL
        if (match[1]) {
            imageUrls.push(match[1]);
        }
    }

    return imageUrls;
}

