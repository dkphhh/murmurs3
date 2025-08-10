import {
	boolean,
	customType,
	index,
	integer,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	varchar,

} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { SQL, sql } from "drizzle-orm";
import { generateUid } from "../../../uuid";
import { user } from "./auth-schema"



// 创建一个用于生成 tsvector 的自定义类型
const tsVector = customType<{ data: string }>({
	dataType() {
		return "tsvector";
	},
});

// murmurs 的 scheme
export const murmurs = pgTable("murmurs", {
	uid: varchar("uid").$defaultFn(generateUid).primaryKey(),
	content: text("content").notNull(),
	display: boolean("display").default(true).notNull(),
	searchVector: tsVector("search_vector").generatedAlwaysAs((): SQL =>
		sql`to_tsvector('jiebacfg', ${murmurs.content})`
	),
	authorId: text("author_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp().defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => [
	// 添加全文搜索索引
	index("murmurs_search_vector_idx").using(
		"gin",
		t.searchVector,
	),
	index("murmurs_author_idx").on(t.authorId),
	index("murmurs_display_idx").on(t.display),
]);

// 自定义 tags 字段 

const tagsField = customType<{ data: string; notNull: true }>({
	dataType() {
		return "varchar(30)";
	},
	toDriver(value) {
		return value ? value.toLocaleLowerCase() : "";
	},
});

// tags 的 scheme
export const tags = pgTable("tags", {
	uid: serial("uid").primaryKey(),
	tag: tagsField("tag").notNull().unique(),
	searchVector: tsVector("search_vector").generatedAlwaysAs((): SQL =>
		sql`to_tsvector('jiebacfg', ${tags.tag})`
	),

	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
	// 添加全文搜索索引
	index("tags_search_vector_idx").using(
		"gin",
		t.searchVector,
	),
	index("tags_tag_idx").on(t.tag),
]);


// mediaFile 的scheme
export const mediaFile = pgTable("media_file", {
	uid: serial("uid").primaryKey(),
	fileUrl: text("file_url").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	murmurUid: varchar("murmur_uid").notNull().references(() => murmurs.uid, { onDelete: "cascade" }),
}, (t) => [
	index("media_file_murmur_idx").on(t.fileUrl),
	index("media_file_murmur_uid_idx").on(t.murmurUid)
]);




export const userRelations = relations(user, ({ many }) => ({
	murmurs: many(murmurs),
}));


// murmurs 和 tags 的 join tables
export const murmursToTags = pgTable("murmurs_to_tags", {
	murmursUid: varchar("murmurs_uid").notNull().references(() => murmurs.uid, {
		onDelete: "cascade",
	}),
	tagsUid: integer("tags_uid").notNull().references(() => tags.uid, {
		onDelete: "cascade",
	}),
},

	(t) => [
		primaryKey({ columns: [t.murmursUid, t.tagsUid] }),
		index("murmurs_to_tags_murmurs_uid_idx").on(t.murmursUid),
		index("murmurs_to_tags_tags_uid_idx").on(t.tagsUid),
	]);

// murmurs relations
export const murmursRelations = relations(murmurs, ({ many, one }) => ({
	tags: many(murmursToTags),
	mediaFiles: many(mediaFile),
	author: one(user, {
		fields: [murmurs.authorId],
		references: [user.id],
	}),
}));

export const mediaFileRelations = relations(mediaFile, ({ one }) => ({
	murmur: one(murmurs, {
		fields: [mediaFile.murmurUid],
		references: [murmurs.uid],
	})
}))

export const tagsRelations = relations(tags, ({ many }) => ({
	murmurs: many(murmursToTags),
}));

export const murmursToTagsRelations = relations(murmursToTags, ({ one }) => ({
	murmurs: one(murmurs, {
		fields: [murmursToTags.murmursUid],
		references: [murmurs.uid],
	}),
	tags: one(tags, {
		fields: [murmursToTags.tagsUid],
		references: [tags.uid],
	}),
}));

