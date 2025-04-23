<script lang="ts">
  import { page } from "$app/state";
  let {
    pageNumList,
    currentPage = 1,
  }: {
    pageNumList: (number | "……")[];
    currentPage?: number;
  } = $props();
</script>

<nav
  class="flex justify-center items-center text-slate-100 dark:text-slate-900 bg-slate-200 dark:bg-slate-800 rounded-lg w-full p-2 mt-4 leading-6"
>
  {#each pageNumList as pageNum}
    {@const disable = pageNum === currentPage || pageNum === "……"}
    {@const pathName = page.url.pathname}
    {@const pathParam = page.url.searchParams}
    <a
      href={disable
        ? "/"
        : pathName === "/search"
          ? `/search?q=${pathParam.get("q")}&page_num=${pageNum}`
          : `/page/${pageNum}`}
      class="
            mx-2 px-2 py-1 rounded
            {disable
        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed pointer-events-none'
        : 'bg-slate-700 dark:bg-slate-300  hover:bg-slate-500'}"
    >
      {pageNum}
    </a>
  {/each}
</nav>
