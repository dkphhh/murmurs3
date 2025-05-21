<script lang="ts">
  import Pagination from "$lib/components/Pagination.svelte";
  import MurmursContent from "$lib/components/MurmursContent.svelte";

  let { data } = $props();
</script>

<svelte:head>
  <title>PAGE-1 |Dkphhh's Murmurs / Dkphhh 的呓语</title>
  <meta name="description" content="Dkphhh's Murmurs // Dkphhh 的呓语" />
</svelte:head>

<MurmursContent murmursData={data.content} />

<Pagination pageNumList={data.pageNumList} currentPage={1} />
