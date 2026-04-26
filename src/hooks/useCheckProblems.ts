import { useQuery } from "@tanstack/react-query";
import { ipc, type ProblemReport } from "@/ipc/types";
import { useSettings } from "./useSettings";
import { queryKeys } from "@/lib/queryKeys";
import { DevZError, DevZErrorKind } from "@/errors/devz_error";

export function useCheckProblems(appId: number | null) {
  const { settings } = useSettings();
  const {
    data: problemReport,
    isLoading: isChecking,
    error,
    refetch: checkProblems,
  } = useQuery<ProblemReport, Error>({
    queryKey: queryKeys.problems.byApp({ appId }),
    queryFn: async (): Promise<ProblemReport> => {
      if (!appId) {
        throw new DevZError("App ID is required", DevZErrorKind.Validation);
      }
      return ipc.misc.checkProblems({ appId });
    },
    enabled: !!appId && settings?.enableAutoFixProblems,
    // DO NOT SHOW ERROR TOAST.
  });

  return {
    problemReport,
    isChecking,
    error,
    checkProblems,
  };
}
