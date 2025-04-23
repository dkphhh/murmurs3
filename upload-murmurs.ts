import * as fs from 'fs';
import * as csv from 'fast-csv';
import { createTags, insertNewTags } from "./src/lib/server/db/utils"
import * as schema from "./src/lib/server/db/scheme/content-scheme.ts";
import { drizzle } from "drizzle-orm/postgres-js";
import { dbClient } from "./src/lib/server/db/db.ts";


const db = drizzle({ client: dbClient, schema });


type oldMurmurs = { text: string, id: string, pub_datetime: string, display: "1" | "0" }


async function uploadMurmurs(murmur: oldMurmurs) {
    console.log(`正在处理内容为 ${murmur.id}`)
    const tags = await createTags(murmur.text);
    console.log(`输出的 tags 为 ${tags.join(",")}`)
    const allTags = await insertNewTags(tags);
    const murmurUid = await db.insert(schema.murmurs).values({
        content: murmur.text,
        display: murmur.display == "1" ? true : false,
        createdAt: new Date(murmur.pub_datetime),
        updatedAt: new Date(murmur.pub_datetime),
        authorId: "5nEdmy05ZIAbffrqHXamkoRAWEmqFBJa",
    }).returning({ uid: schema.murmurs.uid });
    console.log(`已经插入数据库，uid： ${murmurUid[0].uid}`)
    const res = await Promise.all(allTags.map((tag) => {
        return db.insert(schema.murmursToTags).values({
            murmursUid: murmurUid[0].uid,
            tagsUid: tag.uid,
        }).returning();
    }));

    console.log("已经完成内容和标签插入", res)
}


const tasks: Promise<void>[] = []

fs.createReadStream("/Users/dkphhh/Downloads/murmurs.csv")
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', async (row: oldMurmurs) => {
        tasks.push(uploadMurmurs(row))
    })
    .on('end', (rowCount: number) => console.log(`Parsed ${rowCount} rows`));


await Promise.all(tasks)