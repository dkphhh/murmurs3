<script lang="ts">
  import { page } from "$app/state";
  import { authClient } from "$lib/auth/auth-client.ts";
  const session = authClient.useSession();
</script>

<!-- 目录 -->
<div class="flex justify-start items-center gap-4 w-full mb-2">
  <p class="font-thin">Directory:</p>
  {#if page.url.pathname !== "/"}
    <a
      class="
   text-sky-700 dark:text-sky-300 hover:text-sky-500 decoration-2 underline decoration-dotted underline-offset-4 shrink-0
      "
      href="/"
      >..
    </a>
  {/if}

  <a
    href="/page"
    class=" text-sky-700 dark:text-sky-300 hover:text-sky-500 decoration-2 underline decoration-dotted underline-offset-4 shrink-0"
    >All Murmurs</a
  >
  {#if $session.data?.user}
    <a
      href="/write"
      target="_blank"
      class=" text-sky-700 dark:text-sky-300 hover:text-sky-500 decoration-2 underline decoration-dotted underline-offset-4"
      >Write</a
    >
    <a
      href="/auth"
      target="_blank"
      class=" text-sky-700 dark:text-sky-300 hover:text-sky-500 decoration-2 underline decoration-dotted underline-offset-4"
      >User</a
    >
  {/if}

  <a
    href="https://blog.dkphhh.me/"
    target="_blank"
    class=" text-sky-700 dark:text-sky-300 hover:text-sky-500 decoration-2 underline decoration-dotted underline-offset-4"
    >Blog</a
  >
</div>
