// src/utils/date.js
export const ymdToLocalDate = (ymd) => {
  if (!ymd) return new Date();
  if (typeof ymd === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const dt = ymd?.toDate ? ymd.toDate() : new Date(ymd);
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
};