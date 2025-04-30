<script lang="ts">
  import { page } from "$app/state";
</script>

<div class="flex flex-col justify-center items-center h-[85vh] gap-4">
  <h1 class="text-6xl">{page.status}: {page.error?.message}</h1>
  <h2 class="text-xl">Oops!</h2>
  <p class="text-xl">似乎出了一点问题……</p>
  <p class="text-xl">looks like something went wrong……</p>
</div>
