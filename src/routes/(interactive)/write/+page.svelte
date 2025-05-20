<script lang="ts">
  import WriteArea from "$lib/components/WriteArea.svelte";
  import { formNotification } from "$lib/components/notification.svelte.ts";
  // 表单返回的结果
  let { form, data } = $props();

  // 使用 $effect 来响应式更新通知
  $effect(() => {
    if (form?.error) {
      formNotification.description = form.description as string;
      formNotification.error = form.error as boolean;
    }
  });
</script>

<svelte:head>
  <title>Write Murmur |Dkphhh's Murmurs</title>
  <meta name="description" content="It's time to write something" />
</svelte:head>

{#if data.session?.user}
  <WriteArea user={data.session?.user} action="/write?/create" />
  <!-- <div class="h-[10vh]"></div> -->
{/if}
