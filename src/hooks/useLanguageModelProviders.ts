import { useQuery } from "@tanstack/react-query";
import { ipc, type LanguageModelProvider } from "@/ipc/types";
import { useSettings } from "./useSettings";
import { cloudProviders } from "@/lib/schemas";
import { queryKeys } from "@/lib/queryKeys";
import { isProviderSetup as isProviderSetupUtil } from "@/lib/providerUtils";
import { isIpcUnavailableError } from "@/lib/ipcUtils";

export function useLanguageModelProviders() {
  const { settings, envVars } = useSettings();

  const queryResult = useQuery<LanguageModelProvider[], Error>({
    queryKey: queryKeys.languageModels.providers,
    queryFn: async () => {
      try {
        return await ipc.languageModel.getProviders();
      } catch (e) {
        if (isIpcUnavailableError(e)) return [];
        throw e;
      }
    },
  });

  const isProviderSetup = (provider: string) => {
    return isProviderSetupUtil(provider, {
      settings,
      envVars,
      providerData: queryResult.data,
      isLoading: queryResult.isLoading,
    });
  };

  const isAnyProviderSetup = () => {
    if (cloudProviders.some((provider) => isProviderSetup(provider))) {
      return true;
    }
    const customProviders = queryResult.data?.filter(
      (provider) => provider.type === "custom",
    );
    return (
      customProviders?.some((provider) => isProviderSetup(provider.id)) ?? false
    );
  };

  return {
    ...queryResult,
    isProviderSetup,
    isAnyProviderSetup,
  };
}
