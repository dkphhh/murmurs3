<script lang="ts">
  // TODO：重新梳理color mode 的逻辑
  // TODO：目前会有闪烁的情况出现
  // TODO：在窄屏上，其他按钮会被color mode button挡住

  import { onMount } from "svelte";

  type Theme = "light" | "dark" | "system";

  let currentTheme: Theme;

  // 确保正确检测系统主题
  function detectSystemTheme(): "light" | "dark" {
    // 明确返回检测结果，不要有模糊逻辑
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  // 初始化主题
  function initTheme(): void {
    const savedTheme = localStorage.theme;
    const isThemeStored = "theme" in localStorage;
    const systemTheme = detectSystemTheme();

    if (isThemeStored) {
      // 如果用户明确选择了主题，应用保存的主题
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // 如果用户未选择主题，应用系统主题
      document.documentElement.classList.toggle("dark", systemTheme === "dark");
    }
  }

  // 获取当前主题 - 反映实际状态
  function getTheme(): "light" | "dark" | "system" {
    if ("theme" in localStorage) {
      return localStorage.theme === "dark" ? "dark" : "light";
    } else {
      return "system";
    }
  }

  // 检查实际应用的主题 - 与 DOM 状态同步
  function getAppliedTheme(): "light" | "dark" {
    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  }

  // 设置主题 - 确保同步状态和视觉效果
  function setTheme(theme: "light" | "dark" | "system"): void {
    const systemTheme = detectSystemTheme();

    console.log("设置主题:", theme);
    console.log("系统主题:", systemTheme);

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    } else if (theme === "system") {
      // 应用系统主题
      document.documentElement.classList.toggle("dark", systemTheme === "dark");
      localStorage.removeItem("theme");
    }

    currentTheme = theme;

    // 调试信息
    console.log("应用后主题:", getAppliedTheme());
    console.log("保存的偏好:", localStorage.theme || "系统默认");
  }

  // 组件挂载时初始化
  onMount(() => {
    // 确保先获取实际状态再设置界面状态
    const actualTheme = getTheme();
    const appliedTheme = getAppliedTheme();

    // 如果显示状态与实际应用的主题不一致，纠正应用的主题
    if (actualTheme === "system") {
      const systemTheme = detectSystemTheme();

      if (
        (systemTheme === "dark" && appliedTheme === "light") ||
        (systemTheme === "light" && appliedTheme === "dark")
      ) {
        // 纠正应用的主题与系统主题一致
        document.documentElement.classList.toggle(
          "dark",
          systemTheme === "dark"
        );
        console.log("已纠正应用主题与系统一致");
      }
    }

    // 设置显示状态
    currentTheme = actualTheme;

    // 监听系统主题变化
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleMediaChange = (e: MediaQueryListEvent): void => {
      console.log("系统主题变化:", e.matches ? "dark" : "light");

      if (!("theme" in localStorage)) {
        document.documentElement.classList.toggle("dark", e.matches);

        // 确保状态也更新
        if (currentTheme === "system") {
          console.log("更新界面状态 - 仍为系统主题");
        }
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  });
</script>

<div
  class="z-100 fixed top-1 right-1 flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg"
>
  <!-- 白色模式按钮 -->
  <button
    onclick={() => setTheme("light")}
    aria-label="light mode"
    class={`p-1 rounded-md ${currentTheme === "light" ? "bg-white text-black shadow-md" : "text-gray-500 dark:text-gray-400"}`}
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

  <!-- 系统模式按钮 -->
  <button
    onclick={() => setTheme("system")}
    aria-label="system mode"
    class={`p-1 rounded-md ${currentTheme === "system" ? "bg-white text-black shadow-md dark:bg-gray-700 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
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

  <!-- 黑色模式按钮 -->
  <button
    onclick={() => setTheme("dark")}
    aria-label="dark mode"
    class={`p-1 rounded-md ${currentTheme === "dark" ? "bg-gray-700 text-white shadow-md" : "text-gray-500 dark:text-gray-400"}`}
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
</div>
