import { useQuery } from "@tanstack/react-query";
import { ipc } from "@/ipc/types";
import { themesData, type Theme } from "@/shared/themes";
import { queryKeys } from "@/lib/queryKeys";
import { isIpcUnavailableError } from "@/lib/ipcUtils";

export function useThemes() {
  const query = useQuery({
    queryKey: queryKeys.themes.all,
    queryFn: async (): Promise<Theme[]> => {
      try {
        return await ipc.template.getThemes();
      } catch (e) {
        if (isIpcUnavailableError(e)) return themesData;
        throw e;
      }
    },
    placeholderData: themesData,
  });

  return {
    themes: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
