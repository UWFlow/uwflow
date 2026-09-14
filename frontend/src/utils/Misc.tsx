import moment, { Moment } from 'moment/moment';

export const millisecondsPerDay = 1000 * 60 * 60 * 24;

export const termCodeToDate = (code: number): string => {
  const monthInt = code % 10;
  const year = 1900 + Math.floor(code / 10);
  const month = monthInt === 1 ? 'Winter' : monthInt === 5 ? 'Spring' : 'Fall';
  return `${month} ${year}`;
};

export const COURSE_CODE_REGEX = /[a-zA-Z]{2,}[0-9]+[a-zA-Z]*/gi;

export const splitCourseCode = (code: string): [string, string] => {
  if (!code || code === '') {
    return ['', ''];
  }

  let codeLetters = '';
  let i = 0;
  while (
    i < code.length &&
    code[i].toUpperCase() >= 'A' &&
    code[i].toUpperCase() <= 'Z'
  ) {
    codeLetters += code[i].toUpperCase();
    i += 1;
  }

  return [codeLetters, code.slice(i)];
};

export const formatCourseCode = (code: string): string => {
  if (!code || code === '') {
    return code;
  }

  return splitCourseCode(code).join(' ').toUpperCase();
};

export const processRating = (rating: number): string => {
  return rating !== null ? `${Math.round(rating * 100)}%` : 'N/A';
};

export const isCurrentTerm = (termCode: number): boolean => {
  const curDate = new Date();
  const curMonth = curDate.getMonth();
  const curYear = curDate.getFullYear();

  const monthInt = termCode % 10;
  const year = 1900 + Math.floor(termCode / 10);

  if (Number(curYear) !== Number(year)) {
    return false;
  }

  switch (monthInt) {
    case 1:
      return curMonth >= 1 && curMonth <= 4;
    case 5:
      return curMonth >= 5 && curMonth <= 8;
    case 9:
      return curMonth >= 9 && curMonth <= 12;
    default:
      return false;
  }
};

export const getCurrentTermCode = (): number => {
  const curDate = new Date();
  const curYear = curDate.getFullYear();
  const curMonth = curDate.getMonth();
  const monthInt =
    curMonth >= 0 && curMonth <= 3 ? 1 : curMonth >= 4 && curMonth <= 7 ? 5 : 9;
  return (curYear - 1900) * 10 + monthInt;
};

export const getNextTermCode = (): number => {
  const currentTerm = getCurrentTermCode();
  return currentTerm % 10 === 1 || currentTerm % 10 === 5
    ? currentTerm + 4
    : currentTerm + 2;
};

export const monthDayToText = (day: number): string => {
  let postfix;
  switch (day % 10) {
    case 1:
      postfix = 'th';
      break;
    case 2:
      postfix = 'nd';
      break;
    case 3:
      postfix = 'rd';
      break;
    default:
      postfix = 'th';
  }

  return `${day}${postfix}`;
};

export const processDateString = (dateString: string): string => {
  const date = moment(dateString, 'YYYY-MM-DD');
  const formattedDate = `${date.format('dddd')}, ${date.format('MMM Do')}`;
  return formattedDate;
};

export const secsToTime = (secs: number): string => {
  const t = Math.floor(secs / 3600) % 12;
  const h = t === 0 ? 12 : t;
  const m = Math.floor((secs % 3600) / 60) % 60;
  return `${h}:${m}${m === 0 ? 0 : ''} ${secs >= 3600 * 12 ? 'PM' : 'AM'}`;
};

export const getDateWithSeconds = (
  date: string,
  secs?: number | null,
): Moment => {
  return moment(`${date}`, 'YYYY-MM-DD').startOf('day').add(secs, 'seconds');
};

// do not change the order of this, the calendar uses the index numbers
export const weekDayLetters = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];

// work with moment objects
export const isTimeRangeInside = (
  inStart: Moment,
  inEnd: Moment,
  outStart: Moment,
  outEnd: Moment,
): boolean => {
  return inStart.isAfter(outStart, 'minute') && outEnd.isAfter(inEnd, 'minute');
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
