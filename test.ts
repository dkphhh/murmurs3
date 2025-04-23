import { createTags } from "./src/lib/server/db/utils";
const TAGS = ["图像", "方法论", "洞察", "科技", "幽默", "情绪", "自我", "评论", "文艺", "编程"]

const res = await createTags(`[《机器人之梦》](https://movie.douban.com/subject/35426925/?dt_dapp=1)：当代爱情的本质是什么？不是长长久久，也没必要从一而终，大家共乘一辆车，share 过美妙与苦涩的记忆，有人到站下车，但你留下的习惯还在我身上，我们都变成了更好的人，知道如何正确地爱与表达。有人继续向前，但每当音乐想起，心里永远还有你的位置。`, TAGS)


console.log(res)
