/**
 * Independent time operation tool to facilitate subsequent switch to dayjs
 */
// import moment from 'moment';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm:ss';
const DATE_FORMAT = 'DD/MM/YYYY ';

export function formatToDateTime(
  date: dayjs.ConfigType = undefined,
  format = DATE_TIME_FORMAT,
): string {
  return dayjs(date).format(format);
}

export function formatToDate(date: dayjs.ConfigType = undefined, format = DATE_FORMAT): string {
  return dayjs(date).format(format);
}

export const dateUtil = dayjs;

export function toDayjsIfDateLike(v: string | Date | any) {
  if (v == null) return undefined;
  if (v && typeof v === 'object' && typeof v.format === 'function') return v;
  if (v instanceof Date) return dayjs(v);
  if (!Number.isNaN(Number(v))) return dayjs(Number(v));
  return dayjs(String(v));
}

export function toIsoIfDayjsLike(v: any) {
  if (v == null) return null;
  if (v && typeof v === 'object' && typeof v.toISOString === 'function') return v.toISOString();
  if (v && typeof v.format === 'function') return v.toISOString ? v.toISOString() : v.format();
  return String(v);
}

export function toIsoIfDateLike(v: any): string | undefined {
  if (v == null) return undefined;
  // Nếu đã là Dayjs
  if ((v as Dayjs)?.toISOString && typeof (v as Dayjs).toISOString === 'function') {
    return (v as Dayjs).toISOString();
  }
  // Nếu là JS Date
  if (v instanceof Date) return v.toISOString();
  // Nếu là string, parse bằng dayjs để chuẩn hoá
  const d = dayjs(v);
  return d.isValid() ? d.toISOString() : undefined;
}

// // Sử dụng
// const iso = toIsoIfDateLike(payload.idIssueDate);
// if (iso) payload.idIssueDate = iso;
// else delete payload.idIssueDate;