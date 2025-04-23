<script lang="ts">
  import { updated } from "$app/state";
  import { navigating } from "$app/state";
  import {
    formNotification,
    searchNotification,
    uploadingFileNotification,
    notificationTimeout,
    pageLoadingNotification,
  } from "./notification.svelte.ts";
  let closeNotification = $state(false);
  // TODO 给通知加一个夜间模式，优化关闭通知的样式

  const messageVisible = $derived(
    uploadingFileNotification.isUploading ||
      formNotification?.error == true ||
      uploadingFileNotification.isWrongType ||
      updated.current ||
      Boolean(navigating.to) ||
      (!searchNotification.isValidQuery && searchNotification.query) ||
      pageLoadingNotification.error
  );

  // 每当消息可见时重置关闭状态和计时器
  $effect(() => {
    if (messageVisible) {
      closeNotification = false;

      // 设置自动关闭
      const timer = setTimeout(() => {
        closeNotification = true;
      }, notificationTimeout);

      return () => clearTimeout(timer);
    }
  });
</script>

{#if messageVisible && !closeNotification}
  <div
    class="
        fixed top-4 left-1/2 -translate-x-1/2
        z-50
        shadow-lg
        py-2 px-4
        flex justify-between items-start
        bg-slate-100/95
        dark:bg-slate-900/95 font-mono
        rounded-lg
        w-fit"
  >
    <div class="text-center">
      {#if formNotification?.error == true}
        ⚠️ {formNotification?.description}
      {:else if uploadingFileNotification.isUploading}
        📤 uploading……
      {:else if uploadingFileNotification.isWrongType}
        ⚠️ {uploadingFileNotification.wrongTypeMessage}
      {:else if updated.current}
        ✅ 有版本更新，请刷新页面
      {:else if navigating.to}
        🚀 正在跳转到 {navigating.to.url.pathname}
      {:else if !searchNotification.isValidQuery && searchNotification.query}
        🔍 {searchNotification.query} 搜索结果为空
      {/if}
    </div>
    <button
      onclick={() => (closeNotification = true)}
      class="
            w-6 h-6
            shrink-0 grow-0
            rounded-full
            bg-slate-500/50
            hover:bg-slate-500
            ml-4
            "
      >×
    </button>
  </div>
{/if}
