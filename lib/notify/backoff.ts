/**
 * Minutes before the next try, after this many failed attempts: 2, 4, 8, 16, 32.
 * The database stops at 6 attempts (record_notification_failure).
 */
export function retryDelayMinutes(attempts: number) {
  return 2 ** attempts;
}
