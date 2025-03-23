import { sendMessage } from "$lib/messaging";
import { Response } from "$lib/types";
import { removeFormatting, showPopup } from "$lib/utils";
import { GoogleGenAI } from "@google/genai";
import { storage } from "wxt/storage";

export default defineContentScript({
  matches: ["*://*/*"],
  main(ctx) {
    window.addEventListener("load", scanPage);
  },
});

async function scanPage() {
  const apiKey = await storage.getItem("local:api-key");
  const aiClient = new GoogleGenAI({
    apiKey: (await storage.getItem("local:api-key")) ?? "",
  });

  switch (window.location.hostname) {
    case "mail.google.com":
      scanGmail(aiClient);
      break;
    default:
      scanWholePage(aiClient);
  }
  console.log(`${window.location.hostname}`);
}

const mailPrompt = (body: string, details: string) => `
Evaluate this email for signs of phishing, spoofed sender addresses, or fraudulent links. You are anaylzing an email for a user, speak directly to them. Format the response in JSON which follows this typescript type
\`\`\`typescript
interface Indicator {
	message: string;
	type: string; // Readable string for type of indicator
}
type Response = {
	indicators: Indicator[];
	overall: string;
  risk: number; // 0-100
} | null;
\`\`\`
The url to the website is:
${window.location.href}

The following is the details of the email:
${details}

The following is the body of the email:
${body}
`;

const wholeSitePrompt = (body: string, vtResp: any) => `
Analyze this webpage for phishing indicators such as suspicious links, misleading domain names, or deceptive login forms. You are anaylzing the site for a user, speak directly to them. Format the response in JSON which follows this typescript type
\`\`\`typescript
interface Indicator {
	message: string;
	type: string; // Readable string for type of indicator
}
type Response = {
	indicators: Indicator[];
	overall: string;
  risk: number; // 0-100
} | null;
\`\`\`
The url to the website is:
${window.location.href}
Keep the URL in mind, if the url matches the contents, it should not be an indicator.

Here is the body html of the website:
${body}

And here is a response from the virus total api, please take it in mind:
${JSON.stringify(vtResp)}
`;

async function scanWholePage(aiClient: GoogleGenAI) {
  const contents = document.body.innerHTML;
  const encoded = btoa(window.location.hostname);
  const vtKey = await storage.getItem<string>("local:vt-api-key");
  if (vtKey === null || vtKey == "") return;
  const resp = await await sendMessage(
    "fetchVt",
    `https://www.virustotal.com/api/v3/urls/${encoded}`
  );

  const txt = removeFormatting(
    await await sendMessage("fetchAi", wholeSitePrompt(contents, resp))
  );
  const parsed = JSON.parse(txt) as Response;
  if (parsed === null) return;
  if (parsed.risk > 50) await await sendMessage("showPopup", txt);

  console.log(txt);
}

async function scanGmail(aiClient: GoogleGenAI) {
  let lastMailName: string = "-";
  let observer = new MutationObserver(async (mutationList, observer) => {
    for (const mutation of mutationList) {
      for (const node of mutation.addedNodes) {
        const mailName = (
          document.querySelector(".hP") as HTMLHeadingElement | null
        )?.innerText;
        const detailsNode = document.querySelector(".ajB.gt");
        if (mailName === undefined) return;
        if (lastMailName === mailName) {
          lastMailName = mailName;
          return;
        }
        console.log(mailName, lastMailName);
        lastMailName = mailName;

        const emailBody = document.querySelector(".ii.gt")?.innerHTML ?? "";
        const emailDetails = detailsNode?.innerHTML ?? "";
        console.log(emailBody, emailDetails);

        const txt = removeFormatting(
          await await sendMessage(
            "fetchAi",
            mailPrompt(emailBody, emailDetails)
          )
        );
        const parsed = JSON.parse(txt) as Response;
        if (parsed === null) return;
        if (parsed.risk > 50) await await sendMessage("showPopup", txt);

        console.log(txt);
      }
    }
  });
  const parent = document.querySelector(".nH.ao8");
  if (parent)
    observer.observe(parent, {
      childList: true,
      subtree: true,
    });
  else console.log("MEOW");
}
