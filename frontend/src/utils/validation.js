export const PASSWORD_RULE_TEXT = 'Password must be at least 8 characters and include uppercase, lowercase, and a number.';

export function validatePassword(password) {
  return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
}

export function validateDateRange(startDate, endDate, label = 'End date') {
  if (!startDate || !endDate) {
    return 'Start and end dates are required.';
  }

  if (new Date(endDate) <= new Date(startDate)) {
    return `${label} must be after start date.`;
  }

  return null;
}

export function validateDateInsideRange(date, minDate, maxDate, label = 'Date') {
  if (!date || !minDate || !maxDate) return null;

  const current = new Date(date);
  if (current < new Date(minDate) || current > new Date(maxDate)) {
    return `${label} must be inside the travel dates.`;
  }

  return null;
}

export function validateDateRangeInsideTrip(startDate, endDate, minDate, maxDate, label = 'Date range') {
  const rangeError = validateDateRange(startDate, endDate, `${label} end date`);
  if (rangeError) return rangeError;

  return validateDateInsideRange(startDate, minDate, maxDate, `${label} start date`) ||
    validateDateInsideRange(endDate, minDate, maxDate, `${label} end date`);
}

export function validateNonNegativeNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    return `${label} cannot be negative.`;
  }

  return null;
}

export function validatePositiveNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    return `${label} must be greater than 0.`;
  }

  return null;
}
