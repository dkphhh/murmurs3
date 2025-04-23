import { and, desc, eq, inArray, sql, count } from "drizzle-orm";

import {
  murmurs,
  murmursToTags,
  tags,
} from "./scheme/content-scheme.ts";
import type { SelectMurmur, SelectTags, } from "./scheme/content-scheme.ts";


import * as schema from "./scheme/content-scheme.ts";
import { drizzle } from "drizzle-orm/postgres-js";
import { dbClient } from "./db.ts";

const OPEN_ROUTER_API_KEY = Bun.env.OPEN_ROUTER_API_KEY as string

const TAGS = ["图像", "方法论", "洞察", "科技", "幽默", "情绪", "自我", "评论", "文艺", "编程"]

const db = drizzle({ client: dbClient, schema });

export type MurmursByRead = {
  uid: string;
  createdAt: Date;
  content: string;
  tags: {
    tag: string;
    uid: number;
  }[];
}

export type MurmursBySearch = {
  allMurmurs: MurmursByRead[];
  count: number;
}


/** 
 * 根据文本内容，由AI自动生成 tags（在一个范围里让AI挑选tags）
 * @param {any} murmur:string 文本内容
 * @param {any} tagScope:string[]=TAGS 选择 tags 范围
 * @returns {any} :Promise<string[]>
 */
export async function createTags(murmur: string, tagScope: string[] = TAGS): Promise<string[]> {


  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPEN_ROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "qwen/qwen-2.5-7b-instruct",
      "messages": [{
        "role": "system",
        "content": `你是一个标签生成器，你的任务是根据用户输入的内容生成相关的标签，用户输入的内容都是markdown格式的文本。
        
        下面是生成标签的要求：

        1. 你只能从以下范围选择标签，不要输出下面没有的标签:
        ${tagScope.join(",")}
        
        2. 输出的标签的数量不超过3个，标签之间用","分隔。
        
        3. 如果你发现用户输入的内容中有markdown格式的图片插入语句，请在标签中加入"图像"标签。如果没有，请不要在标签中加入"图像"标签。

        4. 我会用一段程序脚本自动处理你的输出，所以你只需要输出标签，不需要加任何提示语句或者引导词。这个自动处理的脚本如下，请不要输出这个脚本无法处理的内容：
        const tags = yourOutput.split(",").map((tag) => tag.trim());
        `
      },
      {
        "role": "user",
        "content": murmur
      }
      ]
    })
  });
  const resJson = await res.json() as {
    choices: [
      {
        message: {
          content: string
        }
      }
    ]
  };
  const tags = resJson.choices[0].message.content.split(",").map((tag) => tag.trim()).slice(0, 3);

  return tags;
}


/**
 * 在输入的tags列表中找到数据库里没有的 tags，并向数据插入，返回所有 tag 的 tag 对象
 * @param {any} tagNames:string[]
 * @returns {any} :Promise<SelectTags[]>
 */
export async function insertNewTags(tagNames: string[]): Promise<SelectTags[]> {
  return await db.transaction(async (tx) => {
    // 找到已经存在的 tags 记录
    const existingTags = await tx.query.tags.findMany(
      {
        where: inArray(tags.tag, tagNames),
      },
    );

    const existingTagsName = existingTags.map((tag) => tag.tag);

    // 筛选不存在的 tags 记录
    const notExistingTagNames = tagNames.filter((tagName) => {
      return !existingTagsName.includes(tagName);
    });

    // 将不存在的 tags 记录写入 tags 表

    let newTags: SelectTags[] = [];
    if (notExistingTagNames.length > 0) {
      newTags = await tx.insert(tags).values(
        notExistingTagNames.map((tag) => ({
          tag: tag,
        })),
      ).onConflictDoNothing().returning();
    }

    // 合并所有结果
    const allTags = [...existingTags, ...newTags];

    return allTags;
  });
}

/**
 * 想数据库上传 murmur。将 content 写入 murmurs 表，并将 tagNames 写入 tags 表，并将 murmurs 和 tags 关联起来
 * @param {any} content:string
 * @param {any} tagNames:string[]=[]
 * @param {string} authorId:string 作者的 id
 * @returns {any}
 */
export async function createMurmurWithTags(content: string, tagNames: string[] = [], authorId: string): Promise<{
  murmur: SelectMurmur
  tags: SelectTags[]
}> {
  return await db.transaction(async (tx) => {
    // 将 content 写入 murmurs 表


    if (content.length === 0 && tagNames.length === 0) {
      throw new Error("输入内容不能为空");
    }


    const [newMurmur] = await tx.insert(murmurs).values({
      content,
      authorId
    }).returning();

    // 声明一个 allTags 变量
    let allTags: SelectTags[] | undefined;

    // 如果有 tags
    if (tagNames.length > 0) {
      // 更新tags，并返回所有 tags
      allTags = await insertNewTags(tagNames);

      // 将 murmur 与 tags 的关系写入 murmursToTags 表
      await Promise.all(allTags.map((tag) => {
        return tx.insert(murmursToTags).values({
          murmursUid: newMurmur.uid,
          tagsUid: tag.uid,
        });
      }));
    }

    return {
      murmur: newMurmur,
      tags: allTags ?? [],
    };
  });
}

/**
 * 更新 murmur 的内容和标签
 *
 * @param {string} uid 对应需要更新的 murmur 的 uid
 * @param {string} content 对应 murmur 更新后的内容
 * @param {string[]} tagNames 对应 murmur 更新后端 tag
 *
 * @return {*}  {Promise<{
 *   murmur: SelectMurmur;
 *   tags: SelectTags[];
 * }>}
 */
export async function updateMurmurs(
  uid: string,
  content: string,
  display: boolean,
  tagNames: string[],
): Promise<{
  murmur: SelectMurmur;
  tags: SelectTags[];
}> {
  return await db.transaction(async (tx) => {
    // 更新murmur的content
    const updatedMurmurs = await tx.update(murmurs).set({
      content: content,
      display: display,
    }).where(eq(murmurs.uid, uid)).returning();


    // 如果此时 updatedMurmurs 的长度为零，说明 uid 没有匹配上，抛出错误
    if (updatedMurmurs.length === 0) {
      throw new Error(`Uid ${uid} 不正确，没有这条 murmur`);
    }


    const updatedMurmur = updatedMurmurs[0];


    // 处理标签更新

    // 将新增标签加入数据库，返回的 allTags 是包含了所有标签对象的数组
    const allTags = await insertNewTags(tagNames);
    const allTagsId = allTags.map((tag) => tag.uid);

    // 对比新标签数组和已有标签数组，找出需要更新和删除的标签
    const existingTagRelations = await tx.select({
      tagsUid: murmursToTags.tagsUid,
    })
      .from(murmursToTags).where(eq(murmursToTags.murmursUid, uid));
    const existingTagsId = existingTagRelations.map((tag) => tag.tagsUid);

    // 找出需要删除的标签,并删除
    const tagsToDelete = existingTagsId.filter((tagsUid) =>
      !allTagsId.includes(tagsUid)
    );

    if (tagsToDelete.length > 0) {
      await tx.delete(murmursToTags).where(
        and(
          eq(murmursToTags.murmursUid, uid),
          inArray(murmursToTags.tagsUid, tagsToDelete),
        ),
      );
    }

    // 找出需要新增的标签，并插入
    const tagsToInsert = allTagsId.filter((tagsUid) =>
      !existingTagsId.includes(tagsUid)
    );
    const valuesToInsert = tagsToInsert.map((tagUid) => {
      return { murmursUid: uid, tagsUid: tagUid };
    });

    if (valuesToInsert.length > 0) {
      await tx.insert(murmursToTags).values(valuesToInsert);
    }

    const result = {
      murmur: updatedMurmur,
      tags: allTags
    };

    return result;
  });
}

/**
 *  根据页码和页面内容长度读取 murmurs 内容
 *
 * @export
 * @param {number} pageNum 页码
 * @param {number} pageSize 页面内容长度，也就是一页展示内容的条数
 */
export async function readMurmurs(pageNum: number, pageSize: number): Promise<MurmursByRead[]> {
  const offset = (pageNum - 1) * pageSize;
  const murmursFromDb = await db.query.murmurs.findMany({
    offset: offset,
    limit: pageSize,
    where: and(
      eq(murmurs.display, true),
    ),
    orderBy: [desc(murmurs.createdAt)],
    columns: {
      content: true,
      createdAt: true,
      uid: true,
    },
    with: {
      tags: {
        columns: {
          murmursUid: false,
          tagsUid: false,
        },
        with: {
          tags: {
            columns: {
              uid: true,
              tag: true,
            },
          },
        },
      },
    },
  });

  const result = murmursFromDb.map((murmur) => ({
    uid: murmur.uid,
    createdAt: murmur.createdAt,
    content: murmur.content,
    tags: murmur.tags.map((tag) => ({
      tag: tag.tags.tag,
      uid: tag.tags.uid,
    })),
  }));

  return result;
}

/**
 * 通过输入的 uid 数组删除 murmurs
 *
 * @export
 * @param {string[]} uids 要删除的 murmur 的 uid 数组
 * @return {*}  {Promise<SelectMurmur[]>} 返回被删除的 murmurs 数组
 */
export async function deleteMurmurs(uids: string[]): Promise<SelectMurmur[]> {
  const deletedMurmur = await db
    .delete(murmurs)
    .where(inArray(murmurs.uid, uids)).returning();

  return deletedMurmur;
}


/**
 * 根据搜索词检索数据库中的 murmurs, 并返回检索结果
 * 页码决定了返回的 murmurs 的起始位置，页数决定了返回的 murmurs 的数量
 * @export
 * @param {string} searchTerm 检索词
 * @param {number} pageNum 页码
 * @param {number} pageSize 每页的长度
 * @return {*}  Promise<MurmursBySearch>
 */
export async function searchMurmurs(searchTerm: string, pageNum: number, pageSize: number): Promise<MurmursBySearch> {
  const offset = (pageNum - 1) * pageSize;
  return await db.transaction(async (tx) => {
    const res = await tx.query.murmurs.findMany({
      columns: {
        uid: true,
        content: true,
        createdAt: true,
      },
      offset: offset,
      limit: pageSize,
      extras: {
        // ts_rank 计算搜索词在内容中出现的频率 和 ts_rank_cd 计算搜索词的相关性
        rank: sql<
          number
        >`ts_rank(${murmurs.searchVector}, websearch_to_tsquery('jiebacfg',${searchTerm})) 
        + 
        ts_rank_cd(${murmurs.searchVector}, websearch_to_tsquery('jiebacfg',${searchTerm}))`
          .as("rank"),

      },
      where: sql`${murmurs.searchVector} @@ websearch_to_tsquery('jiebacfg',${searchTerm})`
      ,
      orderBy: sql`"rank" desc, ${murmurs.createdAt} desc`,
      with: {
        tags: {
          columns: {
            murmursUid: false,
            tagsUid: false,
          },
          with: {
            tags: {
              columns: {
                tag: true,
                uid: true,
              },
            },
          },
        },
      },
    });
    const allMurmurs = res.map(murmur => {
      return {
        uid: murmur.uid,
        createdAt: murmur.createdAt,
        content: murmur.content,
        tags: murmur.tags.map((tag) => ({
          tag: tag.tags.tag,
          uid: tag.tags.uid,
        }))

      }
    });

    const countMurmursRow = await tx.select({ count: count() }).from(murmurs).where(sql`${murmurs.searchVector} @@ websearch_to_tsquery('jiebacfg',${searchTerm})`)

    return {
      allMurmurs,
      count: countMurmursRow[0].count
    }

  })
}



/**
 * 计算需要展示的 murmurs 的总条数
 *
 * @export
 * @return {*}  {Promise<number>} 
 */
export async function countMurmursRow(): Promise<number> {
  const displayMurmursNum = await db.select({ count: count(murmurs.content) }).from(murmurs).where(eq(murmurs.display, true))
  return displayMurmursNum[0].count
}



/**
 * 根据输入的文本创建新的 murmurs，tags 由 ai 根据文本内容生成
 * @param {any} murmur:string 输入的文本
 * @returns {any}
 */
export async function createMurmur(murmur: string, authorId: string): Promise<{
  murmur: SelectMurmur;
  tags: SelectTags[];
}> {

  const tags = await createTags(murmur)

  const res = await createMurmurWithTags(murmur, tags, authorId)

  return res

}

/**
 * 
 * @param uid 
 * @returns 
 */
export async function getMurmurByUid(uid: string): Promise<SelectMurmur | undefined> {
  const murmursFromDb = await db.query.murmurs.findFirst({
    where: eq(murmurs.uid, uid)
  });

  return murmursFromDb;
}