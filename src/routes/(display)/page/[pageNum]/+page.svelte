<script lang="ts">
  import Pagination from "$lib/components/Pagination.svelte";
  import MurmursContent from "$lib/components/MurmursContent.svelte";
  let { data } = $props();
</script>

<MurmursContent murmursData={data.pageContent.murmurs} />

<Pagination
  pageNumList={data.pageContent.pageNumList}
  currentPage={data.pageContent.currentPage}
/>
