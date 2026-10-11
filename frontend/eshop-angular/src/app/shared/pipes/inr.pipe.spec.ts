import { InrPipe } from './inr.pipe';

describe('InrPipe', () => {
  const pipe = new InrPipe();
  // Intl may use a non-breaking space; normalise so assertions stay readable.
  const fmt = (v: number | null | undefined) => pipe.transform(v).replace(/\s/g, '');

  it('formats whole rupees without decimals', () => {
    expect(fmt(79999)).toBe('₹79,999');
  });

  it('uses lakh grouping', () => {
    expect(fmt(100000)).toBe('₹1,00,000');
    expect(fmt(12345678)).toBe('₹1,23,45,678');
  });

  it('keeps two decimals for fractional amounts', () => {
    expect(fmt(79999.5)).toBe('₹79,999.50');
  });

  it('formats zero', () => {
    expect(fmt(0)).toBe('₹0');
  });

  it('returns an empty string for null, undefined and NaN', () => {
    expect(fmt(null)).toBe('');
    expect(fmt(undefined)).toBe('');
    expect(fmt(Number.NaN)).toBe('');
  });
});
