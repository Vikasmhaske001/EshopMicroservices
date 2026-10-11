import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pagination-control',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './pagination-control.html',
  styleUrl: './pagination-control.scss',
})
export class PaginationControl {
  pageIndex = input.required<number>();
  totalPages = input.required<number>();
  pageChange = output<number>();

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
}
