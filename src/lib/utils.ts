export async function showPopup(data: string) {
  const params = encodeURIComponent(data);
  const popupURL = browser.runtime.getURL(`/dialog.html?data=${params}`);
  await browser.windows.create({
    url: popupURL,
    type: "popup",
    width: 1000,
    height: 600,
    left: 100,
    top: 100,
  });
}

export function removeFormatting(str: string): string {
  if (str.startsWith("```")) return str.substring(7, str.length - 4);
  else return str;
}
