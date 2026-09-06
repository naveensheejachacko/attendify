const COLLEGE_TZ = "Asia/Kolkata";

export function todayInCollege(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: COLLEGE_TZ }).format(date);
}
