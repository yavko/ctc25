import { mount } from "svelte";
import App from "./Dialog.svelte";

const app = mount(App, {
  target: document.getElementById("app")!,
});

export default app;
