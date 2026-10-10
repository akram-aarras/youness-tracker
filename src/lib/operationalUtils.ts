/**
 * Moroccan phone number utilities
 */

/**
 * Normalizes a Moroccan phone number to international format (212XXXXXXXXX).
 * Returns an empty string if phone is null, undefined, or empty/whitespace.
 */
export function cleanMoroccanPhoneNumber(phone?: string | null): string {
  if (!phone || typeof phone !== 'string' || phone.trim() === '') return '';
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('0')) {
    cleaned = '212' + cleaned.slice(1);
  } else if (!cleaned.startsWith('212')) {
    cleaned = '212' + cleaned;
  }
  return cleaned;
}

/**
 * Validates Moroccan mobile and landline phone numbers.
 * Returns true if phone is empty or whitespace (phone is optional).
 * Only validates format regex when a non-empty string is provided.
 */
export function isValidMoroccanPhone(phone?: string | null): boolean {
  if (!phone || typeof phone !== 'string' || phone.trim() === '') return true;
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  return /^(?:(?:0[567]\d{8})|(?:212[567]\d{8}))$/.test(cleaned);
}
