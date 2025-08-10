<script lang="ts">
  import MarkdownRender from "$lib/components/MarkdownRender.svelte";
  import { allowedMediaFileTypes } from "$lib/helper.ts";
  import { page } from "$app/state";
  import { getFileName, getFileExtension } from "$lib/helper.ts";
  import { onMount } from "svelte";
  import "glightbox/dist/css/glightbox.min.css";

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

  onMount(() => {
    import("glightbox").then((GLightbox) => {
      // 初始化 GLightbox
      const lightboxInstance = GLightbox.default({
        touchNavigation: true,
        loop: true,
        autoplayVideos: true,
      });

      // 清理函数
      return () => {
        if (lightboxInstance) {
          lightboxInstance.destroy();
        }
      };
    });
  });
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
    <div class="flex flex-col mt-2 text-sm">
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
              <a
                href={file.fileUrl}
                class="glightbox flex-shrink-0"
                aria-label="Image viewer"
              >
                <img
                  src="https://dkphhh.me/cdn-cgi/image/height=400,quality=100/{file.fileUrl}"
                  alt={file.fileName}
                  loading="lazy"            
                  class="h-40 w-auto object-cover rounded-lg block"
                />
              </a>
            {/each}
          </div>
        {/if}
        <!-- 展示视频 -->
        {#if filesToDisplay.video.length > 0}
          <div
            class="flex gap-2 items-center w-full overflow-x-auto no-scrollbar"
          >
            {#each filesToDisplay.video as file}
              <a
                href={file.fileUrl}
                class="glightbox relative flex-shrink-0"
                aria-label="Video player"
                ><video
                  
                  preload="metadata"
                  muted
                  class="bg-black w-auto h-40 rounded-lg block"
                  src="{file.fileUrl}#t=0.001"
                  ><track kind="captions" />
                </video>
                <div
                  class="absolute inset-0 flex items-center justify-center z-50 rounded-lg
                  "
                >
                  <div
                    class="bg-slate-900/40
                    hover:bg-slate-500/40
                    rounded-full p-2 backdrop-blur-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-8 text-slate-50"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                      />
                    </svg>
                  </div>
                </div>
              </a>
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
                class="flex-shrink-0"
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
                  max-w-30 text-wrap text-left block
                  flex-shrink-0"
              >
                {file.fileName}</a
              >
            {/each}
          </div>
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
