/**
 * Returns a weekKey string like "2024-W10" based on Malaysia Time (UTC+8).
 * Uses ISO week numbering.
 */
export function getWeekKeyMYT(date = new Date()) {
  // Convert to Malaysia Time (UTC+8)
  const myt = new Date(date.getTime() + 8 * 60 * 60 * 1000);

  // Get the ISO week number
  const dayOfWeek = myt.getUTCDay() || 7; // ISO: Mon=1, Sun=7
  const thursday = new Date(myt);
  thursday.setUTCDate(myt.getUTCDate() + 4 - dayOfWeek);

  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((thursday - yearStart) / 86400000 + 1) / 7);

  return `${thursday.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getMYTDate(date = new Date()) {
  return new Date(date.getTime() + 8 * 60 * 60 * 1000);
}
