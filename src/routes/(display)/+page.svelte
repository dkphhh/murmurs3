<script lang="ts">
  import MurmursContent from "../components/MurmursContent.svelte";
  let { data } = $props();
</script>

<MurmursContent murmurs={data.murmurs} />
