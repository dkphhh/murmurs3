<script lang="ts">
  import Directory from "$lib/components/Directory.svelte";
  let { children } = $props();
</script>

<div
  class="flex flex-col justify-center items-center gap-2
    w-[90vw]
    md:w-[60vw]
    h-full"
>
  <Directory />
  {@render children()}
</div>
