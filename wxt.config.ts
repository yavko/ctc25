import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { icons } from "@lucide/svelte";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-svelte"],
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        $lib: path.resolve("./src/lib"),
      },
    },
  }),
  manifest: {
    permissions: ["storage", "scripting", "activeTab", "downloads", "tabs"],
    host_permissions: ["*://*/*"],
    web_accessible_resources: [
      {
        resources: ["dialog.html"],
        matches: ["*://*/*"],
      },
    ],
    icons: {
      "16": "icon/icon16.png",
      "32": "icon/icon32.png",
      "48": "icon/icon48.png",
      "128": "icon/icon128.png",
    },
  },
});
