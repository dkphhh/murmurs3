<script lang="ts">
  import Pagination from "../../../components/pagination.svelte";
  import MurmursContent from "../../../components/MurmursContent.svelte";
  let { data } = $props();
</script>

<MurmursContent murmurs={data.pageContent.murmurs} />

<Pagination
  pageNumList={data.pageContent.pageNumList}
  currentPage={data.pageContent.currentPage}
/>
