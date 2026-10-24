import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationControl, buildPageWindow } from './pagination-control';

describe('buildPageWindow', () => {
  it('shows every page when there are seven or fewer', () => {
    expect(buildPageWindow(1, 1)).toEqual([1]);
    expect(buildPageWindow(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('keeps first and last page and gaps in the middle', () => {
    expect(buildPageWindow(10, 20)).toEqual([1, 'gap', 9, 10, 11, 'gap', 20]);
  });

  it('shows a longer run at the start', () => {
    expect(buildPageWindow(1, 20)).toEqual([1, 2, 3, 4, 'gap', 20]);
    expect(buildPageWindow(3, 20)).toEqual([1, 2, 3, 4, 'gap', 20]);
  });

  it('shows a longer run at the end', () => {
    expect(buildPageWindow(20, 20)).toEqual([1, 'gap', 17, 18, 19, 20]);
    expect(buildPageWindow(18, 20)).toEqual([1, 'gap', 17, 18, 19, 20]);
  });

  it('does not add a gap when the skipped range is a single page', () => {
    expect(buildPageWindow(5, 9)).toEqual([1, 'gap', 4, 5, 6, 'gap', 9]);
    expect(buildPageWindow(4, 9)).toEqual([1, 2, 3, 4, 5, 'gap', 9]);
  });
});

describe('PaginationControl', () => {
  let fixture: ComponentFixture<PaginationControl>;
  let emitted: number[];

  const root = () => fixture.nativeElement as HTMLElement;
  const pageButtons = () => [...root().querySelectorAll<HTMLButtonElement>('button.page:not(.arrow)')];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PaginationControl] }).compileComponents();

    fixture = TestBed.createComponent(PaginationControl);
    fixture.componentRef.setInput('pageIndex', 2);
    fixture.componentRef.setInput('totalPages', 5);
    emitted = [];
    fixture.componentInstance.pageChange.subscribe((page) => emitted.push(page));
    fixture.detectChanges();
  });

  it('marks the current page', () => {
    const current = root().querySelector('button.current');
    expect(current?.textContent?.trim()).toBe('2');
    expect(current?.getAttribute('aria-current')).toBe('page');
  });

  it('emits the page that was clicked, but not the current one', () => {
    pageButtons()[3].click();
    pageButtons()[1].click();
    expect(emitted).toEqual([4]);
  });

  it('steps with the arrows', () => {
    root().querySelector<HTMLButtonElement>('button[aria-label="Next page"]')!.click();
    root().querySelector<HTMLButtonElement>('button[aria-label="Previous page"]')!.click();
    expect(emitted).toEqual([3, 1]);
  });

  it('disables the arrows at the ends', () => {
    fixture.componentRef.setInput('pageIndex', 1);
    fixture.detectChanges();
    expect(root().querySelector<HTMLButtonElement>('button[aria-label="Previous page"]')!.disabled).toBe(true);

    fixture.componentRef.setInput('pageIndex', 5);
    fixture.detectChanges();
    expect(root().querySelector<HTMLButtonElement>('button[aria-label="Next page"]')!.disabled).toBe(true);
  });
});
