import { useQuery } from "@tanstack/react-query";
import { ipc, type LanguageModelProvider } from "@/ipc/types";
import { useSettings } from "./useSettings";
import { cloudProviders } from "@/lib/schemas";
import { queryKeys } from "@/lib/queryKeys";
import { isProviderSetup as isProviderSetupUtil } from "@/lib/providerUtils";
import { isIpcUnavailableError } from "@/lib/ipcUtils";

const STATIC_FALLBACK_PROVIDERS: LanguageModelProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    hasFreeTier: false,
    websiteUrl: "https://platform.openai.com/api-keys",
    gatewayPrefix: "",
    envVarName: "OPENAI_API_KEY",
    type: "cloud",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    hasFreeTier: false,
    websiteUrl: "https://console.anthropic.com/settings/keys",
    gatewayPrefix: "anthropic/",
    envVarName: "ANTHROPIC_API_KEY",
    type: "cloud",
  },
  {
    id: "google",
    name: "Google",
    hasFreeTier: true,
    websiteUrl: "https://aistudio.google.com/app/apikey",
    gatewayPrefix: "gemini/",
    envVarName: "GEMINI_API_KEY",
    type: "cloud",
  },
  {
    id: "vertex",
    name: "Google Vertex AI",
    hasFreeTier: false,
    websiteUrl: "https://console.cloud.google.com/vertex-ai",
    gatewayPrefix: "gemini/",
    secondary: true,
    type: "cloud",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    hasFreeTier: true,
    websiteUrl: "https://openrouter.ai/settings/keys",
    gatewayPrefix: "openrouter/",
    envVarName: "OPENROUTER_API_KEY",
    type: "cloud",
  },
  {
    id: "auto",
    name: "DevZ",
    websiteUrl: "https://academy.dyad.sh/subscription",
    gatewayPrefix: "dyad/",
    type: "cloud",
  },
  {
    id: "azure",
    name: "Azure OpenAI",
    hasFreeTier: false,
    websiteUrl: "https://portal.azure.com/",
    gatewayPrefix: "",
    secondary: true,
    envVarName: "AZURE_API_KEY",
    type: "cloud",
  },
  {
    id: "xai",
    name: "xAI",
    hasFreeTier: false,
    websiteUrl: "https://console.x.ai/",
    gatewayPrefix: "xai/",
    secondary: true,
    envVarName: "XAI_API_KEY",
    type: "cloud",
  },
  {
    id: "bedrock",
    name: "AWS Bedrock",
    hasFreeTier: false,
    websiteUrl: "https://console.aws.amazon.com/bedrock/",
    gatewayPrefix: "bedrock/",
    secondary: true,
    envVarName: "AWS_BEARER_TOKEN_BEDROCK",
    type: "cloud",
  },
  {
    id: "minimax",
    name: "MiniMax",
    hasFreeTier: false,
    websiteUrl: "https://platform.minimax.io/",
    gatewayPrefix: "minimax/",
    secondary: true,
    envVarName: "MINIMAX_API_KEY",
    type: "cloud",
  },
  {
    id: "ollama",
    name: "Ollama",
    hasFreeTier: true,
    type: "local",
  },
  {
    id: "lmstudio",
    name: "LM Studio",
    hasFreeTier: true,
    type: "local",
  },
];

export function useLanguageModelProviders() {
  const { settings, envVars } = useSettings();

  const queryResult = useQuery<LanguageModelProvider[], Error>({
    queryKey: queryKeys.languageModels.providers,
    queryFn: async () => {
      try {
        return await ipc.languageModel.getProviders();
      } catch (e) {
        if (isIpcUnavailableError(e)) return STATIC_FALLBACK_PROVIDERS;
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
