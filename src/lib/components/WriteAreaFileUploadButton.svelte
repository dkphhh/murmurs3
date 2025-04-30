<!-- filepath: src/lib/components/IconButton.svelte -->
<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    accept,
    onclick, // 事件处理器
    title, // 悬浮提示文字
    children, // 插槽内容 (用于放置 SVG)
  }: {
    accept: string | undefined; // 文件类型
    onclick: (event: Event) => void;
    title: string;
    children: Snippet; // Svelte 5 Snippet 类型，用于插槽
  } = $props();
</script>

<label
  {title}
  class="cursor-pointer p-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg flex items-center gap-2"
>
  <!-- 可选：为屏幕阅读器提供额外信息 -->
  {@render children()}
  <!-- 渲染传入插槽的内容 (SVG 图标) -->
  <input type="file" multiple {accept} class="hidden" onchange={onclick} />
</label>
