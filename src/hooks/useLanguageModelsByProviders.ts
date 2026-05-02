import { useQuery } from "@tanstack/react-query";
import { ipc, type LanguageModel } from "@/ipc/types";
import { queryKeys } from "@/lib/queryKeys";
import { isIpcUnavailableError } from "@/lib/ipcUtils";

export function useLanguageModelsByProviders() {
  return useQuery<Record<string, LanguageModel[]>, Error>({
    queryKey: queryKeys.languageModels.byProviders,
    queryFn: async () => {
      try {
        return await ipc.languageModel.getModelsByProviders();
      } catch (e) {
        if (isIpcUnavailableError(e)) return {};
        throw e;
      }
    },
  });
}
