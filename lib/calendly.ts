const CALENDLY_OFFICE =
  process.env.CALENDLY_OFFICE ||
  "https://calendly.com/d/cmh3-gfv-v7j/consultation-with-andrew-richards-esq";

const CALENDLY_VIRTUAL =
  process.env.CALENDLY_VIRTUAL ||
  "https://calendly.com/d/cmgz-pmz-w2s/consultation-with-andrew-richards-esq";

/**
 * March-August → in-office link
 * September-February → virtual link
 */
export function getCalendlyLink(month: number): string {
  if (month >= 3 && month <= 8) {
    return CALENDLY_OFFICE;
  }
  return CALENDLY_VIRTUAL;
}
