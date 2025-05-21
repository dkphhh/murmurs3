<script lang="ts">
    import Counter from "./counter.svelte";
    import { setCounterState } from "$lib/test/context.svelte";

    setCounterState()
</script>

<div
    class="flex flex-col justify-center items-center gap-2 w-[90vw] md:w-[60vw] h-full"
>
    <Counter />
    <Counter />
    <Counter />
    <Counter />
    <Counter />
</div>
