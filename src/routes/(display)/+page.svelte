<script lang="ts">
  import MurmursContent from "$lib/components/MurmursContent.svelte";
  import WriteArea from "$lib/components/WriteArea.svelte";

  let { data } = $props();
  let showWriteArea = $state(false);
  let user = data.session?.user;
</script>

<MurmursContent murmursData={data.murmurs} />

<!-- 写 murmurs 的按钮 -->
{#if user}
  <div class="fixed right-10 bottom-10">
    <button
      type="button"
      aria-label="Write Murmurs button"
      onclick={() => (showWriteArea = true)}
      class="
    bg-slate-200 dark:bg-slate-800
    hover:bg-slate-300 dark:hover:bg-slate-700
    p-3 rounded-full
    "
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
        />
      </svg>
    </button>
  </div>
  <!-- 展示writeArea组件的dialog -->
  {#if showWriteArea}
    <dialog
      open
      class="fixed inset-0 w-full h-full bg-black/40 flex items-center justify-center z-60"
      onclick={(e) => {
        if (e.target === e.currentTarget) showWriteArea = false;
      }}
    >
      <div class="w-1/2 p-2 bg-slate-50 rounded-lg">
        <WriteArea {user} action="/write?/create" />
      </div>
    </dialog>
  {/if}
{/if}
