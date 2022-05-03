const utcFiscalFirstDay = (year: number) => Date.UTC(year, 4, 1);

function calculateFiscalStartYear(today: Date): Date {
  const presumedStart = new Date(utcFiscalFirstDay(today.getUTCFullYear()));

  if (presumedStart > today) {
    return new Date(utcFiscalFirstDay(today.getUTCFullYear() - 1));
  }

  return presumedStart;
}

export function calculateFiscalYearDateRange(today: Date): [string, string] {
  const fiscalYearStart = calculateFiscalStartYear(today);

  const nextYearStart = utcFiscalFirstDay(fiscalYearStart.getUTCFullYear() + 1);
  const nextFiscalYearStart = new Date(nextYearStart - 1);

  return [fiscalYearStart.toISOString(), nextFiscalYearStart.toISOString()];
}
