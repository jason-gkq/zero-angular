import parse from 'date-fns/parse';
import toDate from 'date-fns/toDate';
import startOfWeek from 'date-fns/startOfWeek';
import endOfWeek from 'date-fns/endOfWeek';
import subWeeks from 'date-fns/subWeeks';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';
import subMonths from 'date-fns/subMonths';
import startOfYear from 'date-fns/startOfYear';
import endOfYear from 'date-fns/endOfYear';
import subYears from 'date-fns/subYears';
import addDays from 'date-fns/addDays';

/**
 * 获取时间范围
 * @param type 类型，带 `-` 表示过去一个时间，若指定 `number` 表示天数
 * @param time 开始时间
 */
export function getTimeDistance(
  type:
    | 'today'
    | '-today'
    | 'week'
    | '-week'
    | 'month'
    | '-month'
    | 'year'
    | '-year'
    | number,
  time?: Date | number,
): [Date, Date] {
  time = toDate(time || new Date());

  switch (type) {
    case 'today':
    case '-today':
      return [time, time];
    case 'week':
      return [startOfWeek(time), endOfWeek(time)];
    case '-week':
      return [startOfWeek(subWeeks(time, 1)), endOfWeek(subWeeks(time, 1))];
    case 'month':
      return [startOfMonth(time), endOfMonth(time)];
    case '-month':
      return [startOfMonth(subMonths(time, 1)), endOfMonth(subMonths(time, 1))];
    case 'year':
      return [startOfYear(time), endOfYear(time)];
    case '-year':
      return [startOfYear(subYears(time, 1)), endOfYear(subYears(time, 1))];
    default:
      return type > 0
        ? [time, addDays(time, type)]
        : [addDays(time, type), time];
  }
}
