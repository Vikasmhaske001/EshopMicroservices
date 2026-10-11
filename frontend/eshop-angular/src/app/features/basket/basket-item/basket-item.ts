import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ProductImage } from '../../../shared/components/product-image/product-image';
import { QuantityStepper } from '../../../shared/components/quantity-stepper/quantity-stepper';
import { ShoppingCartItem } from '../../../shared/models/shopping-cart.model';
import { InrPipe } from '../../../shared/pipes/inr.pipe';

/** One basket row. The parent supplies the category (basket lines don't carry one) so the row can
 *  draw the right illustration; an empty category just shows the neutral tile. */
@Component({
  selector: 'app-basket-item',
  imports: [ProductImage, QuantityStepper, InrPipe],
  templateUrl: './basket-item.html',
  styleUrl: './basket-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasketItem {
  item = input.required<ShoppingCartItem>();
  category = input('');
  quantityChange = output<number>();
  remove = output<void>();
}
