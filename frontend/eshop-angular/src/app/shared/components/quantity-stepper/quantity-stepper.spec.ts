import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuantityStepper } from './quantity-stepper';

describe('QuantityStepper', () => {
  let fixture: ComponentFixture<QuantityStepper>;
  let emitted: number[];

  const root = () => fixture.nativeElement as HTMLElement;
  const button = (label: string) => root().querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;

  function setup(value: number, extra: Record<string, unknown> = {}) {
    fixture = TestBed.createComponent(QuantityStepper);
    fixture.componentRef.setInput('value', value);
    for (const [key, val] of Object.entries(extra)) {
      fixture.componentRef.setInput(key, val);
    }
    emitted = [];
    fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));
    fixture.detectChanges();
  }

  it('shows the value inside a labelled group', () => {
    setup(3, { label: 'Quantity of Lumix' });
    expect(root().querySelector('.value')?.textContent?.trim()).toBe('3');
    expect(root().querySelector('[role=group]')?.getAttribute('aria-label')).toBe('Quantity of Lumix');
  });

  it('emits value +/- 1', () => {
    setup(3);
    button('Increase quantity').click();
    button('Decrease quantity').click();
    expect(emitted).toEqual([4, 2]);
  });

  it('cannot go below the minimum', () => {
    setup(1);
    expect(button('Decrease quantity').disabled).toBe(true);
    button('Decrease quantity').click();
    expect(emitted).toEqual([]);
  });

  it('honours a custom minimum', () => {
    setup(2, { min: 2 });
    expect(button('Decrease quantity').disabled).toBe(true);
  });

  it('applies the large size', () => {
    setup(1, { size: 'lg' });
    expect(root().querySelector('.stepper')?.classList.contains('lg')).toBe(true);
  });
});
