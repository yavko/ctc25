<script lang="ts">
  import Issue from "./Issue.svelte";
  import worm from "../../assets/worm-distress.png";

  interface Indicator {
    message: string;
    type: string;
  }

  type Response = {
    overall: string;
    risk: number;
    indicators?: Indicator[];
  } | null;

  const data = new URLSearchParams(window.location.search);

  console.log(decodeURIComponent(data.get("data") ?? "null"));

  const obj = JSON.parse(
    decodeURIComponent(data.get("data") ?? "null")
  ) as Response;
</script>

<main>
  <div class="flex justify-around items-center">
    <img src={worm} alt="a worm" />
    <div class="-ml-16 mt-9">
      <h1 class="text-2xl">Wormy has found a problem!</h1>
      <p>{obj?.overall}</p>
      <ul class="flex gap-3 pr-4">
        {#each obj?.indicators || [] as { type: name, message: description }}
          <Issue {name} {description} />
        {/each}
      </ul>
    </div>
  </div>
</main>
