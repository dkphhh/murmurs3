<script lang="ts">
  import Pagination from "../../components/pagination.svelte";
  import MurmursContent from "../../components/MurmursContent.svelte";

  let { data } = $props();
</script>

<MurmursContent murmurs={data.content} />

<Pagination pageNumList={data.pageNumList} currentPage={1} />
