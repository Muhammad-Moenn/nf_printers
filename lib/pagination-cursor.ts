export type DateIdCursor = {
  date: Date;
  id: string;
};

const MAX_CURSOR_LENGTH = 200;

export function encodeDateIdCursor(date: Date, id: string): string {
  return `${date.toISOString()}|${id}`;
}

export function decodeDateIdCursor(
  value: string | null | undefined
): DateIdCursor | null {
  if (!value || value.length > MAX_CURSOR_LENGTH) return null;

  const separator = value.indexOf("|");
  if (separator <= 0 || separator === value.length - 1) return null;

  const date = new Date(value.slice(0, separator));
  const id = value.slice(separator + 1);

  if (Number.isNaN(date.getTime()) || !id) return null;

  return { date, id };
}
