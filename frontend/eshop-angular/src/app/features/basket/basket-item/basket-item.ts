import { InrPipe } from '../../../shared/pipes/inr.pipe';
import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ShoppingCartItem } from '../../../shared/models/shopping-cart.model';

@Component({
  selector: 'app-basket-item',
  imports: [MatButtonModule, MatIconModule, InrPipe],
  templateUrl: './basket-item.html',
  styleUrl: './basket-item.scss',
})
export class BasketItem {
  item = input.required<ShoppingCartItem>();
  quantityChange = output<number>();
  remove = output<void>();
}
