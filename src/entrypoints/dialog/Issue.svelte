<script lang="ts">
  const { name, description } = $props();
</script>

<li class="rounded-md bg-blue-200 text-slate-950 p-3 flex-auto basis-0">
  <h2 class="text-center font-semibold text-sm">{name}</h2>
  <p class="text-center">{description}</p>
</li>
