<script lang="ts">
  import "../app.css";
  import DarkModeButton from "$lib/components/ColorModeButton.svelte";
  import Notification from "$lib/components/Notification.svelte";

  let { children } = $props();
</script>

<DarkModeButton />

<Notification />

<div
  class="
      flex flex-col justify-start items-center
      min-h-screen w-full px-2 py-4
      font-light font-sans
      tracking-wider text-justify
      text-slate-900
      dark:bg-slate-950
      dark:text-slate-100
      "
>
  {@render children()}

  <hr class="w-full border-slate-300 dark:border-slate-700 mt-2" />
  <footer class="flex justify-center items-center mt-4 w-full">
    <img
      class="mb-2 w-25"
      alt="Written By Human Not By AI"
      loading="lazy"
      src="/Written-By-Human-Not-By-AI-Badge-white.svg"
    />
  </footer>
</div>
