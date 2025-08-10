<script lang="ts">
  import { enhance } from "$app/forms";
  import { onMount } from "svelte";
  import { localStore } from "$lib/local-storage.svelte.ts";
  import { allowedMediaFileTypes } from "$lib/helper.ts";
  import WriteAreaFileUploadButton from "./WriteAreaFileUploadButton.svelte";
  import { getFileName, getFileExtension } from "$lib/helper.ts";
  import { localNotification } from "$lib/components/notification.svelte.ts";

  let {
    user,
    murmurContent,
    action,
  }: {
    user: UserInSession;
    murmurContent?: MurmursByRead;
    action: "/write?/create" | "/write?/update";
  } = $props();

  const murmurContentDraft = localStore<murmurDraft>("murmurDraft", {
    content: "",
    fileSrc: [],
  }).value;

  let authorId = user.id as string;
  let files: MyFile[] = $state([]); // 实际的文件对象
  let tags: string[] = $state([]); // 标签内容
  let displayState: boolean = $state(true); // 是否显示，默认显示
  let isUploading: boolean = $state(false); // 是否正在上传

  // 表单内容是否为空
  let isEmpty = $derived(
    murmurContentDraft.content.trim() == "" &&
      murmurContentDraft.fileSrc.length == 0
  );

  onMount(() => {
    // 页面加载时，检查是否有有外部传来的 props，如果有，说明是更新，将其赋值给相应的 runes
    if (murmurContent) {
      // 临时保存草稿内容
      const temporaryDraft = localStorage.getItem("murmurDraft");

      // 写入文本内容
      murmurContentDraft.content = murmurContent?.murmur.content;

      // 写入图片链接
      murmurContentDraft.fileSrc = murmurContent?.files.map(
        (item) => item.fileUrl
      );

      // 写入是否显示
      displayState = murmurContent?.murmur.display;

      // 写入占位的文件对象
      if (murmurContent?.files.length > 0) {
        murmurContent?.files.forEach((item) => {
          const file = new File(["占位"], item.fileUrl);
          files.push({
            file,
            fileType: getFileExtension(item.fileUrl),
            dbUid: item.uid,
          });
        });
      }

      // 写入标签
      if (murmurContent?.tags.length > 0) {
        tags = murmurContent?.tags.map((item) => item.tag);
      }

      // 因为是更新，所以不保留草稿
      return () => {
        // 清空草稿内容
        localStorage.removeItem("murmurDraft");

        // 恢复草稿状态
        if (temporaryDraft) {
          try {
            localStorage.setItem("murmurDraft", temporaryDraft);
          } catch (error) {} // 如果解析失败，忽略错误
        }
      };
    } else {
      // 如果是创建，localStore 会自动加载草稿，这里需要过滤一下 不保留 blob: 开头的链接，因为 blob 链接是临时的，保留了也没有用

      murmurContentDraft.fileSrc = murmurContentDraft.fileSrc.filter(
        (src) => !src.startsWith("blob:")
      );

    }
  });

  // ............... 处理文件上传 ...............

  /**
   * 查找符合条件的 File 对象的索引。
   * @param files - MyFile 对象数组。
   * @param predicate - 一个函数，接收一个 MyFile 对象，如果该文件符合条件则返回 true，否则返回 false。
   * @returns 符合条件的 File 对象的索引组成的数组。
   */
  function findFileIndices(
    files: MyFile[],
    predicate: (file: MyFile) => boolean
  ): number[] {
    const indices: number[] = [];
    files.forEach((file, index) => {
      if (predicate(file)) {
        indices.push(index);
      }
    });
    return indices;
  }
  // 文件分类

  // 图片文件的索引
  let imageFileIndex = $derived(
    findFileIndices(files, (file) =>
      allowedMediaFileTypes.image.includes(
        file.file.name.split(".").at(-1) as string
      )
    )
  );
  // 视频文件的索引
  let videoFileIndex = $derived(
    findFileIndices(files, (file) =>
      allowedMediaFileTypes.video.includes(
        file.file.name.split(".").at(-1) as string
      )
    )
  );

  // 音频文件的索引
  let audioFileIndex = $derived(
    findFileIndices(files, (file) =>
      allowedMediaFileTypes.audio.includes(
        file.file.name.split(".").at(-1) as string
      )
    )
  );

  // 其他文件的索引
  let otherFileIndex = $derived(
    findFileIndices(files, (file) =>
      allowedMediaFileTypes.other.includes(
        file.file.name.split(".").at(-1) as string
      )
    )
  );

  // 最大文件大小
  const MAX_FILE_SIZE_MB = 30;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // 30MB in bytes

  /**
   * 处理文件，如果文件大小超过限制，显示错误通知；如果文件类型符合要求，生成预览URL并存储文件对象。
   * @param file  - 文件
   * @description 处理文件，检查类型并生成预览URL
   * @returns {void}
   */
  function handleFiles(file: File): void {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      localNotification.type = "error";
      localNotification.description = `文件大小超过 ${MAX_FILE_SIZE_MB}MB`;

      return;
    }

    if (
      allowedMediaFileTypes.image.includes(
        (file.name.split(".").at(-1) ?? "").toLocaleLowerCase()
      ) ||
      allowedMediaFileTypes.video.includes(
        (file.name.split(".").at(-1) ?? "").toLocaleLowerCase()
      ) ||
      allowedMediaFileTypes.audio.includes(
        (file.name.split(".").at(-1) ?? "").toLocaleLowerCase()
      ) ||
      allowedMediaFileTypes.other.includes(
        (file.name.split(".").at(-1) ?? "").toLocaleLowerCase()
      )
    ) {
      const objectUrl = URL.createObjectURL(file);

      // 存储文件对象和预览URL，正常上传文件，文件对象是没有 uid 的
      files = [
        ...files,
        { file, fileType: file.name.split(".").at(-1)?.toLocaleLowerCase() },
      ];
      murmurContentDraft.fileSrc = [...murmurContentDraft.fileSrc, objectUrl];
    } else {
      localNotification.type = "error";
      localNotification.description = `${file.type.split("/")[1].toUpperCase()} 是不支持的文件类型`;
    }
  }

  /**
   * 处理文件选择事件。
   * 当用户通过文件输入框选择文件后，此函数会被触发。
   * 它会遍历所有选中的文件，并对每个文件调用 `handleFiles` 函数进行处理。
   * @param {Event} event - 文件输入元素触发的事件对象。
   */
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (const file of input.files) {
        handleFiles(file);
      }
    }
  }

  /**
   * 移除指定索引的文件及其对应的预览资源。
   *
   * 执行步骤：
   * 1. 调用 URL.revokeObjectURL 释放该文件的临时 objectURL，防止内存泄漏。
   * 2. 从 murmurContentDraft.fileSrc 与 files 两个并行数组中删除对应索引的元素，保持二者数据同步。
   *
   * 使用约定：
   * - 假定传入的 index 已经过范围校验（0 <= index < murmurContentDraft.fileSrc.length）。
   * - 若索引无效当前实现不会抛错，但可能什么也不做或出现逻辑不一致，应在调用前保证有效性。
   *
   * @param index 要移除的文件在列表中的索引（从 0 开始）。
   * @sideEffects
   * - 释放浏览器为该文件分配的内存资源（objectURL）。
   * - 修改 murmurContentDraft.fileSrc 与外部作用域中的 files 变量。
   */
  function removeFile(index: number) {
    // 释放不再需要的 objectURL
    URL.revokeObjectURL(murmurContentDraft.fileSrc[index]);

    // 删除 imgSrc 中的图片和对应的图片对象
    murmurContentDraft.fileSrc = murmurContentDraft.fileSrc.filter(
      (_, i) => i !== index
    );
    files = files.filter((_, i) => i !== index);
  }
</script>

<!-- 表单组件 -->
<form
  class=" h-[80vh] min-h-100 w-full"
  method="post"
  {action}
  enctype="multipart/form-data"
  use:enhance={({ formData }) => {
    isUploading = true;
    localNotification.type = "info";
    localNotification.description = "正在上传，请稍候...";

    // 将占位文件删除
    files = files.filter((item) => !item.dbUid);

    // 将文件添加到表单数据中
    files.forEach((file) => {
      formData.append("files", file.file);
    });

    tags.forEach((tag) => {
      formData.append("tags", tag);
    });

    // 获取已经上传的文件的链接,如果链接开头不是 blob:，说明是已经上传的文件
    murmurContentDraft.fileSrc
      .filter((src) => !src.startsWith("blob:"))
      .forEach((src) => {
        formData.append("filesSrc", src);
      });

    formData.append("murmurId", murmurContent?.murmur.uid as string);

    formData.append("authorId", authorId);

    return async ({ update }) => {
      // 清空图片
      murmurContentDraft.fileSrc.forEach((url) => URL.revokeObjectURL(url));
      murmurContentDraft.fileSrc = [];

      // 清空文本内容
      murmurContentDraft.content = "";
      files = [];

      await update({ reset: true });
      isUploading = false;
    };
  }}
>
  <!-- 内容输入区域 -->
  <div
    class=" 
              w-full h-full flex flex-col gap-0
              bg-slate-50 dark:bg-slate-900
              outline outline-dashed outline-slate-300 dark:outline-slate-700
              rounded-lg
              focus:outline-none focus:ring-2 focus:ring-slate-700
               dark:focus:ring-slate-300
              
              "
  >
    <textarea
      disabled={isUploading}
      name="text"
      class="
              w-full h-full
              text-base
              p-2 sm:p-4
              border-none
              resize-none
              focus:outline-none
              focus:ring-0
              overflow-y-auto
              text-justify
              no-scrollbar
              text-slate-900 dark:text-slate-100
              bg-slate-50 dark:bg-slate-900
              "
      placeholder="请在这里输入内容……"
      bind:value={murmurContentDraft.content}
    ></textarea>

    {#if murmurContentDraft.fileSrc.length > 0}
      <!-- 附件展示区域 -->
      <div class="flex flex-col w-full max-h-2/3 flex-shrink-0 overflow-y-auto">
        <!-- 图片展示 -->
        {#if imageFileIndex.length > 0}
          <div
            class="
       w-full h-30
       overflow-x-auto
       flex-shrink-0
       flex gap-2
       p-2
       pointer-events-auto
       no-scrollbar
       "
            role="region"
            aria-label="图片附件展示区域"
          >
            {#each imageFileIndex as index}
              {@const fileToDisplay = {
                name: files[index].file.name,
                index: index,
                scr: murmurContentDraft.fileSrc[index],
              }}
              <div class="relative flex-shrink-0 h-full">
                <img
                  class="w-auto h-full object-cover rounded-lg"
                  src={fileToDisplay.scr}
                  alt={fileToDisplay.name}
                  crossorigin="anonymous"
                  referrerpolicy="no-referrer"
                />
                <button
                  type="button"
                  class="absolute right-1 top-1 bg-slate-800/70 text-slate-50 rounded-full w-5 h-5 hover:bg-slate-900/90 leading-0"
                  onclick={() => removeFile(fileToDisplay.index)}
                >
                  ×
                </button>
              </div>
            {/each}
          </div>
        {/if}

        <!-- 视频展示 -->
        {#if videoFileIndex.length > 0}
          <div
            class="
       w-full h-30
       overflow-x-auto
       flex-shrink-0
       flex gap-2
       p-2
       pointer-events-auto
       no-scrollbar"
            role="region"
            aria-label="视频附件展示区域"
          >
            {#each videoFileIndex as index}
              {@const fileToDisplay = {
                name: files[index].file.name,
                index: index,
                scr: murmurContentDraft.fileSrc[index],
              }}
              <div class="relative flex-shrink-0 h-full">
                <video
                  controls
                  crossorigin="anonymous"
                  class="w-auto h-full object-cover rounded-lg"
                  src={fileToDisplay.scr}><track kind="captions" /></video
                >
                <button
                  type="button"
                  class="absolute right-1 top-1 bg-slate-800/70 text-slate-50 rounded-full w-5 h-5 hover:bg-slate-900/90 leading-0"
                  onclick={() => removeFile(fileToDisplay.index)}
                >
                  ×
                </button>
              </div>
            {/each}
          </div>
        {/if}

        <!-- 音频展示 -->
        {#if audioFileIndex.length > 0}
          <div
            class="
         w-full
         overflow-x-auto
         flex-shrink-0
         flex gap-2
         p-2
         pointer-events-auto
         no-scrollbar"
            role="region"
            aria-label="音频附件展示区域"
          >
            {#each audioFileIndex as index}
              {@const fileToDisplay = {
                name: files[index].file.name,
                index: index,
                scr: murmurContentDraft.fileSrc[index],
              }}
              <div class="relative flex-shrink-0">
                <audio controls crossorigin="anonymous" src={fileToDisplay.scr}>
                </audio>
                <button
                  type="button"
                  class="absolute right-1 top-1 bg-slate-800/70 text-slate-50 rounded-full w-5 h-5 hover:bg-slate-900/90 leading-0"
                  onclick={() => removeFile(fileToDisplay.index)}
                >
                  ×
                </button>
              </div>
            {/each}
          </div>
        {/if}

        <!-- 其他文件展示 -->
        {#if otherFileIndex.length > 0}
          <div
            class="
          w-full
          overflow-x-auto
          flex-shrink-0
          flex gap-2
          p-2
          pointer-events-auto
          no-scrollbar"
            role="region"
            aria-label="其他附件展示区域"
          >
            {#each otherFileIndex as index}
              {@const fileToDisplay = {
                name: files[index].file.name,
                index: index,
                scr: murmurContentDraft.fileSrc[index],
              }}
              <div class="relative flex-shrink-0">
                <a
                  href={fileToDisplay.scr}
                  rel="noreferrer nofollow"
                  class="text-slate-800 dark:text-slate-200
                  bg-slate-100 dark:bg-slate-900
                  hover:bg-slate-200 dark:hover:bg-slate-800
                  p-2 rounded-lg text-sm
                  max-w-30 text-wrap text-left block"
                  target="_blank"
                >
                  {action === "/write?/create"
                    ? fileToDisplay.name
                    : getFileName(fileToDisplay.scr)}
                </a>
                <button
                  type="button"
                  class="absolute -right-2 -top-2 bg-slate-800/70 text-slate-50 rounded-full w-5 h-5 hover:bg-slate-900/90 leading-0 text-sm"
                  onclick={() => removeFile(fileToDisplay.index)}
                >
                  ×
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <!-- menu bar -->
    <div
      class="
      px-2 w-full min-h-15
      flex items-center justify-between gap-2
      border-t-1 border-solid border-slate-300 dark:border-slate-700
      bg-slate-50 dark:bg-slate-900
      "
    >
      <!-- 菜单栏左侧 -->
      <div class="flex justify-start gap-4">
        <!-- 上传附件按钮 -->
        <WriteAreaFileUploadButton
          accept={allowedMediaFileTypes
            .all()
            .map((value) => `.${value}`)
            .join(",")}
          title="上传附件"
          onclick={handleFileSelect}
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
            />
          </svg>
        </WriteAreaFileUploadButton>
      </div>
      <!-- 菜单右侧 -->
      <div class="flex items-center gap-4">
        <!-- 是否显示，默认显示 -->

        <label
          class="flex items-center gap-1 text-slate-900 dark:text-slate-100
          p-2
          text-base
          bg-slate-200 dark:bg-slate-800
          rounded-lg"
          for="displayState"
        >
          <input
            type="checkbox"
            value="1"
            id="displayState"
            name="displayState"
            bind:checked={displayState}
            class="rounded-full accent-slate-900 dark:accent-slate-100"
          />

          Display</label
        >

        <!-- 计算文字长度 -->
        <span class="text-slate-900 dark:text-slate-100 text-base"
          >字数：{murmurContentDraft.content.length}
        </span>
        <!-- 发送按钮 -->
        <button
          disabled={isUploading || isEmpty}
          type="submit"
          class="
       
            px-4 py-2
           bg-slate-900 hover:bg-slate-700
           dark:bg-slate-100 dark:hover:bg-slate-300
           text-slate-100 dark:text-slate-900
           disabled:bg-gray-500
           font-medium
           rounded-lg
           text-base
                     "
        >
          发送
        </button>
      </div>
    </div>
  </div>
</form>
