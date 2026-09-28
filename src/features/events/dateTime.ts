/** ISO timestamp (any offset) → value for <input type="datetime-local"> in the viewer's time zone. */
export function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** <input type="datetime-local"> value (viewer's local time) → ISO string with offset for the API. */
export function localInputToIso(value: string): string {
  return new Date(value).toISOString();
}
