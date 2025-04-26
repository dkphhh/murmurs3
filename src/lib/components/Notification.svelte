<script lang="ts">
  import { updated } from "$app/state";
  import { navigating } from "$app/state";
  import {
    formNotification,
    searchNotification,
    uploadingFileNotification,
    notificationTimeout,
    pageLoadingNotification,
  } from "$lib/components/notification.svelte.ts";

  // TODO 给通知加一个夜间模式，优化关闭通知的样式

  let messageVisible = $derived(
    uploadingFileNotification.isUploading ||
      formNotification?.error == true ||
      uploadingFileNotification.isWrongType ||
      updated.current ||
      Boolean(navigating.to) ||
      (!searchNotification.isValidQuery && searchNotification.query) ||
      pageLoadingNotification.error
  );

  // 不能根据状态变化自动关闭的通知，将在规定时间后自动关闭
  $effect(() => {
    if (formNotification.error) {
      setTimeout(() => {
        formNotification.error = false;
      }, notificationTimeout);
    }
    if (uploadingFileNotification.isWrongType) {
      setTimeout(() => {
        uploadingFileNotification.isWrongType = false;
      }, notificationTimeout);
    }
    if (pageLoadingNotification.error) {
      setTimeout(() => {
        pageLoadingNotification.error = false;
      }, notificationTimeout);
    }
    if (searchNotification.query) {
      setTimeout(() => {
        searchNotification.query = "";
      }, notificationTimeout);
    }
    if (searchNotification.isValidQuery) {
      setTimeout(() => {
        searchNotification.isValidQuery = false;
      }, notificationTimeout);
    }
  });
</script>

{#if messageVisible}
  <div
    class="
        fixed top-4 left-1/2 -translate-x-1/2
        z-100
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
      onclick={() => {
        messageVisible = false;
        if (formNotification.error) {
          formNotification.error = false;
        }
        if (uploadingFileNotification.isWrongType) {
          uploadingFileNotification.isWrongType = false;
        }
        if (pageLoadingNotification.error) {
          pageLoadingNotification.error = false;
        }
        if (searchNotification.query) {
          searchNotification.query = "";
        }
        if (searchNotification.isValidQuery) {
          searchNotification.isValidQuery = false;
        }
      }}
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
