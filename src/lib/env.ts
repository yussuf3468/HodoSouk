/** Build-time flags, read once. */

/** Show "pending content" markers. Always on in development. */
export const showPlaceholders =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_PLACEHOLDERS === 'true';

/**
 * Where the enquiry forms POST. Empty means "not connected" — the forms then
 * tell visitors plainly that messages are not yet delivered.
 */
export const enquiryEndpoint: string | null =
  (import.meta.env.VITE_ENQUIRY_ENDPOINT ?? '').trim() || null;
