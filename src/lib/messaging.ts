import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  fetchAi(prompt: string): Promise<string>;
  fetchVt(url: string): Promise<any>;
  showPopup(data: string): Promise<void>;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
