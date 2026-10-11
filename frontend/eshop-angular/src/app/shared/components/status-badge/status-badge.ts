import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { OrderStatus, getOrderStatusLabel } from '../../models/order.model';

/** Order status as a coloured pill: pending = mango, completed = grape, cancelled = red, draft = grey. */
@Component({
  selector: 'app-status-badge',
  template: '<span class="badge" [class]="tone()">{{ label() }}</span>',
  styleUrl: './status-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadge {
  status = input.required<OrderStatus>();

  protected readonly label = computed(() => getOrderStatusLabel(this.status()));
  protected readonly tone = computed(() => {
    switch (this.status()) {
      case OrderStatus.Completed:
        return 'completed';
      case OrderStatus.Cancelled:
        return 'cancelled';
      case OrderStatus.Pending:
        return 'pending';
      default:
        return 'draft';
    }
  });
}
