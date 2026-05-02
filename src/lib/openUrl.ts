/**
 * Opens a URL either via Electron IPC (desktop) or window.open (web/browser).
 * This is a web-compatible fallback for ipc.system.openExternalUrl.
 */
export function openUrl(url: string): void {
  const electron = (window as any).electron;
  if (electron?.ipcRenderer) {
    electron.ipcRenderer.invoke("open-external-url", url).catch(() => {
      window.open(url, "_blank", "noopener,noreferrer");
    });
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
