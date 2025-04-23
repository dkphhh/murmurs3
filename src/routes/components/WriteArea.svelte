<script lang="ts">
  import { enhance } from "$app/forms";
  import { onMount } from "svelte";
  import { uploadingFileNotification } from "./notification.svelte.ts";
  import type { UserInSession } from "$lib/server/db/scheme/auth-schema";

  // TODO: 图片上传按钮
  // TODO：视频上传按钮
  // TODO：音频上传按钮
  // TODO：发送语音按钮
  // TODO：文件上传按钮
  // TODO：字数统计

  // 表单返回的结果
  let { user, murmurContent }: { user: UserInSession; murmurContent?: string } =
    $props();
  let authorId = user.id as string;
  let imgSrc: string[] = $state([]); // 图片链接
  let imgFiles: File[] = $state([]); // 实际的图片文件对象
  let murmurText: string = $state(""); // 文本内容

  // 组件加载成功后，将传入的内容赋值给文本框
  // 这样可以在页面加载时显示传入的内容
  onMount(() => {
    murmurText = murmurContent || "";
  });

  // 表单内容是否为空
  let isEmpty = $derived(murmurText.trim() == "" && imgSrc.length == 0);

  // 允许上传图片的类型
  const allowedImgTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  // ------------------ 文件拖入展示状态 -----------------------------------
  // 是否在拖入图片的状态
  let isDragging: number = $state(0);

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    // 保持isDragging为true，但不改变计数器
  }

  // 触发离开
  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    isDragging -= 1;
  }
  // 触发拖入
  function handleDragEnter(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    isDragging += 1;
  }
  // ............... 处理图片上传 ...............

  /**
   * 处理图片文件
   * @param file  - 图片文件
   * @description 处理图片文件，检查类型并生成预览URL
   * @returns {void}
   */
  function handleImg(file: File): void {
    if (allowedImgTypes.includes(file.type)) {
      const objectUrl = URL.createObjectURL(file);
      // 存储文件对象和预览URL
      imgFiles = [...imgFiles, file];
      imgSrc = [...imgSrc, objectUrl];
    } else {
      uploadingFileNotification.wrongTypeMessage = `${file.type.split("/")[1].toUpperCase()} 是不支持的文件类型`;
      uploadingFileNotification.isWrongType = false; // 先重置
      setTimeout(() => {
        // 用setTimeout可以避免被
        uploadingFileNotification.isWrongType = true; // 再设为 true
      }, 0);
    }
  }

  // 处理拖入图片的动作
  function handleDrop(event: DragEvent) {
    // 避免触发浏览器默认事件
    event.preventDefault();
    event.stopPropagation();
    isDragging = 0;
    const files = event.dataTransfer?.files;

    if (files) {
      for (const file of files) {
        // 检查文件类型是否被允许
        handleImg(file);
      }
    }
  }

  // 处理文件选择
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (const file of input.files) {
        handleImg(file);
      }
    }
  }
  // 移除图片
  function removeImage(index: number) {
    // 释放不再需要的 objectURL
    URL.revokeObjectURL(imgSrc[index]);
    // 删除 imgSrc 中的图片和对应的图片对象
    imgSrc = imgSrc.filter((_, i) => i !== index);
    imgFiles = imgFiles.filter((_, i) => i !== index);
  }
</script>

<!-- menu bar -->
<div class="flex items-center justify-between">
  <label
    for="fileUpload"
    class="cursor-pointer px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg shadow-md flex items-center gap-2"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      ><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline
        points="17 8 12 3 7 8"
      ></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg
    >
    上传图片
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
</div>

<!-- 表单组件 -->
<form
  class=" flex flex-col gap-2 h-full w-full"
  action="/write?"
  method="post"
  enctype="multipart/form-data"
  use:enhance={({ formData }) => {
    uploadingFileNotification.isUploading = true;

    // 将图片文件添加到表单数据中
    imgFiles.forEach((file) => {
      formData.append("images", file);
    });

    formData.append("authorId", authorId);

    // 添加文本内容
    // formData.append("text", murmurText);

    return async ({ update }) => {
      await update({ reset: true });
      uploadingFileNotification.isUploading = false;
      // 清空图片
      imgSrc.forEach((url) => URL.revokeObjectURL(url));
      imgSrc = [];
      imgFiles = [];
    };
  }}
>
  <!-- 文字内容输入区域 -->
  <div
    class="
              relative
              w-full h-full
              basis-3/5
              "
  >
    <textarea
      disabled={uploadingFileNotification.isUploading}
      name="text"
      class="
              overflow-y-auto
              w-full h-full
              text-base
              p-2 sm:p-4 border border-slate-500 rounded-lg shadow-md resize-none
              focus:outline-none focus:ring-2 focus:ring-slate-700
               dark:focus:ring-slate-300 dark:bg-slate-950
              "
      placeholder="请在这里输入内容……"
      bind:value={murmurText}
    ></textarea>

    <!-- 发送按钮 -->
    <button
      disabled={uploadingFileNotification.isUploading || isEmpty}
      type="submit"
      class="
             absolute bottom-2 right-2
             px-4 py-2
            bg-slate-900 hover:bg-slate-700
            dark:bg-slate-100 dark:hover:bg-slate-300
            text-slate-100 dark:text-slate-900
            disabled:bg-gray-500
            font-medium
            rounded-lg shadow-md
                      "
    >
      发送
    </button>
  </div>

  <!-- 图片上传与展示区域 -->
  <div
    class="
              w-full h-full rounded-lg
              basis-2/5
              overflow-x-auto
              flex gap-2
              p-2 border border-dashed border-slate-300 dark:border-slate-700
              relative
              "
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    ondragenter={handleDragEnter}
    role="region"
    aria-label="图片上传区域"
  >
    <!-- 拖拽提示 -->
    {#if isDragging}
      <div
        class="z-50 absolute inset-0 flex items-center justify-center bg-slate-900/30 rounded-lg"
      >
        <p class="text-slate-50 text-xl font-bold">释放鼠标上传图片</p>
      </div>
    {/if}

    {#if imgSrc.length === 0}
      <div
        class="w-full h-full flex items-center justify-center text-slate-500"
      >
        <p>拖拽图片到文本框中上传</p>
      </div>
    {:else}
      {#each imgSrc as src, index}
        <div class="relative h-full">
          <img
            class="w-auto h-full object-cover rounded-lg shadow-xl"
            {src}
            alt="user upload"
          />
          <button
            type="button"
            class="absolute right-1 top-1 bg-slate-800/70 text-slate-50 rounded-full w-6 h-6
            hover:bg-slate-900/90 leading-0"
            onclick={() => removeImage(index)}
          >
            ×
          </button>
        </div>
      {/each}
    {/if}
  </div>
</form>
