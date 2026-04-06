const ALMATY_TIME_ZONE = 'Asia/Almaty';

export function getTodayInAlmaty(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: ALMATY_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(new Date());
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function getAlmatyTimeZone(): string {
  return ALMATY_TIME_ZONE;
}
