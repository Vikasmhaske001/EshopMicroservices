import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Every validator treats an empty value as valid so it composes with Validators.required -
// "is it filled in" and "is it well-formed" are separate messages.
function matches(pattern: RegExp, errorKey: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }
    return pattern.test(String(value)) ? null : { [errorKey]: true };
  };
}

export const AppValidators = {
  /** Indian PIN code: 6 digits, first digit non-zero. */
  pincode: matches(/^[1-9]\d{5}$/, 'pincode'),

  /** Indian mobile number: 10 digits starting 6-9. */
  phone: matches(/^[6-9]\d{9}$/, 'phone'),

  /** Letters (any script, including combining marks such as Devanagari vowel signs), spaces and
   *  . ' - only - no digits or symbols in a person's name. */
  personName: matches(/^\p{L}[\p{L}\p{M} .'-]*$/u, 'personName'),

  /** Mirrors ASP.NET Identity's default AllowedUserNameCharacters, which Identity.Api uses. */
  username: matches(/^[A-Za-z0-9\-._@+]+$/, 'username'),

  /** Mirrors Identity.Api's policy: needs a lowercase letter and a digit (length is minLength's job). */
  passwordPolicy: (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const text = String(value);
    return /[a-z]/.test(text) && /\d/.test(text) ? null : { passwordPolicy: true };
  },

  /** Rejects whitespace-only input, which Validators.required lets through. */
  notBlank: (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (typeof value !== 'string' || value.length === 0) {
      return null;
    }
    return value.trim().length === 0 ? { blank: true } : null;
  },

  /** Comma-separated list with at least one non-empty entry, each at most 50 characters. */
  categoryList: (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (typeof value !== 'string' || value.trim() === '') {
      return null; // required/notBlank own the empty case
    }
    const items = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    if (items.length === 0) {
      return { categoryList: true };
    }
    return items.some((item) => item.length > 50) ? { categoryItemTooLong: true } : null;
  },

  /** Image file name with a web image extension, no path separators. */
  imageFileName: matches(/^[\w][\w .-]*\.(png|jpe?g|webp|gif|svg)$/i, 'imageFileName'),

  /** At most N decimal places (money is stored with 2). */
  maxDecimals:
    (places: number): ValidatorFn =>
    (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return null;
      }
      const text = String(value);
      const dot = text.indexOf('.');
      return dot !== -1 && text.length - dot - 1 > places ? { maxDecimals: { places } } : null;
    },

  /** MM/YY card expiry that is not in the past (valid through the end of the stated month). */
  cardNotExpired:
    (now: () => Date = () => new Date()): ValidatorFn =>
    (control: AbstractControl): ValidationErrors | null => {
      const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(String(control.value ?? ''));
      if (!match) {
        return null; // format problems are the pattern validator's message
      }
      const month = Number(match[1]);
      const year = 2000 + Number(match[2]);
      const today = now();
      const expired =
        year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth() + 1);
      return expired ? { cardExpired: true } : null;
    },
};
