import type { ChatMode, UserSettings } from "./schemas";
import { isDevZProEnabled } from "./schemas";
import type { ChatModeFallbackReason } from "./chatMode";
import {
  getChatModeFallbackToastId,
  showChatModeFallbackToast,
} from "./chatModeToast";

export function handleEffectiveChatModeChunk(
  chunk: {
    effectiveChatMode?: ChatMode;
    chatModeFallbackReason?: ChatModeFallbackReason;
  },
  settings: UserSettings | null | undefined,
  chatId?: number,
): boolean {
  if (!chunk.effectiveChatMode) {
    return false;
  }

  if (chunk.chatModeFallbackReason) {
    showChatModeFallbackToast({
      reason: chunk.chatModeFallbackReason,
      effectiveMode: chunk.effectiveChatMode,
      isPro: settings ? isDevZProEnabled(settings) : false,
      toastId: getChatModeFallbackToastId({
        chatId,
        reason: chunk.chatModeFallbackReason,
        effectiveMode: chunk.effectiveChatMode,
      }),
    });
  }

  return true;
}
