import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** The - [n] + control shared by the product page (large) and the basket rows (medium). */
@Component({
  selector: 'app-quantity-stepper',
  templateUrl: './quantity-stepper.html',
  styleUrl: './quantity-stepper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuantityStepper {
  value = input.required<number>();
  min = input(1);
  size = input<'md' | 'lg'>('md');
  /** Screen-reader context, e.g. "Quantity of HTC U11+ Plus". */
  label = input('Quantity');
  valueChange = output<number>();

  decrease(): void {
    if (this.value() > this.min()) {
      this.valueChange.emit(this.value() - 1);
    }
  }

  increase(): void {
    this.valueChange.emit(this.value() + 1);
  }
}
