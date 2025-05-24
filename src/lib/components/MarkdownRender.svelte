<script lang="ts">
  import Markdown from "svelte-exmarkdown";
  let {
    markdownText,
  }: {
    markdownText: string;
  } = $props();
</script>

<Markdown md={markdownText}>
  <!-- 1级标题 -->
  {#snippet h1(props)}
    {@const { children, class: className, ...rest } = props}
    <h1 class="{className} text-3xl mt-1 mb-2 font-normal" {...rest}>
      {@render children?.()}
    </h1>
  {/snippet}

  <!-- 2级标题  -->
  {#snippet h2(props)}
    {@const { children, class: className, ...rest } = props}
    <h2 class="{className} text-2xl mt-1" {...rest}>
      {@render children?.()}
    </h2>
  {/snippet}

  <!-- 3级标题 -->
  {#snippet h3(props)}
    {@const { children, class: className, ...rest } = props}
    <h3 class="{className} text-xl mt-1" {...rest}>
      {@render children?.()}
    </h3>
  {/snippet}

  <!-- 正文 -->
  {#snippet p(props)}
    {@const { children, class: className, ...rest } = props}
    <p class="{className} leading-6 mb-2 last:mb-0" {...rest}>
      {@render children?.()}
    </p>
  {/snippet}

  <!-- 链接 -->
  {#snippet a(props)}
    {@const { children, class: className, ...rest } = props}
    <a
      class="{className} text-sky-700 dark:text-sky-300 hover:text-sky-500 decoration-2 underline decoration-dotted underline-offset-4"
      target="_blank"
      rel="noreferrer nofollow"
      {...rest}
    >
      {@render children?.()}
    </a>
  {/snippet}

  <!-- 引用 -->
  {#snippet blockquote(props)}
    {@const { children, class: className, ...rest } = props}
    <blockquote
      class="{className} bg-slate-100
            dark:bg-slate-900 p-4
            mb-1 last:mb-0
            rounded-lg
          "
      {...rest}
    >
      {@render children?.()}
    </blockquote>
  {/snippet}

  <!-- 图片 -->
  {#snippet img()}{/snippet}

  <!-- 无序列表 -->
  {#snippet ul(props)}
    {@const { children, class: className, ...rest } = props}
    <ul class=" pl-8 list-disc {className}" {...rest}>
      {@render children?.()}
    </ul>
  {/snippet}

  <!-- 有序列表 -->
  {#snippet ol(props)}
    {@const { children, class: className, ...rest } = props}
    <ol class=" pl-8 list-decimal {className}" {...rest}>
      {@render children?.()}
    </ol>
  {/snippet}

  <!-- 列表项 -->
  {#snippet li(props)}
    {@const { children, class: className, ...rest } = props}
    <li class="mt-1 {className}" {...rest}>
      {@render children?.()}
    </li>
  {/snippet}

  <!-- 分割线 -->
  {#snippet hr(props)}
    {@const { children, class: className, ...rest } = props}
    <hr class="w-1/2 border-slate-300 dark:border-slate-700 mt-1 {className}" />
  {/snippet}

  <!-- 代码块 -->
  {#snippet code(props)}
    {@const { children, class: className, ...rest } = props}
    <pre
      class="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg mb-1 last:mb-0"
      {...rest}>
      <code class={className}>{@render children?.()}</code>
    </pre>
  {/snippet}
</Markdown>
