<script lang="ts">
  import { updated } from "$app/state";
  import { navigating } from "$app/state";
  import { localNotification,notificationDuration } from "$lib/components/notification.svelte.ts";

  let messageVisible = $derived(
    localNotification.type !== undefined ||
      Boolean(navigating.to) ||
      updated.current,
  );

  // 规定时间后，自动隐藏通知
  $effect(() => {
    if (localNotification.type !== undefined) {
      const timer = setTimeout(() => {
        localNotification.type = undefined;
      }, notificationDuration);

      return () => {
        clearTimeout(timer);
      };
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
    <div class="text-center dark:text-slate-100 text-slate-900">
      {#if localNotification?.type == "warning"}
        ⚠️ {localNotification?.description}
      {:else if localNotification?.type == "error"}
        ❌ {localNotification?.description}
      {:else if localNotification?.type == "info"}
        💬 {localNotification?.description}
      {:else if navigating.to}
        ⏳ 正在跳转到 {navigating?.to.url.pathname}...
      {:else if updated.current}
        ✅ 有版本更新，请刷新页面
      {:else}
        ⚠️ 未知错误,也不知道怎么就要给你发通知了
      {/if}
    </div>
    <button
      onclick={() => {
        messageVisible = false;
        if (localNotification) {
          localNotification.type = undefined;
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
