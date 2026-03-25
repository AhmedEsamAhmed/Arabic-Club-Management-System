/**
 * Returns ISO week key like "2024-W10" in Malaysia Time (UTC+8).
 */
function getMYTDate(date) {
  return new Date(date.getTime() + 8 * 60 * 60 * 1000);
}

function isoWeekKeyFromMYT(mytDate) {
  const dayOfWeek = mytDate.getUTCDay() || 7; // ISO: Mon=1, Sun=7
  const thursday = new Date(mytDate);
  thursday.setUTCDate(mytDate.getUTCDate() + 4 - dayOfWeek);

  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((thursday - yearStart) / 86400000 + 1) / 7);

  return `${thursday.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

module.exports = { getMYTDate, isoWeekKeyFromMYT };
