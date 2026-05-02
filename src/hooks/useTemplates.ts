import { useQuery } from "@tanstack/react-query";
import { ipc } from "@/ipc/types";
import { localTemplatesData, type Template } from "@/shared/templates";
import { queryKeys } from "@/lib/queryKeys";
import { isIpcUnavailableError } from "@/lib/ipcUtils";

export function useTemplates() {
  const query = useQuery({
    queryKey: queryKeys.templates.all,
    queryFn: async (): Promise<Template[]> => {
      try {
        return await ipc.template.getTemplates();
      } catch (e) {
        if (isIpcUnavailableError(e)) return localTemplatesData;
        throw e;
      }
    },
    placeholderData: localTemplatesData,
  });

  return {
    templates: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
