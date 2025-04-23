<script lang="ts">
  // 表单返回的结果
  let { children } = $props();
</script>

<!-- 外层容器 -->
<div class="h-[90vh] md:h-[80vh] w-full">
  {@render children()}
</div>
