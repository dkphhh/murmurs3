<script lang="ts">
  import "../../app.css";
  import MainTitleWithSearchBox from "$lib/components/MainTitleWithSearchBox.svelte";
  import Directory from "$lib/components/Directory.svelte";
  import { page } from "$app/state";
  let { children } = $props();
</script>

<div class="flex flex-col justify-start items-start">
  {#if page.url.pathname === "/"}
    <MainTitleWithSearchBox />
  {:else}
    <Directory />
  {/if}

  <!-- 内容主体 -->
  <main
    class="flex flex-col items-center justify-center mb-2
					w-[90vw]
					lg:w-[70vw]
					xl:w-[60vw]
					"
  >
    <!-- 内容 -->
    {@render children()}
  </main>
  {#if page.url.pathname === "/"}
    <Directory />
  {/if}
</div>
