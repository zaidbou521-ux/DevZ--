import { useEffect, useCallback } from "react";
import { useAtom } from "jotai";
import { userSettingsAtom, envVarsAtom } from "@/atoms/appAtoms";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ipc } from "@/ipc/types";
import { type UserSettings, hasDevZProKey } from "@/lib/schemas";
import { usePostHog } from "posthog-js/react";
import { useAppVersion } from "./useAppVersion";
import { queryKeys } from "@/lib/queryKeys";
import { isIpcUnavailableError } from "@/lib/ipcUtils";

const TELEMETRY_CONSENT_KEY = "dyadTelemetryConsent";
const TELEMETRY_USER_ID_KEY = "dyadTelemetryUserId";
const DYAD_PRO_STATUS_KEY = "dyadProStatus";
const LOCAL_SETTINGS_KEY = "devz_user_settings";

export function isTelemetryOptedIn() {
  return window.localStorage.getItem(TELEMETRY_CONSENT_KEY) === "opted_in";
}

export function getTelemetryUserId(): string | null {
  return window.localStorage.getItem(TELEMETRY_USER_ID_KEY);
}

export function isDyadProUser(): boolean {
  return window.localStorage.getItem(DYAD_PRO_STATUS_KEY) === "true";
}

function loadLocalSettings(): UserSettings | null {
  try {
    const raw = window.localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserSettings;
  } catch {
    return null;
  }
}

function saveLocalSettings(settings: UserSettings): void {
  try {
    window.localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage errors
  }
}

function mergeSettings(
  base: UserSettings | null,
  patch: Partial<UserSettings>,
): UserSettings {
  const merged = { ...(base ?? {}), ...patch } as UserSettings;
  if (patch.providerSettings && base?.providerSettings) {
    merged.providerSettings = {
      ...base.providerSettings,
      ...patch.providerSettings,
    };
  }
  return merged;
}

let isInitialLoad = false;

export function useSettings() {
  const posthog = usePostHog();
  const [, setSettingsAtom] = useAtom(userSettingsAtom);
  const [, setEnvVarsAtom] = useAtom(envVarsAtom);
  const appVersion = useAppVersion();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: queryKeys.settings.user,
    queryFn: async () => {
      try {
        return await ipc.settings.getUserSettings();
      } catch (e) {
        if (isIpcUnavailableError(e)) {
          const local = loadLocalSettings();
          if (local) return local;
          return {} as UserSettings;
        }
        throw e;
      }
    },
  });

  const envVarsQuery = useQuery({
    queryKey: queryKeys.settings.envVars,
    queryFn: async () => {
      try {
        return await ipc.misc.getEnvVars();
      } catch (e) {
        if (isIpcUnavailableError(e)) return {};
        throw e;
      }
    },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      processSettingsForTelemetry(settingsQuery.data);
      const isPro = hasDyadProKey(settingsQuery.data);
      posthog.people.set({ isPro });
      if (!isInitialLoad && appVersion) {
        posthog.capture("app:initial-load", {
          isPro,
          appVersion,
        });
        isInitialLoad = true;
      }
      setSettingsAtom(settingsQuery.data);
    }
  }, [settingsQuery.data, appVersion, posthog, setSettingsAtom]);

  useEffect(() => {
    if (envVarsQuery.data) {
      setEnvVarsAtom(envVarsQuery.data);
    }
  }, [envVarsQuery.data, setEnvVarsAtom]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<UserSettings>) => {
      try {
        return await ipc.settings.setUserSettings(newSettings);
      } catch (e) {
        if (isIpcUnavailableError(e)) {
          const current =
            queryClient.getQueryData<UserSettings>(queryKeys.settings.user) ??
            loadLocalSettings();
          const merged = mergeSettings(current, newSettings);
          saveLocalSettings(merged);
          return merged;
        }
        throw e;
      }
    },
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(queryKeys.settings.user, updatedSettings);
      processSettingsForTelemetry(updatedSettings);
      posthog.people.set({ isPro: hasDyadProKey(updatedSettings) });
      setSettingsAtom(updatedSettings);
    },
    meta: { showErrorToast: true },
  });

  const updateSettings = useCallback(
    async (newSettings: Partial<UserSettings>) => {
      return updateSettingsMutation.mutateAsync(newSettings);
    },
    [updateSettingsMutation],
  );

  const refreshSettings = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.settings.all,
    });
  }, [queryClient]);

  const loading = settingsQuery.isLoading || envVarsQuery.isLoading;
  const error = settingsQuery.error || envVarsQuery.error || null;

  return {
    settings: settingsQuery.data ?? null,
    envVars: envVarsQuery.data ?? {},
    loading,
    error,
    updateSettings,
    refreshSettings,
  };
}

function hasDyadProKey(settings: UserSettings): boolean {
  return hasDevZProKey(settings);
}

function processSettingsForTelemetry(settings: UserSettings) {
  if (settings.telemetryConsent) {
    window.localStorage.setItem(
      TELEMETRY_CONSENT_KEY,
      settings.telemetryConsent,
    );
  } else {
    window.localStorage.removeItem(TELEMETRY_CONSENT_KEY);
  }
  if (settings.telemetryUserId) {
    window.localStorage.setItem(
      TELEMETRY_USER_ID_KEY,
      settings.telemetryUserId,
    );
  } else {
    window.localStorage.removeItem(TELEMETRY_USER_ID_KEY);
  }
  window.localStorage.setItem(
    DYAD_PRO_STATUS_KEY,
    hasDyadProKey(settings) ? "true" : "false",
  );
}
