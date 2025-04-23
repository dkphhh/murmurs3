<script lang="ts">
  import "../../app.css";
  import MainTitleWithSearchBox from "../components/MainTitleWithSearchBox.svelte";
  import Directory from "../components/Directory.svelte";
  import { page } from "$app/state";
  let { children } = $props();
</script>

<div class="flex flex-col justify-start items-start">
  {#if page.url.pathname === "/"}
    <MainTitleWithSearchBox />
  {:else if page.url.pathname.split("/").includes("page")}
    <Directory />
  {/if}
  <!-- 分割线 -->
  <hr class="w-full border-slate-300 dark:border-slate-700 mb-4" />
  <!-- 内容主体 -->
  <main
    class="flex flex-col items-center justify-center mb-2
					w-[90vw]
					lg:w-[70vw]
					xl:w-[50vw]
					"
  >
    <!-- 内容 -->
    {@render children()}
  </main>
  {#if page.url.pathname === "/"}
    <Directory />
  {/if}
  <!-- 分割线 -->
</div>
