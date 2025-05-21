<script lang="ts">
    import { getCounterState } from "$lib/test/context.svelte";
    const counterState = getCounterState();
</script>

<div class="flex justify-center items-center gap-2 w-fit h-full bg-base-200">
    <button
        type="button"
        class="btn btn-outline btn-info"
        on:click={() => counterState.increment()}
    >
        Increment
    </button>
    <span class="btn btn-outline btn-primary">{counterState.count}</span>
    <button
        type="button"
        class="btn btn-outline btn-error"
        on:click={() => counterState.decrement()}
    >
        Decrement
    </button>
</div>
