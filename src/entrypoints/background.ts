import { storage } from "wxt/storage";
import { GoogleGenAI } from "@google/genai";
import { sendMessage, onMessage } from "$lib/messaging";
import { showPopup, removeFormatting } from "$lib/utils";

const downloadPrompt = (vtResp: string) => `
Summarize the response from the virus total api in a user friendly and short way, do not mention anything from the data, interpret it. If the file is not found, or negligible risk return null
Format the response with json according to this typescripe type:
type Response = {
  overall: string; // summary
  risk: number; // 0-100
} | null

${JSON.stringify(vtResp)}
`;

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });
  let windowIsOpen = false;

  onMessage("fetchAi", async (msg) => {
    const apiKey = await storage.getItem("local:api-key");
    const aiClient = new GoogleGenAI({
      apiKey: (await storage.getItem("local:api-key")) ?? "",
    });

    const response = await aiClient.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: msg.data,
    });
    return response.text ?? "null";
  });

  onMessage("fetchVt", async (msg) => {
    const vtKey = (await storage.getItem<string>("local:vt-api-key")) ?? "";

    const res = await fetch(msg.data, {
      method: "GET",
      headers: {
        "x-apikey": vtKey,
        accept: "application/json",
      },
    });
    return await res.json();
  });
  onMessage("showPopup", (data) => showPopup(data.data));

  browser.downloads.onCreated.addListener((delta) => {
    console.log("Download Complete", delta.id, delta);
    fetch(delta.finalUrl || delta.url, {
      method: "GET",
    })
      .then((response) => response.text())
      .then((data) => {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        return crypto.subtle.digest("SHA-256", dataBuffer);
      })
      .then(async (hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        const vtKey = (await storage.getItem<string>("local:vt-api-key")) ?? "";

        return await fetch(
          `https://www.virustotal.com/api/v3/files/${hashHex}`,
          {
            method: "GET",
            headers: {
              "x-apikey": vtKey,
              accept: "application/json",
            },
          }
        );
      })
      .then((res) => {
        const j = res.json();
        console.log(j);
        return j;
      })
      .then(async (res) => {
        const apiKey = await storage.getItem("local:api-key");
        const aiClient = new GoogleGenAI({
          apiKey: (await storage.getItem("local:api-key")) ?? "",
        });
        const response = await aiClient.models.generateContent({
          model: "gemini-2.0-flash-lite",
          contents: downloadPrompt(res),
        });
        console.log(response);
        if (response.text == null) return "null";
        return removeFormatting(response.text);
      })
      .then(async (resp) => {
        if (resp !== null || !windowIsOpen) await showPopup(resp);
        return resp;
      })
      .catch((err) => {
        console.error(err);
      });
  });
});
