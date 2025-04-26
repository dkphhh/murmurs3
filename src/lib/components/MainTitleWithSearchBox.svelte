<script lang="ts">
  import SearchBox from "./SearchBox.svelte";
</script>

<!-- 标题栏 -->
<div class="flex flex-col justify-center items-center mb-2 w-full">
  <!-- 标题 -->
  <h1
    class="text-4xl font-bold mb-2 dark:hover:text-slate-300 hover:text-slate-700"
  >
    <a href="/">Dkphhh's Murmurs</a>
  </h1>
  <!-- 简介 -->
  <p class="text-sm font-thin mb-4">有意义的生活就是置身于永恒风险之中</p>
  <!-- 搜索框 -->
  <SearchBox />
</div>
