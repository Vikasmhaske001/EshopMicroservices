import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { OrderAdmin } from './order-admin';

describe('OrderAdmin', () => {
  let component: OrderAdmin;
  let fixture: ComponentFixture<OrderAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderAdmin],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
