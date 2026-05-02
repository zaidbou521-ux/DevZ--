/**
 * Returns true when the error comes from an IPC call in web mode
 * (no Electron renderer available). These errors are expected in web mode
 * and should be treated as "no data" rather than real failures.
 */
export function isIpcUnavailableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes("IPC renderer not available")
  );
}
