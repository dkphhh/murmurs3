<script lang="ts">
  import type { MurmursByRead } from "$lib/server/db/utils";
  import MarkdownRender from "./MarkdownRender.svelte";
  import { authClient } from "$lib/auth/auth-client.js";

  const session = authClient.useSession();
  let {
    murmurs,
  }: {
    murmurs: MurmursByRead[];
  } = $props();

  let hoveredMurmurUid: string | null = $state(null); // 用于存储当前悬停的murmur的ID

  // TODO：展示 murmurs 的内容下方加上 菜单（修改、threads、等等）按钮，鼠标放到对应murmurs后显示，点击后可以进行操作。暂时先不做
  // TODO：单独的标签页按钮
  // TODO: 一个展示tags的列表
  
</script>

{#snippet murmurSnip(murmur: MurmursByRead)}
  <div class="mb-4">
    <!-- 展示时间 -->
    <p class="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
      @{murmur.createdAt.toLocaleString()}
    </p>
    <!-- 展示内容 -->
    <div class="flex flex-col gap-2">
      <MarkdownRender markdownText={murmur.content} />
    </div>
    <!-- 展示 tag -->
    <div class="mt-1 hidden">
      {#each murmur.tags as tag}
        <a
          href="/tags/{tag.uid}"
          class="text-xs text-slate-800 dark:text-slate-200 mb-1 mr-4 p-1 bg-slate-200 rounded-md dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700"
          >{tag.tag}</a
        >
      {/each}
    </div>
  </div>
{/snippet}

<article class="flex flex-col justify-start w-full gap-2">
  {#each murmurs as murmur}
    {@render murmurSnip(murmur)}
  {/each}
</article>
