<script lang="ts">
  import { enhance } from "$app/forms";
  import { onMount } from "svelte";
  import { uploadingFileNotification } from "$lib/components/notification.svelte.ts";
  import type { UserInSession } from "$lib/server/db/scheme/auth-schema.ts";
  import type { MurmursByRead } from "$lib/server/db/utils.ts";
  import { allowedMediaFileTypes } from "$lib/helper.ts";

  // TODO：视频上传按钮和预览
  // TODO：音频上传按钮和预览
  // TODO：发送语音按钮和预览
  // TODO：文件上传按钮和预览
  // TODO：自动粘贴附件，并识别媒体类型
  // TODO：文件上传到Cloudflare怎么重命名？
  // TODO:增加标签的增删功能
  // TODO 分区显示图片、视频、音频和其他附件

  /**
   * @description 处理文件上传的对象
   * @param @type {File} file - 文件对象
   * @param @type {number} dbUid - 数据库中的id，如果是处理文件更新，需要用到这个属性
   */
  interface MyFile {
    file: File;
    dbUid?: number;
  }

  let {
    user,
    murmurContent,
    action,
  }: {
    user: UserInSession;
    murmurContent?: MurmursByRead;
    action: "/write?/create" | "/write?/update";
  } = $props();
  let authorId = user.id as string;
  let filesSrc: string[] = $state([]); // 文件预览链接,如果是用于更新，这里为已经上传的文件的实际链接
  let files: MyFile[] = $state([]); // 实际的文件对象
  let murmurText: string = $state(""); // 文本内容
  let tags: string[] = $state([]); // 标签内容
  let displayState: boolean = $state(true); // 是否显示，默认显示

  // 表单内容是否为空
  let isEmpty = $derived(murmurText.trim() == "" && filesSrc.length == 0);

  // 页面加载时，检查是否有有外部传来的 props，如果有，说明是更新，将其赋值给相应的 runes
  onMount(() => {
    if (murmurContent) {
      // 如果有外部传来的 props，说明是更新，将其赋值给相应的 runes

      // 写入文本内容
      murmurText = murmurContent?.murmur.content;

      // 写入图片链接
      filesSrc = murmurContent?.files.map((item) => item.fileUrl);

      // 写入是否显示
      displayState = murmurContent?.murmur.display;

      // 写入占位的文件对象
      if (murmurContent?.files.length > 0) {
        murmurContent?.files.forEach((item) => {
          const file = new File(["占位"], item.fileUrl);
          files.push({
            file,
            dbUid: item.uid,
          });
        });
      }

      // 写入标签
      if (murmurContent?.tags.length > 0) {
        tags = murmurContent?.tags.map((item) => item.tag);
      }
    }
  });

  // ............... 处理文件上传 ...............

  /**
   * 处理文件
   * @param file  - 文件
   * @description 处理文件，检查类型并生成预览URL
   * @returns {void}
   */
  function handleFiles(file: File): void {
    if (
      allowedMediaFileTypes.image.includes(
        file.type.split("/")[1].toLocaleLowerCase()
      )
    ) {
      const objectUrl = URL.createObjectURL(file);

      // 存储文件对象和预览URL，正常上传文件，文件对象是没有 uid 的
      files = [...files, { file }];
      filesSrc = [...filesSrc, objectUrl];
    } else {
      uploadingFileNotification.wrongTypeMessage = `${file.type.split("/")[1].toUpperCase()} 是不支持的文件类型`;
      uploadingFileNotification.isWrongType = false; // 先重置
      setTimeout(() => {
        // 用setTimeout可以避免被
        uploadingFileNotification.isWrongType = true; // 再设为 true
      }, 0);
    }
  }

  // 处理文件选择
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (const file of input.files) {
        handleFiles(file);
      }
    }
  }
  // 移除文件
  function removeFile(index: number) {
    // 释放不再需要的 objectURL
    URL.revokeObjectURL(filesSrc[index]);

    // 删除 imgSrc 中的图片和对应的图片对象
    filesSrc = filesSrc.filter((_, i) => i !== index);
    files = files.filter((_, i) => i !== index);
  }
</script>

<!-- 表单组件 -->
<form
  class=" h-[80vh] w-full"
  method="post"
  {action}
  enctype="multipart/form-data"
  use:enhance={({ formData }) => {
    uploadingFileNotification.isUploading = true;

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
    filesSrc
      .filter((src) => !src.startsWith("blob:"))
      .forEach((src) => {
        formData.append("filesSrc", src);
      });

    formData.append("murmurId", murmurContent?.murmur.uid as string);

    formData.append("authorId", authorId);

    return async ({ update }) => {
      await update({ reset: true });
      uploadingFileNotification.isUploading = false;
      // 清空图片
      filesSrc.forEach((url) => URL.revokeObjectURL(url));
      filesSrc = [];
      files = [];
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
      disabled={uploadingFileNotification.isUploading}
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
              bg-slate-50 dark:bg-slate-900
              "
      placeholder="请在这里输入内容……"
      bind:value={murmurText}
    ></textarea>

    {#if filesSrc.length > 0}
      <!-- 附件展示区域 -->
      <div
        class="
        h-full
        overflow-x-auto
        flex gap-2
        p-2
        pointer-events-auto
        no-scrollbar
        "
        role="region"
        aria-label="附件展示区域"
      >
        {#each filesSrc as src, index}
          <div class="relative flex-shrink-0 h-full">
            <img
              class="w-auto h-full object-cover rounded-lg"
              {src}
              alt="user upload"
              crossorigin="anonymous"
              referrerpolicy="no-referrer"
            />
            <button
              type="button"
              class="absolute right-1 top-1 bg-slate-800/70 text-slate-50 rounded-full w-6 h-6 hover:bg-slate-900/90 leading-0"
              onclick={() => removeFile(index)}
            >
              ×
            </button>
          </div>
        {/each}
      </div>
    {/if}

    <!-- menu bar -->
    <div
      class="
      px-2 w-full min-h-15
      flex items-center justify-between
      border-t-1 border-solid border-slate-300 dark:border-slate-700
      bg-slate-50 dark:bg-slate-950
      "
    >
      <!-- 图片上传按钮 -->
      <label
        for="fileUpload"
        class="cursor-pointer p-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg flex items-center gap-2"
      >
        <svg
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
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </svg>
      </label>
      <input
        type="file"
        multiple
        accept="image/*"
        class="hidden"
        name="images"
        id="fileUpload"
        onchange={handleFileSelect}
      />
      <!-- 菜单右侧 -->
      <div class="flex items-center gap-4">
        <!-- 是否显示，默认显示 -->

        <label
          class="flex items-center gap-1 text-slate-900 dark:text-slate-100 p-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
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
        <span class="text-slate-900 dark:text-slate-100"
          >字数：{murmurText.length}
        </span>
        <!-- 发送按钮 -->
        <button
          disabled={uploadingFileNotification.isUploading || isEmpty}
          type="submit"
          class="
       
            px-4 py-2
           bg-slate-900 hover:bg-slate-700
           dark:bg-slate-100 dark:hover:bg-slate-300
           text-slate-100 dark:text-slate-900
           disabled:bg-gray-500
           font-medium
           rounded-lg
                     "
        >
          发送
        </button>
      </div>
    </div>
  </div>
</form>
