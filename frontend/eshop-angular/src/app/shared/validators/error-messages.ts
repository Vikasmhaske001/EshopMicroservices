import { ValidationErrors } from '@angular/forms';

/** First error wins; "required"/"blank" are reported before format errors. */
const PRIORITY = ['required', 'blank'];

export function getErrorMessage(
  errors: ValidationErrors | null,
  label = 'This field',
  overrides: Record<string, string> = {}
): string {
  if (!errors) {
    return '';
  }
  const keys = Object.keys(errors);
  const key = PRIORITY.find((k) => keys.includes(k)) ?? keys[0];
  if (!key) {
    return '';
  }
  if (overrides[key]) {
    return overrides[key];
  }
  const detail = errors[key];

  switch (key) {
    case 'required':
      return `${label} is required.`;
    case 'blank':
      return `${label} cannot be blank.`;
    case 'minlength':
      return `${label} must be at least ${detail.requiredLength} characters.`;
    case 'maxlength':
      return `${label} must be at most ${detail.requiredLength} characters.`;
    case 'min':
      return `${label} must be at least ${detail.min}.`;
    case 'max':
      return `${label} must be at most ${detail.max}.`;
    case 'email':
      return 'Enter a valid email address.';
    case 'pincode':
      return 'Enter a valid 6-digit PIN code.';
    case 'phone':
      return 'Enter a valid 10-digit mobile number.';
    case 'personName':
      return `${label} can only contain letters, spaces and . ' -`;
    case 'username':
      return 'Use only letters, numbers and - . _ @ +';
    case 'passwordPolicy':
      return 'Include a lowercase letter and a number.';
    case 'cardExpired':
      return 'This card has expired.';
    case 'pattern':
      return `${label} is not in the expected format.`;
    default:
      return `${label} is invalid.`;
  }
}
