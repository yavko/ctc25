<script lang="ts">
  import { KeyRound } from "@lucide/svelte";
  import { storage } from "wxt/storage";
  let geminiApiKey: string = $state("");
  let vtApiKey = $state("");
  storage.getItem<string>("local:api-key").then((key) => {
    if (key !== null) geminiApiKey = key;
  });
  storage.getItem<string>("local:vt-api-key").then((key) => {
    if (key !== null) vtApiKey = key;
  });

  $effect(() => {
    if (geminiApiKey !== "") storage.setItem("local:api-key", geminiApiKey);
  });
  $effect(() => {
    if (vtApiKey !== "") storage.setItem("local:vt-api-key", vtApiKey);
  });
</script>

<header>Options:</header>
<main>
  <div>
    <label
      >Gemini Api Key: <input
        type="password"
        bind:value={geminiApiKey}
      /></label
    >
    <br />
    <label
      >Virus Total Api Key: <input
        type="password"
        bind:value={vtApiKey}
      /></label
    >
  </div>
</main>
