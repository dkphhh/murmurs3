<script lang="ts">
  import { onMount } from "svelte";

  type Theme = "light" | "dark" | "system" | null;
  let currentTheme: Theme = $state(null);

  // 设置主题
  function setTheme(theme: Theme) {
    if (theme) {
      let actualThemeToApply: "light" | "dark";
      if (theme === "system") {
        // 系统模式
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          actualThemeToApply = "dark";
        } else {
          actualThemeToApply = "light";
        }
      } else {
        // 白色模式或黑色模式
        actualThemeToApply = theme;
      }

      if (actualThemeToApply === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // 确保设置的主题与 localStorage 中的主题一致
      localStorage.setItem("theme", theme);
      currentTheme = theme;
    } else {
      // 如果没有设置主题，则使用系统模式
      setTheme("system");
    }
  }

  // 组件挂载时初始化
  onMount(() => {
    // 获取用户设置的主题
    const userTheme = localStorage.getItem("theme") as Theme;

    if (userTheme) {
      currentTheme = userTheme;
    } else {
      currentTheme = "system";
    }

    setTheme(currentTheme);
  });
</script>

<div class="z-50 fixed top-2 right-2 bg-slate-400/10 p-1 rounded-lg">
  {#if currentTheme === "light"}
    <!-- 亮色模式按钮 -->
    <button
      onclick={() => setTheme("dark")}
      aria-label="当前：亮色模式，点击切换到暗色模式"
      title="当前：亮色模式，点击切换到暗色模式"
      class="p-1 rounded-md shadow-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
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
          d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
        />
      </svg>
    </button>
  {:else if currentTheme === "dark"}
    <!-- 暗色模式按钮 -->
    <button
      onclick={() => setTheme("system")}
      aria-label="当前：暗色模式，点击切换到系统模式"
      title="当前：暗色模式，点击切换到系统模式"
      class="p-1 rounded-md shadow-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
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
          d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
        />
      </svg>
    </button>
  {:else if currentTheme === "system"}
    <!-- 系统模式按钮 -->
    <button
      onclick={() => setTheme("light")}
      aria-label="当前：系统模式，点击切换到亮色模式"
      title="当前：系统模式，点击切换到亮色模式"
      class="p-1 rounded-md shadow-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
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
          d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
        />
      </svg>
    </button>
  {/if}
</div>
