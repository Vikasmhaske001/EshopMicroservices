import { Pipe, PipeTransform } from '@angular/core';

// en-IN gives lakh/crore grouping (1,00,000) which the generic `currency` pipe cannot produce.
// Whole-rupee amounts drop the decimals (Rs 79,999), fractional ones keep two (Rs 79,999.50).
const wholeFormat = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const fractionFormat = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

@Pipe({ name: 'inr' })
export class InrPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '';
    }
    return Number.isInteger(value) ? wholeFormat.format(value) : fractionFormat.format(value);
  }
}
