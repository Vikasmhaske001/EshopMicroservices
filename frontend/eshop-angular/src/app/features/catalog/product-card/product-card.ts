import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductImage } from '../../../shared/components/product-image/product-image';
import { InrPipe } from '../../../shared/pipes/inr.pipe';
import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, ProductImage, InrPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  product = input.required<Product>();
  /** How many of this product are already in the basket (0 = none). */
  inBasket = input(0);
  /** True while an add request for this card is in flight. */
  adding = input(false);
  add = output<Product>();

  protected readonly category = computed(() => this.product().categories[0] ?? '');
}
