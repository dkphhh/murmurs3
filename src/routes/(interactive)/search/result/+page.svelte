<script lang="ts">
  import SearchBox from "$lib/components/SearchBox.svelte";
  import MurmursContent from "$lib/components/MurmursContent.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import { page } from "$app/state";
  // 表单返回的结果
  let { data } = $props();
</script>

<svelte:head>
  <title>
    {`Search ${data.searchResult.query}`} | Dkphhh's Murmurs / Dkphhh 的呓语</title
  >
  <meta name="description" content="Actually, This site is my notebook" />
</svelte:head>

<main class="flex flex-col items-center justify-center w-full h-full">
  <!-- 搜索结果页面 -->

  <div class="mb-2 w-full"><SearchBox query={data.searchResult.query} /></div>

  <MurmursContent murmursData={data.searchResult.content} />
  <Pagination
    pageNumList={data.searchResult.pageNumList}
    currentPage={Number(page.url.searchParams.get("page_num"))}
  />

  <div class="h-[17vh]"></div>
</main>
