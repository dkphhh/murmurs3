<script lang="ts">
  import { goto } from "$app/navigation";
  let isFocus = $state(false);
  let { query = "" } = $props();
  let isAdjustHeight = $derived(isFocus && query.length > 10);

  /**
   * 自动调整搜索框高度
   * @param {any} e:Event
   * @returns {any}
   */
  function adjustHeight(e: Event): undefined {
    const textarea = e.target as HTMLTextAreaElement;
    if (isAdjustHeight) {
      // 避免输入框内文字较少时发生抖动
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
    // 如果输入框没有字，直接恢复原状
    if (query.length === 0) {
      textarea.style.height = "auto";
    }
  }

  /**
   * 恢复搜索框高度
   * @param {Event} e:Event
   */
  function recoverHeight(e: Event): undefined {
    const textarea = e.target as HTMLTextAreaElement;
    textarea.style.height = "auto";
  }

  /**
   * 处理表单提交事件
   * @param {undefined}
   */
  function submitSearch(): undefined {
    if (query.trim()) {
      goto(`/search?q=${encodeURIComponent(query.trim())}&page_num=1`);
    }
  }
</script>

<div class="w-full relative h-12 mb-2">
  <form
    method="get"
    class="w-full {isAdjustHeight
      ? 'absolute top-0 left-0 right-0 z-50'
      : 'relative'}"
    onsubmit={(e: Event) => {
      e.preventDefault();
      submitSearch();
    }}
  >
    <!-- 搜索图标 -->
    <div class="absolute left-4 top-6 -translate-y-1/2 text-slate-400">
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
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
    </div>
    <textarea
      name="q"
      bind:value={query}
      onfocus={(e: Event) => {
        isFocus = true;
        adjustHeight(e);
      }}
      onblur={(e: Event) => {
        isFocus = false;
        recoverHeight(e);
      }}
      oninput={(e: Event) => {
        adjustHeight(e);
      }}
      onkeydown={(e: KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          submitSearch();
        }
      }}
      placeholder="你想搜什么……"
      rows={isAdjustHeight ? undefined : 1}
      class="
    w-full py-3 pl-12 pr-14
    text-slate-900 resize-none no-scrollbar
    overscroll-auto
    {isAdjustHeight ? 'rounded-2xl' : 'rounded-full'}"
    ></textarea>
  </form>
</div>
