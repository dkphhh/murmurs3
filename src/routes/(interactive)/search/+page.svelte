<script lang="ts">
  import SearchBox from "$lib/components/SearchBox.svelte";
  import MainTitleWithSearchBox from "$lib/components/MainTitleWithSearchBox.svelte";
  import MurmursContent from "$lib/components/MurmursContent.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import { page } from "$app/state";
  import { searchNotification } from "$lib/components/notification.svelte.ts";
  // 表单返回的结果
  let { data } = $props();

  $effect(() => {
    if (data.searchResult) {
      searchNotification.query = data.searchResult?.query;
      searchNotification.isValidQuery = data.searchResult?.isValidQuery;
    }
  });
</script>

<svelte:head>
  <title>
    {data.searchResult.isValidQuery
      ? `Search ${data.searchResult.query}`
      : "Search Murmur"} |Dkphhh's Murmurs</title
  >
  <meta name="description" content="Actually, This site is my notebook" />
</svelte:head>

<main class="flex flex-col items-center justify-center w-full h-full">
  <!-- 搜索结果页面 -->

  {#if data.searchResult.isValidQuery}
    <!-- 如果有搜索结果，展示结果+搜索框-->
    <div class="mb-2 w-full"><SearchBox query={data.searchResult.query} /></div>

    <MurmursContent murmursData={data.searchResult.content} />
    <Pagination
      pageNumList={data.searchResult.pageNumList}
      currentPage={Number(page.url.searchParams.get("page_num"))}
    />
  {:else}
    <!-- 如果没有搜索结果，直接展示搜索框 -->
    <div class="flex items-center justify-center w-full h-[70vh]">
      <MainTitleWithSearchBox />
    </div>
  {/if}
</main>
