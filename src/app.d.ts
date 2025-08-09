// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { SelectMurmur, SelectTags, SelectMediaFile } from "$lib/server/db/scheme/content-scheme"

declare global {

	/**
	 * 给前端返回的 Murmurs 类型
	 *
	 */
	interface MurmursByRead {
		murmur: SelectMurmur
		tags: SelectTags[];
		files: SelectMediaFile[]
	};

	/**
	 * 给前端搜索页面返回的 Murmurs 类型
	 * count 是搜索结果的总数
	 */
	interface MurmursBySearch {
		allMurmurs: MurmursByRead[];
		count: number;
	};

	/**
	 * 用于前端草稿的 Murmur Draft 类型
	 *
	 * @interface murmurDraft
	 * @typedef {murmurDraft}
	 */
	interface murmurDraft {
		content: string
		fileSrc: string[]
	}
	/**
	 * 给前端创建 murmur 的类型
	 */
	interface MurmurToCreate {
		/** murmur 的内容 */
		content: string;
		/** murmur 的作者 id */
		authorId: string;
		/** murmur 的附件链接 */
		fileUrls?: string[]
		/** murmur 的标签 */
		tagNames?: string[]
		/** murmur 是否展示 */
		display?: boolean
	};

	/**
	 * /**
	 * 给前端创建 murmur 的类型
	 * @export
	 * @interface MurmurToUpdate
	 */
	interface MurmurToUpdate {
		murmurUid: string,
		/** murmur 的内容 */
		content?: string | undefined;
		/** murmur 的附件链接 */
		fileUrls?: string[] | undefined;
		/** murmur 的标签 */
		tagNames?: string[] | undefined;
		/** murmur 是否展示 */
		display?: boolean | undefined;
	};

	/**
 * @description 处理文件上传的对象
 * @param @type {File} file - 文件对象
 * @param @type {string} fileType - 文件对象
 * @param @type {number} dbUid - 数据库中的id，如果是处理文件更新，需要用到这个属性
 */
	interface MyFile {
		file: File;
		fileType?: string;
		dbUid?: number;
	}



	namespace App {



		interface Locals {
			notification: {
				get: () => NotificationType | null;
				set: (data: NotificationType) => void;
			};
			murmurDraft: murmurDraft
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface NotificationType {
		type: "error" | "info" | "warning" | undefined;
		description: string;
	}
}

export { };
