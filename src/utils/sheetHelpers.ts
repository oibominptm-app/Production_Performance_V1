/**
 * Extracts a bare Google Spreadsheet ID from any supported input format:
 *   - Full edit/view URL   https://docs.google.com/spreadsheets/d/<ID>/edit
 *   - Sharing URL          https://docs.google.com/spreadsheets/d/<ID>/pub
 *   - Mobile short-URL     https://docs.google.com/spreadsheets/d/<ID>
 *   - URL with query/hash  .../<ID>/edit?usp=sharing#gid=0
 *   - Bare Spreadsheet ID  1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OdiFi2ow
 *
 * Returns the extracted ID, or an empty string if nothing recognisable was found.
 */
export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Try to pull the ID out of any Google Sheets URL regardless of path suffix
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (urlMatch) return urlMatch[1];

  // If the input looks like a bare spreadsheet ID (alphanumeric + _ -)
  // accept it directly; Google IDs are typically 44 chars but we keep the
  // check loose to avoid breaking shortened or custom IDs.
  if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) return trimmed;

  return '';
}
