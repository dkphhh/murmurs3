/**
 * 给 murmurs 生成Uid
 *
 * @return {String} 返回有当前时间构成的字符串，形式：YYYYMMDDHHmmss
 */
export function generateUid(): string {
    const date = new Date();
    // 设置时区和格式
    const formatter = new Intl.DateTimeFormat("zh-CN", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    // 按格式转化生成的日期+时间
    const parts = formatter.formatToParts(date);

    // 去掉分隔符，只保留数字，组成字符串
    const result = parts.reduce((acc, part) => {
        if (part.type != "literal") {
            acc += part.value;
            return acc;
        } else {
            return acc;
        }
    }, "");

    return result + Math.random().toString(36).slice(2, 6); // 结尾加上一串随机字符串
}