import { and, desc, eq, inArray, sql, count } from "drizzle-orm";
import {
  murmurs,
  murmursToTags,
  tags,
  mediaFile
} from "./scheme/content-scheme.ts";
import type { PgTransaction, PgQueryResultHKT } from "drizzle-orm/pg-core/session";
import type { ExtractTablesWithRelations } from "drizzle-orm";

import * as schema from "./scheme/content-scheme.ts";
import { drizzle } from "drizzle-orm/postgres-js";
import { dbClient } from "./db.ts";
import { OPEN_ROUTER_API_KEY } from "$env/static/private"


type Tx = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;

/**
 * 预设的 tag
 *
 * @type {string[]}
 */
const TAGS: string[] = ["图像", "方法论", "洞察", "科技", "幽默", "情绪", "自我", "评论", "文艺", "编程"]


const db = drizzle({ client: dbClient, schema });









/** 
 * 根据文本内容，由AI自动生成 tags（在一个范围里让AI挑选tags）
 * 字数少于10的，不生成 tags
 * @param {string} murmur:string 文本内容
 * @param {string} tagScope:string[]=TAGS 选择 tags 范围
 * @returns {Promise<string[]>} :Promise<string[]>
 */
export async function createTags(murmur: string, tagScope: string[] = TAGS): Promise<string[]> {

  if (murmur.length <= 10) {
    return []
  }



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

        3. 我会用一段程序脚本自动处理你的输出，所以你只需要输出标签，不需要加任何提示语句或者引导词。这个自动处理的脚本如下，请不要输出这个脚本无法处理的内容：
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
 * 在输入的tags列表中找到数据库里没有的 tags，并向数据库插入，返回所有 tag 的 tag 对象
 * @param {string[]} tagNames:tag 文本构成的列表
 * @param {Tx} etx: 数据库连接对象
 * @returns {Promise<SelectTags[]>}
 */
export async function insertNewTags(tagNames: string[], etx?: Tx): Promise<SelectTags[]> {

  if (tagNames.length === 0 || !tagNames) {
    return []
  }

  const executer = etx ?? db

  return await executer.transaction(async (tx) => {
    // 找到已经存在的 tags 记录
    const existingTags = await tx.query.tags.findMany(
      {
        where: inArray(tags.tag, tagNames),
      },
    );

    const existingTagsName = existingTags.map((tag) => tag.tag);

    // 筛选不存在的 tags 记录
    const notExistingTagNames = tagNames.filter((tagName) => !existingTagsName.includes(tagName));

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
 * 给已有的 murmur 更新标签，返回所有标签的对象
 *
 * @export
 * @async
 * @param {string} murmurUid 需要更新的murmur的id
 * @param {string[]} tagNames  包含所有标签文本的数组
 * @param {?Tx} etx 数据库连接对象
 * @returns {Promise<void>} 
 */
export async function updateMurmurTags(murmurUid: string, tagNames: string[], etx?: Tx): Promise<SelectTags[]> {
  if (tagNames.length === 0 || !tagNames) {
    return []
  }

  const executer = etx ?? db
  return await executer.transaction(async (tx) => { // 将新增标签加入数据库，返回的 allTags 是包含了所有标签对象的数组
    const allTags = await insertNewTags(tagNames, tx);
    const allTagsId = allTags.map((tag) => tag.uid);

    // 对比新标签数组和已有标签数组，找出需要更新和删除的标签
    const existingTagRelations = await tx.select({
      tagsUid: murmursToTags.tagsUid,
    })
      .from(murmursToTags).where(eq(murmursToTags.murmursUid, murmurUid));
    const existingTagsId = existingTagRelations.map((tag) => tag.tagsUid);

    // 找出需要删除的标签,并删除
    const tagsToDelete = existingTagsId.filter((tagsUid) =>
      !allTagsId.includes(tagsUid)
    );

    if (tagsToDelete.length > 0) {
      await tx.delete(murmursToTags).where(
        and(
          eq(murmursToTags.murmursUid, murmurUid),
          inArray(murmursToTags.tagsUid, tagsToDelete),
        ),
      );
    }

    // 找出需要新增的标签，并插入
    const tagsToInsert = allTagsId.filter((tagsUid) =>
      !existingTagsId.includes(tagsUid)
    );
    const valuesToInsert = tagsToInsert.map((tagUid) => {
      return { murmursUid: murmurUid, tagsUid: tagUid };
    });

    if (valuesToInsert.length > 0) {
      await tx.insert(murmursToTags).values(valuesToInsert);
    }

    return allTags
  })

}





/**
 * 上传图片链接到数据库
 * @param {string[]} fileUrls 图片链接
 * @param {string} murmurUid 对应的 murmur 内容 uid
 * @param {Tx} etx 数据库连接对象
 * @returns 
 */
export async function createMediaFiles(fileUrls: string[], murmurUid: string, etx?: Tx): Promise<SelectMediaFile[]> {
  if (fileUrls.length === 0 || !fileUrls) {
    return []
  }
  const executer = etx ?? db
  const mediaFiles = await executer.insert(mediaFile).values(
    fileUrls.map((fileUrl) => ({
      fileUrl: fileUrl,
      murmurUid: murmurUid,
    })),
  ).returning();


  return mediaFiles;


}


/**
 * 批量删除 MediaFiles 
 *
 * @export
 * @async 
 * @param {number[]} filesUid  文件的uid
 * @param {Tx} etx 数据库连接对象
 * @returns {Promise<{
 *   uid: number;
 * }[] | undefined>} 
 */
export async function deleteMediaFiles(filesUid: number[], etx?: Tx): Promise<SelectMediaFile[]> {
  if (filesUid.length === 0 || !filesUid) {
    return []
  }
  const executer = etx ?? db
  const tasks = []
  for (const fileUid of filesUid) {
    const task = executer.delete(mediaFile).where(eq(mediaFile.uid, fileUid)).returning()
    tasks.push(task)
  }

  const res = await Promise.all(tasks)
  return res.flat()

}

/**
 * 根据 murmurUid 找到对应的文件附件，并将其对应的附件更新为 fileUrls
 *
 * @export
 * @async
 * @param {string[]} fileUrls 
 * @param {string} murmurUid 
 * @param {Tx} etx 数据库连接对象
 * @returns {Promise<SelectMediaFile[]>} 
 */
export async function updateMurmurFileUrls(fileUrls: string[], murmurUid: string, etx?: Tx): Promise<SelectMediaFile[]> {

  if (fileUrls.length === 0 || !fileUrls) {
    return []
  }

  const executer = etx ?? db

  return await executer.transaction(async (tx) => {

    // 在数据库中找到原始的murmur附件的对象
    const oldFileUrls = await tx.query.mediaFile.findMany({
      where: eq(mediaFile.murmurUid, murmurUid)
    })

    // 找到需要删除的 url 并删除
    const fileUrlToDelete = oldFileUrls.filter(file => !fileUrls.includes(file.fileUrl)).map(file => file.uid)
    await deleteMediaFiles(fileUrlToDelete, tx)

    // 找到需要上传的 url,并上传
    const oldUrls = oldFileUrls.map(file => file.fileUrl)
    const fileUrlToCreate = fileUrls.filter(url => !oldUrls.includes(url))
    await createMediaFiles(fileUrlToCreate, murmurUid, tx)

    // 计算现在数据库中这个 murmur的附件
    const UpdatedFileUrls = await tx.query.mediaFile.findMany({
      where: eq(mediaFile.murmurUid, murmurUid)
    })

    return UpdatedFileUrls
  })


}




/**
 * 想数据库上传 murmur。将 content 写入 murmurs 表，并将 tagNames 写入 tags 表，并将 murmurs 和 tags 关联起来
 * @param {MurmurToCreate} murmurToCreate 用于创建 murmur 的必须要数据
 * @param {Tx} etx 数据库连接对象  
 * @returns {Promise<MurmursByRead>}
 */
export async function createMurmurWithTags(murmurToCreate: MurmurToCreate, etx?: Tx): Promise<MurmursByRead> {

  const { content, tagNames = [], fileUrls = [], authorId, display = true } = murmurToCreate

  const executer = etx ?? db
  return await executer.transaction(async (tx) => {
    // 将 content 写入 murmurs 表


    if (content.length === 0 && tagNames.length === 0 && fileUrls.length === 0) {
      throw new Error("输入内容不能为空");
    }

    // 将文本上传到数据库
    const [newMurmur] = await tx.insert(murmurs).values({
      content,
      authorId,
      display
    }).returning();

    // 将图片链接上传到数据库

    const mediaFile = await createMediaFiles(fileUrls, newMurmur.uid, tx)

    // ---------------- 处理tags -----------------------

    // 声明一个 allTags 变量
    let allTags: SelectTags[] = [];

    // 如果有 tags
    if (tagNames.length > 0) {
      // 更新tags，并返回所有 tags
      allTags = await insertNewTags(tagNames, tx);

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
      tags: allTags,
      files: mediaFile

    };
  });
}


/**
 * 更新 murmur 的内容和标签
 * @export
 * @async
 * @param {MurmurToUpdate} murmurToCreate 用于更新 murmur 的必须要数据
 * @param {?Tx} [etx]  数据库连接对象
 * @returns {Promise<MurmursByRead>} 
 */
export async function updateMurmurs(
  murmurToCreate: MurmurToUpdate,
  etx?: Tx
): Promise<MurmursByRead> {
  const { murmurUid, content, tagNames = [], fileUrls = [], display = true } = murmurToCreate
  const executer = etx ?? db
  return await executer.transaction(async (tx) => {

    // 更新murmur的文本内容 和 显示状态
    if (content === undefined || content === "") {
      throw Error("更新文本内容为空")
    }

    const updatedMurmurs = await tx.update(murmurs).set({
      content: content,
      display: display,
    }).where(eq(murmurs.uid, murmurUid)).returning();


    // 如果此时 updatedMurmurs 的长度为零，说明 uid 没有匹配上，抛出错误
    if (updatedMurmurs.length === 0) {
      throw new Error(`Uid ${murmurUid} 不正确，没有这条 murmur`);
    }


    const updatedMurmur = updatedMurmurs[0];


    //------------------- 处理标签更新---------------------------------

    const allTags = await updateMurmurTags(murmurUid, tagNames, tx);

    //------------处理图片的更新-----------------
    const UpdatedFileUrls = await updateMurmurFileUrls(fileUrls, murmurUid, tx)


    // 返回结果
    const result = {
      murmur: updatedMurmur,
      tags: allTags,
      files: UpdatedFileUrls

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
 * @param {Tx} etx 数据库连接对象
 */
export async function readMurmurs(pageNum: number, pageSize: number, etx?: Tx): Promise<MurmursByRead[]> {
  const offset = (pageNum - 1) * pageSize;
  const executer = etx ?? db
  const murmursFromDb = await executer.query.murmurs.findMany({
    offset: offset,
    limit: pageSize,
    where: eq(murmurs.display, true),
    orderBy: [desc(murmurs.createdAt)],
    with: {
      tags: {
        columns: {
          murmursUid: false,
          tagsUid: false,
        },
        with: {
          tags: {},
        },
      },
      mediaFiles: {}
    },
  });
  if (murmursFromDb.length === 0) {

    throw new Error("没有找到 Murmurs 内容");
  }

  const result = murmursFromDb.map(item => {
    const { tags, mediaFiles, ...murmur } = item
    return {
      murmur,
      tags: tags.map(item => item.tags),
      files: mediaFiles
    }
  })

  return result;
}

/**
 * 通过输入的 uid 数组删除 murmurs
 *
 * @export
 * @param {string[]} uids 要删除的 murmur 的 uid 数组
 * @param {Tx} etx 数据库连接对象
 * @return {*}  {Promise<SelectMurmur[]>} 返回被删除的 murmurs 数组
 */
export async function deleteMurmurs(uids: string[], etx?: Tx): Promise<SelectMurmur[]> {
  const executer = etx ?? db
  const deletedMurmur = await executer
    .delete(murmurs)
    .where(inArray(murmurs.uid, uids)).returning();
  if (deletedMurmur.length === 0) {
    throw new Error("没有找到对应的 Murmur");
  }

  return deletedMurmur;
}


/**
 * 根据搜索词检索数据库中的 murmurs, 并返回检索结果
 * 页码决定了返回的 murmurs 的起始位置，页数决定了返回的 murmurs 的数量
 * @export
 * @param {string} searchTerm 检索词
 * @param {number} pageNum 页码
 * @param {number} pageSize 每页的长度
 * @param {Tx} etx 数据库连接对象
 * @return {*}  Promise<MurmursBySearch>
 */
export async function searchMurmurs(searchTerm: string, pageNum: number, pageSize: number, etx?: Tx): Promise<MurmursBySearch> {
  const offset = (pageNum - 1) * pageSize;
  const executer = etx ?? db
  return await executer.transaction(async (tx) => {
    const res = await tx.query.murmurs.findMany({
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
            },
          },
        },
        mediaFiles: {}
      },
    });
    const allMurmurs = res.map(item => {
      const { tags, mediaFiles, ...murmur } = item
      return {
        murmur,
        tags: tags.map(item => item.tags),
        files: mediaFiles
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
 * @param {Tx} etx 数据库连接对象
 * @export
 * @return {*}  {Promise<number>} 
 */
export async function countMurmursRow(etx?: Tx): Promise<number> {
  const executer = etx ?? db
  const displayMurmursNum = await executer.select({ count: count(murmurs.content) }).from(murmurs).where(eq(murmurs.display, true))
  return displayMurmursNum[0].count
}



/**
 * 根据输入的文本创建新的 murmurs，tags 由 ai 根据文本内容生成
 * @param {string} murmur:string 输入的文本
 * @param {string[]} fileUrls:string[] 附件的链接
 * @param {string} authorId:string 作者的 id
 * @param {boolean} display:boolean 是否展示
 * @export
 * @async
 * @returns {Promise<{murmur: SelectMurmur;tags: SelectTags[];}>}
 */
export async function createMurmur(murmur: string, fileUrls: string[], authorId: string, display: boolean): Promise<MurmursByRead> {

  const tags = await createTags(murmur)

  const murmurToCreate: MurmurToCreate = {
    content: murmur,
    authorId: authorId,
    fileUrls: fileUrls,
    tagNames: tags,
    display: display
  }
  const res = await createMurmurWithTags(murmurToCreate)

  return res

}

/**
 * 根据 uid 获取 murmurs 的内容
 * @param {string} uid  
 * @param {Tx} etx 数据库连接对象
 * @export
 * @async
 * @returns 
 */
export async function getMurmurByUid(uid: string, etx?: Tx): Promise<MurmursByRead | undefined> {
  const executer = etx ?? db
  return await executer.transaction(async (tx) => {
    const murmursFromDb = await tx.query.murmurs.findFirst({
      where: eq(murmurs.uid, uid),
      with: {
        tags: { with: { tags: {} } },
        mediaFiles: {}
      }
    });

    if (!murmursFromDb) {
      return undefined
    }

    const { tags, mediaFiles, ...murmur } = murmursFromDb

    return {
      murmur,
      files: mediaFiles,
      tags: tags.map(item => item.tags)
    }

  });
}

export async function readAllMurmurs(etx?: Tx): Promise<MurmursByRead[]> {
  const executer = etx ?? db
  const murmursFromDb = await executer.query.murmurs.findMany({
    where: eq(murmurs.display, true),
    orderBy: [desc(murmurs.createdAt)],
    with: {
      tags: {
        columns: {
          murmursUid: false,
          tagsUid: false,
        },
        with: {
          tags: {},
        },
      },
      mediaFiles: {}
    },
  });

  const result = murmursFromDb.map(item => {
    const { tags, mediaFiles, ...murmur } = item
    return {
      murmur,
      tags: tags.map(item => item.tags),
      files: mediaFiles
    }
  })

  return result;
}
