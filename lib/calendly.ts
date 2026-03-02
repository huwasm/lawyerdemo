const CALENDLY_OFFICE =
  process.env.CALENDLY_OFFICE ||
  "https://calendly.com/swans-santiago-p/summer-spring";

const CALENDLY_VIRTUAL =
  process.env.CALENDLY_VIRTUAL ||
  "https://calendly.com/swans-santiago-p/winter-autumn";

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
