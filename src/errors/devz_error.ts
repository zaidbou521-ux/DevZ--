/**
 * Classified application errors for IPC/main-process code.
 * Use {@link DevZError} with a {@link DevZErrorKind} so telemetry can ignore
 * high-volume, non-actionable failures (see `shouldFilterTelemetryException`).
 */

export enum DevZErrorKind {
  Validation = "validation",
  NotFound = "not_found",
  Auth = "auth",
  Precondition = "precondition",
  Conflict = "conflict",
  UserCancelled = "user_cancelled",
  RateLimited = "rate_limited",
  /** Upstream failures; reported to PostHog by default unless you add finer metadata later. */
  External = "external",
  /** Bugs, invariant violations, unexpected failures — always reported. */
  Internal = "internal",
  /** Unclassified; treated as reportable until call sites are migrated. */
  Unknown = "unknown",
}

const TELEMETRY_FILTERED_KINDS: ReadonlySet<DevZErrorKind> = new Set([
  DevZErrorKind.Validation,
  DevZErrorKind.NotFound,
  DevZErrorKind.Auth,
  DevZErrorKind.Precondition,
  DevZErrorKind.Conflict,
  DevZErrorKind.UserCancelled,
  DevZErrorKind.RateLimited,
]);

/**
 * Returns true if this kind should not be sent to PostHog as an `$exception` event.
 */
export function isDevZErrorKindFilteredFromTelemetry(
  kind: DevZErrorKind,
): boolean {
  return TELEMETRY_FILTERED_KINDS.has(kind);
}

export class DevZError extends Error {
  readonly kind: DevZErrorKind;

  constructor(message: string, kind: DevZErrorKind) {
    super(message);
    this.name = "DevZError";
    this.kind = kind;
  }
}

export function isDevZError(error: unknown): error is DevZError {
  return error instanceof DevZError;
}
