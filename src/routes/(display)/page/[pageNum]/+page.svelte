<script lang="ts">
  import Pagination from "$lib/components/Pagination.svelte";
  import MurmursContent from "$lib/components/MurmursContent.svelte";
  let { data } = $props();
</script>

<svelte:head>
  <title>PAGE-{data.pageContent.currentPage.toString()} |Dkphhh's Murmurs</title>
  <meta name="description" content="Dkphhh's Murmurs // Dkphhh 的呓语" />
</svelte:head>

<MurmursContent murmursData={data.pageContent.murmurs} />

<Pagination
  pageNumList={data.pageContent.pageNumList}
  currentPage={data.pageContent.currentPage}
/>
