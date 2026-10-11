import { TestBed } from '@angular/core/testing';
import { OrderStatus } from '../../models/order.model';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  function render(status: OrderStatus) {
    const fixture = TestBed.createComponent(StatusBadge);
    fixture.componentRef.setInput('status', status);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('.badge')!;
  }

  it.each([
    [OrderStatus.Pending, 'Pending', 'pending'],
    [OrderStatus.Completed, 'Completed', 'completed'],
    [OrderStatus.Cancelled, 'Cancelled', 'cancelled'],
    [OrderStatus.Draft, 'Draft', 'draft'],
  ])('shows status %i as "%s" in the %s style', (status, label, tone) => {
    const badge = render(status);
    expect(badge.textContent?.trim()).toBe(label);
    expect(badge.classList.contains(tone)).toBe(true);
  });
});
