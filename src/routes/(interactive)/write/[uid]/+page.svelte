<script lang="ts">
  import WriteArea from "../../../components/WriteArea.svelte";
  import { formNotification } from "../../../components/notification.svelte.js";
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

{#if data.session?.user}
  <WriteArea user={data.session?.user} />
{/if}
