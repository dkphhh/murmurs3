<script lang="ts">
  import type { MurmursByRead } from "$lib/server/db/utils.ts";
  import MarkdownRender from "$lib/components/MarkdownRender.svelte";
  import { authClient } from "$lib/auth/auth-client.ts";
  import { allowedMediaFileTypes } from "$lib/helper.ts";
  import { page } from "$app/state";
  import { getFileName, getFileExtension } from "$lib/helper.ts";
  import type { SelectMediaFile } from "$lib/server/db/scheme/content-scheme.ts";

  let {
    murmursData,
  }: {
    murmursData: MurmursByRead[];
  } = $props();

  interface FileToDisplay {
    file: SelectMediaFile;
    fileName: string;
    fileUrl: string;
  }

  function getFilesToDisplay(files: SelectMediaFile[]): {
    image: FileToDisplay[];
    video: FileToDisplay[];
    audio: FileToDisplay[];
    other: FileToDisplay[];
  } {
    const fileToDisplay: {
      image: FileToDisplay[];
      video: FileToDisplay[];
      audio: FileToDisplay[];
      other: FileToDisplay[];
    } = {
      image: [],
      video: [],
      audio: [],
      other: [],
    };
    files.forEach((file) => {
      const fileType = getFileExtension(file.fileUrl);
      if (allowedMediaFileTypes.image.includes(fileType)) {
        fileToDisplay.image.push({
          file: file,
          fileName: getFileName(file.fileUrl),
          fileUrl: file.fileUrl,
        });
      } else if (allowedMediaFileTypes.video.includes(fileType)) {
        fileToDisplay.video.push({
          file: file,
          fileName: getFileName(file.fileUrl),
          fileUrl: file.fileUrl,
        });
      } else if (allowedMediaFileTypes.audio.includes(fileType)) {
        fileToDisplay.audio.push({
          file: file,
          fileName: getFileName(file.fileUrl),
          fileUrl: file.fileUrl,
        });
      } else {
        fileToDisplay.other.push({
          file: file,
          fileName: getFileName(file.fileUrl),
          fileUrl: file.fileUrl,
        });
      }
    });
    return fileToDisplay;
  }
</script>

{#snippet murmurSnip(murmursData: MurmursByRead)}
  {@const tags = murmursData.tags ? murmursData.tags : []}
  {@const files = murmursData.files ? murmursData.files : []}
  <div
    class="p-4 border-b-1 border-slate-300 border-dotted dark:border-slate-700 last:border-b-0"
  >
    <!-- 展示时间 -->
    <time
      datetime={murmursData.murmur.createdAt.toISOString()}
      class="text-xs font-semibold text-slate-700 dark:text-slate-300"
    >
      {#if !page.url.pathname.startsWith("/murmur")}
        <a href="/murmur/{murmursData.murmur.uid}" class="hover:text-slate-500">
          @{murmursData.murmur.createdAt.toLocaleString()}
        </a>
      {:else}
        @{murmursData.murmur.createdAt.toLocaleString()}
      {/if}
    </time>

    <!-- 展示文本内容 -->
    <div class="flex flex-col mt-2">
      <MarkdownRender markdownText={murmursData.murmur.content} />
    </div>
    <!-- 展示附件 -->
    {#if files.length > 0}
      {@const filesToDisplay = getFilesToDisplay(files)}
      <div class="flex flex-col w-full mt-1 gap-2">
        <!-- 展示图片 -->
        {#if filesToDisplay.image.length > 0}
          <div
            class="flex gap-2 items-center w-full overflow-x-auto no-scrollbar"
          >
            {#each filesToDisplay.image as file}
              <img
                src={file.fileUrl}
                alt={file.fileName}
                loading="lazy"
                crossorigin="anonymous"
                referrerpolicy="no-referrer"
                class="h-40 w-auto object-cover rounded-lg"
              />
            {/each}
          </div>
          <!-- 展示视频 -->
          {#if filesToDisplay.video.length > 0}
            <div
              class="flex gap-2 items-center w-full overflow-x-auto no-scrollbar"
            >
              {#each filesToDisplay.video as file}
                <video
                  controls
                  preload="metadata"
                  crossorigin="anonymous"
                  class="w-auto h-40 object-cover rounded-lg"
                  src={file.fileUrl}><track kind="captions" /></video
                >
              {/each}
            </div>
          {/if}

          <!-- 展示音频 -->
          {#if filesToDisplay.audio.length > 0}
            <div
              class="flex gap-2 items-center w-full overflow-x-auto no-scrollbar"
            >
              {#each filesToDisplay.audio as file}
                <audio
                  controls
                  preload="metadata"
                  crossorigin="anonymous"
                  src={file.fileUrl}
                ></audio>
              {/each}
            </div>
          {/if}
          <!-- 展示其他附件 -->
          {#if filesToDisplay.other.length > 0}
            <div
              class="flex gap-2 items-center w-full overflow-x-auto no-scrollbar"
            >
              {#each filesToDisplay.other as file}
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noreferrer nofollow"
                  class="text-slate-800 dark:text-slate-200
                  bg-slate-100 dark:bg-slate-900
                  hover:bg-slate-200 dark:hover:bg-slate-800
                  p-2
                  rounded-lg
                  text-sm
                  max-w-30 text-wrap text-left block"
                >
                  {file.fileName}</a
                >
              {/each}
            </div>
          {/if}
        {/if}
      </div>
    {/if}
    <!-- 展示 tag -->
    {#if tags.length > 0}
      <div class="flex justify-end mt-2">
        {#each tags as tag}
          <a
            href="/#"
            class="text-xs text-slate-800 dark:text-slate-200
          mr-4 last:mr-0
          p-1
          rounded-lg
          bg-slate-100 dark:bg-slate-900
          hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            #{tag.tag}</a
          >
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<article
  class="flex flex-col justify-start w-full
  outline-dotted outline-1 outline-slate-300 rounded-lg dark:outline-slate-700"
>
  {#each murmursData as murmurData}
    {@render murmurSnip(murmurData)}
  {/each}
</article>
