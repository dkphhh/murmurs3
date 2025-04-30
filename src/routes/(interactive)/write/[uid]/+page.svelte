<script lang="ts">
  import WriteArea from "$lib/components/WriteArea.svelte";
  // 表单返回的结果
  let { data } = $props();
</script>

<svelte:head>
  <title>Update Murmur |Dkphhh's Murmurs</title>
  <meta name="description" content="Update your mindset" />
</svelte:head>

{#if data.session?.user}
  <WriteArea
    user={data.session?.user}
    murmurContent={data.theMurmur}
    action="/write?/update"
  />
{/if}
