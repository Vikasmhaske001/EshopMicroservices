import { FormControl, Validators } from '@angular/forms';
import { AppValidators } from './app-validators';
import { getErrorMessage } from './error-messages';

const ctl = (value: unknown) => new FormControl(value);

describe('AppValidators', () => {
  it('pincode accepts 6 digits not starting with 0', () => {
    expect(AppValidators.pincode(ctl('411001'))).toBeNull();
    expect(AppValidators.pincode(ctl('011001'))).toEqual({ pincode: true });
    expect(AppValidators.pincode(ctl('41100'))).toEqual({ pincode: true });
    expect(AppValidators.pincode(ctl('4110011'))).toEqual({ pincode: true });
    expect(AppValidators.pincode(ctl('41100a'))).toEqual({ pincode: true });
  });

  it('phone accepts 10-digit numbers starting 6-9', () => {
    expect(AppValidators.phone(ctl('9876543210'))).toBeNull();
    expect(AppValidators.phone(ctl('5876543210'))).toEqual({ phone: true });
    expect(AppValidators.phone(ctl('98765'))).toEqual({ phone: true });
  });

  it('personName allows letters, spaces and . \' - but not digits', () => {
    expect(AppValidators.personName(ctl("Anne-Marie O'Neil Jr."))).toBeNull();
    expect(AppValidators.personName(ctl('विकास'))).toBeNull();
    expect(AppValidators.personName(ctl('R2D2'))).toEqual({ personName: true });
    expect(AppValidators.personName(ctl(' leading'))).toEqual({ personName: true });
  });

  it('username mirrors the Identity allowed characters', () => {
    expect(AppValidators.username(ctl('vikas_m-01.x@y+z'))).toBeNull();
    expect(AppValidators.username(ctl('has space'))).toEqual({ username: true });
    expect(AppValidators.username(ctl('emoji😀'))).toEqual({ username: true });
  });

  it('passwordPolicy needs a lowercase letter and a digit', () => {
    expect(AppValidators.passwordPolicy(ctl('abc123'))).toBeNull();
    expect(AppValidators.passwordPolicy(ctl('ABC123'))).toEqual({ passwordPolicy: true });
    expect(AppValidators.passwordPolicy(ctl('abcdef'))).toEqual({ passwordPolicy: true });
  });

  it('notBlank rejects whitespace-only text but ignores empty and non-strings', () => {
    expect(AppValidators.notBlank(ctl('   '))).toEqual({ blank: true });
    expect(AppValidators.notBlank(ctl(' a '))).toBeNull();
    expect(AppValidators.notBlank(ctl(''))).toBeNull();
    expect(AppValidators.notBlank(ctl(5))).toBeNull();
  });

  it('every format validator treats empty as valid so required owns that message', () => {
    for (const validator of [
      AppValidators.pincode,
      AppValidators.phone,
      AppValidators.personName,
      AppValidators.username,
      AppValidators.passwordPolicy,
    ]) {
      expect(validator(ctl(''))).toBeNull();
      expect(validator(ctl(null))).toBeNull();
    }
  });

  describe('categoryList', () => {
    it('accepts one or more comma-separated categories', () => {
      expect(AppValidators.categoryList(ctl('Smart Phone'))).toBeNull();
      expect(AppValidators.categoryList(ctl('Smart Phone, Camera ,'))).toBeNull();
    });

    it('rejects input with no real entries', () => {
      expect(AppValidators.categoryList(ctl(', ,'))).toEqual({ categoryList: true });
    });

    it('rejects an entry over 50 characters', () => {
      expect(AppValidators.categoryList(ctl('x'.repeat(51)))).toEqual({ categoryItemTooLong: true });
    });

    it('leaves empty input to required', () => {
      expect(AppValidators.categoryList(ctl(''))).toBeNull();
    });
  });

  describe('imageFileName', () => {
    it('accepts web image names', () => {
      expect(AppValidators.imageFileName(ctl('product-1.png'))).toBeNull();
      expect(AppValidators.imageFileName(ctl('My Photo.JPEG'))).toBeNull();
    });

    it('rejects paths, missing or non-image extensions', () => {
      expect(AppValidators.imageFileName(ctl('../secret.png'))).toEqual({ imageFileName: true });
      expect(AppValidators.imageFileName(ctl('a/b.png'))).toEqual({ imageFileName: true });
      expect(AppValidators.imageFileName(ctl('photo'))).toEqual({ imageFileName: true });
      expect(AppValidators.imageFileName(ctl('script.exe'))).toEqual({ imageFileName: true });
    });
  });

  describe('maxDecimals', () => {
    const twoPlaces = AppValidators.maxDecimals(2);

    it('allows up to the limit', () => {
      expect(twoPlaces(ctl(10))).toBeNull();
      expect(twoPlaces(ctl(10.5))).toBeNull();
      expect(twoPlaces(ctl(10.55))).toBeNull();
    });

    it('rejects more decimals than allowed', () => {
      expect(twoPlaces(ctl(10.555))).toEqual({ maxDecimals: { places: 2 } });
    });

    it('ignores empty values', () => {
      expect(twoPlaces(ctl(null))).toBeNull();
    });
  });

  describe('cardNotExpired', () => {
    const now = () => new Date(2026, 9, 15); // October 2026
    const validator = AppValidators.cardNotExpired(now);

    it('accepts the current month and later', () => {
      expect(validator(ctl('10/26'))).toBeNull();
      expect(validator(ctl('01/27'))).toBeNull();
    });

    it('rejects past months', () => {
      expect(validator(ctl('09/26'))).toEqual({ cardExpired: true });
      expect(validator(ctl('12/25'))).toEqual({ cardExpired: true });
    });

    it('leaves malformed input to the pattern validator', () => {
      expect(validator(ctl('13/30'))).toBeNull();
      expect(validator(ctl('abc'))).toBeNull();
    });
  });
});

describe('getErrorMessage', () => {
  it('returns an empty string without errors', () => {
    expect(getErrorMessage(null)).toBe('');
  });

  it('reports required before format errors', () => {
    const control = new FormControl('', [Validators.required, Validators.minLength(3)]);
    control.setValue('');
    expect(getErrorMessage(control.errors, 'Username')).toBe('Username is required.');
  });

  it('interpolates lengths and labels', () => {
    const control = new FormControl('ab', Validators.minLength(3));
    expect(getErrorMessage(control.errors, 'Username')).toBe('Username must be at least 3 characters.');
  });

  it('maps custom validator keys to friendly text', () => {
    expect(getErrorMessage({ pincode: true })).toBe('Enter a valid 6-digit PIN code.');
    expect(getErrorMessage({ cardExpired: true })).toBe('This card has expired.');
  });

  it('lets callers override a message', () => {
    expect(getErrorMessage({ pattern: {} }, 'Card', { pattern: 'Enter 13-19 digits.' })).toBe(
      'Enter 13-19 digits.'
    );
  });
});
