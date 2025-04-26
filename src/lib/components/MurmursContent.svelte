<script lang="ts">
  import type { MurmursByRead } from "$lib/server/db/utils.ts";
  import MarkdownRender from "$lib/components/MarkdownRender.svelte";
  import { authClient } from "$lib/auth/auth-client.ts";
  import { allowedMediaFileTypes } from "$lib/helper.ts";
  import { page } from "$app/state";

  const session = authClient.useSession();
  let {
    murmursData,
  }: {
    murmursData: MurmursByRead[];
  } = $props();

  let hoveredMurmurUid: string | null = $state(null); // 用于存储当前悬停的murmur的ID

  /**
   * 获取文件链接的后缀名（不含点），如 jpg、webp、mp4、mp3 等
   * @param url 文件链接
   * @returns 后缀名字符串（小写），如果没有后缀返回空字符串
   */
  function etFileExtension(url: string): string {
    // 去除查询参数和哈希
    const cleanUrl = url.split(/[?#]/)[0];
    // 匹配最后一个点后的内容
    const match = cleanUrl.match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1].toLowerCase() : "";
  }

  /**
   * 获取文件链接中的文件名（包含扩展名）
   * @param url 文件链接
   * @returns 文件名字符串，如果没有则返回空字符串
   */
  export function getFileName(url: string): string {
    // 去除查询参数和哈希
    const cleanUrl = url.split(/[?#]/)[0];
    // 匹配最后一个斜杠后的内容
    const match = cleanUrl.match(/\/([^\/]+)$/);
    return match ? match[1] : "";
  }

  // TODO：展示 murmurs 的内容下方加上 菜单（修改、threads、等等）按钮，鼠标放到对应murmurs后显示，点击后可以进行操作。暂时先不做
  // TODO：单独的标签页按钮
  // TODO: 一个展示tags的列表
  // TODO: 点击放大图片/视频/音频
</script>

{#snippet murmurSnip(murmursData: MurmursByRead)}
  {@const tags = murmursData.tags ? murmursData.tags : []}
  {@const files = murmursData.files ? murmursData.files : []}
  <div
    class="py-4 px-2 border-b-1 border-slate-300 border-dotted dark:border-slate-700 last:border-b-0"
  >
    <!-- 展示时间 -->
    <time
      datetime={murmursData.murmur.createdAt.toISOString()}
      class="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1"
    >
      {#if !page.url.pathname.startsWith("/murmur")}
        <a href="/murmur/{murmursData.murmur.uid}" class="hover:text-slate-500">
          @{murmursData.murmur.createdAt.toLocaleString()}
        </a>
      {:else}
        @{murmursData.murmur.createdAt.toLocaleString()}
      {/if}
    </time>

    <!-- 展示内容 -->
    <div class="flex flex-col">
      <MarkdownRender markdownText={murmursData.murmur.content} />
    </div>
    <!-- 展示附件 -->
    {#if files.length > 0}
      <div
        class="flex gap-2 items-center w-full h-40 overflow-x-auto no-scrollbar mt-1"
      >
        <!-- 如果附件展示内容需要滚动 scroll bar 才能看见，需要增加一个提示，提示用户滚动 -->

        {#each files as file}
          {@const fileType = etFileExtension(file.fileUrl)}
          {@const fileName = getFileName(file.fileUrl)}
          {#if allowedMediaFileTypes.image.includes(fileType)}
            <!-- 图片 -->
            <img
              src={file.fileUrl}
              alt={fileName}
              class="rounded-lg h-full"
              crossorigin="anonymous"
              referrerpolicy="no-referrer"
            />
          {:else if allowedMediaFileTypes.video.includes(fileType)}
            <!-- 视频 -->
            <video
              src={file.fileUrl}
              class="mt-1 rounded-lg"
              width="320"
              height="auto"
              controls><track kind="captions" /></video
            >
          {:else if allowedMediaFileTypes.audio.includes(fileType)}
            <!-- 音频 -->
            <audio src={file.fileUrl} class="mt-1 rounded-lg" controls></audio>
          {:else}
            <!-- 其他类型文件 -->
            <a
              href={file.fileUrl}
              class="mt-1 rounded-lg text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 p-2"
              download>{fileName}</a
            >
          {/if}
        {/each}
      </div>
    {/if}
    <!-- 展示 tag -->
    <div class="mt-1 hidden">
      {#each tags as tag}
        <a
          href="/tags/{tag.uid}"
          class="text-xs text-slate-800 dark:text-slate-200 mb-1 mr-4 p-1 bg-slate-200 rounded-md dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700"
          >{tag.tag}</a
        >
      {/each}
    </div>
  </div>
{/snippet}

<article
  class="flex flex-col justify-start w-full
  border-dotted border-1 border-slate-300 rounded-lg dark:border-slate-700"
>
  {#each murmursData as murmurData}
    {@render murmurSnip(murmurData)}
  {/each}
</article>
