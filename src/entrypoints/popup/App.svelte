<script lang="ts">
  import { Settings } from "@lucide/svelte";
  import worm from "../../assets/worm.png";
</script>

<main class="rounded-xl bg-blue-200 m-1">
  <a
    class="text-slate-950"
    href="/options.html"
    target="_blank"
    rel="noopener noreferrer"><Settings /></a
  >
  <div class="flex justify-between items-center w-[400px]">
    <img src={worm} alt="drawing of a worm" width="200" class="max-w-max" />
    <h1 class="font-black text-md">Wormy is working hard to keep you safe!</h1>
  </div>
</main>
