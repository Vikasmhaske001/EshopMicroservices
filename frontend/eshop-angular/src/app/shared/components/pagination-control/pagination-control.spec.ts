import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationControl } from './pagination-control';

describe('PaginationControl', () => {
  let component: PaginationControl;
  let fixture: ComponentFixture<PaginationControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationControl],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationControl);
    fixture.componentRef.setInput('pageIndex', 1);
    fixture.componentRef.setInput('totalPages', 5);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
