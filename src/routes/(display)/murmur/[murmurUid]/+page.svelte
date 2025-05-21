<script lang="ts">
  import MurmursContent from "$lib/components/MurmursContent.svelte";
  import { authClient } from "$lib/auth/auth-client.ts";
  import { goto, replaceState } from "$app/navigation";
  import {
    formNotification,
    processingNotification,
  } from "$lib/components/notification.svelte.ts";
  import { onMount } from "svelte";
  import { page } from "$app/state";

  let { data, form } = $props();
  const murmursData = data.pageContent.theMurmur;
  const session = authClient.useSession();
  formNotification.error = form?.error as boolean;
  formNotification.description = form?.description as string;
  let showDeleteDialog = $state(false);

  // murmur的 create 和 update 操作都可能有后台处理流程
  // 用户刚进来这个页面看到的不是完整结果
  // 所以需要在这里弹出通知告知用户

  onMount(() => {
    const params = page.url.searchParams;
    if (params.get("processing") === "true") {
      processingNotification.isProcessing = true;
      processingNotification.description = "正在处理，请稍等...";
      // 移除 URL 中的查询参数，避免用户刷新时再次触发
      const url = page.url;
      url.searchParams.delete("processing");
      replaceState(url, window.history.state);

      const timerId = setTimeout(() => {
        location.reload();
        processingNotification.isProcessing = false;
        processingNotification.description = "";
      }, 3000);

      return () => clearTimeout(timerId);
    }
  });
</script>

<svelte:head>
  <title
    >@{murmursData.murmur.createdAt.toLocaleString()} | Dkphhh's Murmurs / Dkphhh
    的呓语</title
  >
  <meta name="description" content="Dkphhh's Murmurs // Dkphhh 的呓语" />
</svelte:head>

<div
  class="min-h-[90vh] md:min-h-[80vh] w-full
  flex flex-col justify-start items-start
  relative
  "
>
  <MurmursContent murmursData={[murmursData]} />

  <!-- 用户登录后，显示编辑项 -->
  {#if $session.data?.user.id === murmursData.murmur.authorId}
    <div class="mt-2 flex gap-4">
      <button
        type="button"
        onclick={() => {
          goto(`/write/${murmursData.murmur.uid}`);
        }}
        class="text-sky-700 dark:text-sky-300 hover:text-sky-500 decoration-2 underline decoration-dotted underline-offset-4"
      >
        Edit
      </button>
      <button
        type="button"
        onclick={() => {
          showDeleteDialog = true;
        }}
        class="text-red-700 dark:text-red-300 hover:text-red-500 decoration-2 underline decoration-dotted underline-offset-4"
        >Delete</button
      >
    </div>
  {/if}
  <!-- 确认删除的 dialog -->
  {#if showDeleteDialog}
    <dialog
      open
      class="fixed inset-0 w-full h-full bg-black/40 flex items-center justify-center z-100"
    >
      <div class="bg-slate-50 dark:bg-slate-950 p-6 rounded-lg shadow-lg">
        <p class="mb-4 text-slate-950 dark:text-slate-50">
          确定要删除这条内容吗？此操作不可恢复。
        </p>
        <div class="flex gap-4 justify-end">
          <button
            class="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
            onclick={() => (showDeleteDialog = false)}
          >
            取消</button
          >
          <form method="POST" action="?/delete">
            <input
              type="text"
              hidden
              name="murmurUid"
              value={murmursData.murmur.uid}
            />
            <button
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >确定删除</button
            >
          </form>
        </div>
      </div>
    </dialog>
  {/if}
</div>
