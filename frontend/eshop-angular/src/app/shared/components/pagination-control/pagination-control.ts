import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type PageItem = number | 'gap';

/** Page numbers to show: always first and last, the current page with one neighbour either side,
 *  and a "gap" wherever pages are skipped. Seven or fewer pages are all shown. */
export function buildPageWindow(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  // Near either end, show a longer run so the control keeps a steady width.
  if (current <= 3) {
    [2, 3, 4].forEach((p) => pages.add(p));
  }
  if (current >= total - 2) {
    [total - 3, total - 2, total - 1].forEach((p) => pages.add(p));
  }

  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const items: PageItem[] = [];
  sorted.forEach((page, index) => {
    if (index > 0) {
      const skipped = page - sorted[index - 1] - 1;
      // A "..." that hides a single page is pointless - show the page itself.
      if (skipped === 1) {
        items.push(page - 1);
      } else if (skipped > 1) {
        items.push('gap');
      }
    }
    items.push(page);
  });
  return items;
}

@Component({
  selector: 'app-pagination-control',
  templateUrl: './pagination-control.html',
  styleUrl: './pagination-control.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationControl {
  pageIndex = input.required<number>();
  totalPages = input.required<number>();
  pageChange = output<number>();

  protected readonly pages = computed(() => buildPageWindow(this.pageIndex(), Math.max(1, this.totalPages())));

  previous(): void {
    if (this.pageIndex() > 1) {
      this.pageChange.emit(this.pageIndex() - 1);
    }
  }

  next(): void {
    if (this.pageIndex() < this.totalPages()) {
      this.pageChange.emit(this.pageIndex() + 1);
    }
  }

  goTo(page: number): void {
    if (page !== this.pageIndex()) {
      this.pageChange.emit(page);
    }
  }
}
