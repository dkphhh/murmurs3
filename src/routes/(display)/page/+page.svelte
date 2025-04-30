<script lang="ts">
  import Pagination from "$lib/components/Pagination.svelte";
  import MurmursContent from "$lib/components/MurmursContent.svelte";

  let { data } = $props();
</script>

<MurmursContent murmursData={data.content} />

<Pagination pageNumList={data.pageNumList} currentPage={1} />
