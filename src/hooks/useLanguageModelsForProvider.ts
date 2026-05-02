import { useQuery } from "@tanstack/react-query";
import { ipc, type LanguageModel } from "@/ipc/types";
import { queryKeys } from "@/lib/queryKeys";
import { isIpcUnavailableError } from "@/lib/ipcUtils";

/**
 * Fetches the list of available language models for a specific provider.
 *
 * @param providerId The ID of the language model provider.
 * @returns TanStack Query result object for the language models.
 */
export function useLanguageModelsForProvider(providerId: string | undefined) {
  return useQuery<
    LanguageModel[],
    Error
  >({
    queryKey: queryKeys.languageModels.forProvider({
      providerId: providerId ?? "",
    }),
    queryFn: async () => {
      if (!providerId) {
        return [];
      }
      try {
        return await ipc.languageModel.getModels({ providerId });
      } catch (e) {
        if (isIpcUnavailableError(e)) {
          return [];
        }
        throw e;
      }
    },
    enabled: !!providerId,
  });
}
