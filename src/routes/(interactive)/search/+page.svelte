<script lang="ts">
  import MainTitleWithSearchBox from "$lib/components/MainTitleWithSearchBox.svelte";
</script>

<svelte:head>
  <title>Search Murmur | Dkphhh's Murmurs / Dkphhh 的呓语</title>
  <meta name="description" content="Actually, This site is my notebook" />
</svelte:head>

<main class="flex flex-col items-center justify-center w-full h-full">
  <!-- 如果没有搜索结果，直接展示搜索框 -->
  <div class="flex items-center justify-center w-full h-[65vh]">
    <MainTitleWithSearchBox />
  </div>

  <div class="h-[17vh]"></div>
</main>
