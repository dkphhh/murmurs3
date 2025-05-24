<script lang="ts">
  import WriteArea from "$lib/components/WriteArea.svelte";
  // 表单返回的结果
  let { data } = $props();
</script>

<svelte:head>
  <title>Write Murmur | Dkphhh's Murmurs / Dkphhh 的呓语</title>
  <meta name="description" content="It's time to write something" />
</svelte:head>

{#if data.session?.user}
  <WriteArea user={data.session?.user} action="/write?/create" />
  <!-- <div class="h-[10vh]"></div> -->
{/if}
