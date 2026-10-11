import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { EsInput } from './es-input';
import { FormField } from './form-field';

@Component({
  imports: [ReactiveFormsModule, FormField, EsInput],
  template: `
    <app-field label="Username" hint="3+ characters" [control]="control" [messages]="{ minlength: 'Too short.' }">
      <input esInput [formControl]="control" />
    </app-field>
  `,
})
class Host {
  control = new FormControl('', [Validators.required, Validators.minLength(3)]);
}

describe('FormField', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const settle = async () => {
      await fixture.whenStable();
      fixture.detectChanges();
    };
    return { fixture, root, control: fixture.componentInstance.control, settle };
  }

  it('shows the label and the hint while the field is pristine', () => {
    const { root } = setup();
    expect(root.querySelector('.label')?.textContent?.trim()).toBe('Username');
    expect(root.querySelector('.hint')?.textContent?.trim()).toBe('3+ characters');
    expect(root.querySelector('.error')).toBeNull();
  });

  it('links the label, input and hint by id', () => {
    const { root } = setup();
    const input = root.querySelector('input')!;
    expect(root.querySelector('label')?.getAttribute('for')).toBe(input.id);
    expect(input.id).toMatch(/^es-field-/);
    expect(input.getAttribute('aria-describedby')).toBe(root.querySelector('.hint')?.id);
  });

  it('applies the design input class', () => {
    const { root } = setup();
    expect(root.querySelector('input')?.classList.contains('es-input')).toBe(true);
  });

  it('shows no error until the field has been touched', async () => {
    const { root, control, settle } = setup();
    control.setValue('');
    await settle();
    expect(root.querySelector('.error')).toBeNull();

    control.markAsTouched();
    await settle();
    expect(root.querySelector('.error')?.textContent?.trim()).toBe('Username is required.');
  });

  it('uses message overrides and swaps the hint out for the error', async () => {
    const { root, control, settle } = setup();
    control.setValue('ab');
    control.markAsTouched();
    await settle();
    expect(root.querySelector('.error')?.textContent?.trim()).toBe('Too short.');
    expect(root.querySelector('.hint')).toBeNull();
  });

  it('marks the input aria-invalid only when invalid and touched', async () => {
    const { root, control, settle } = setup();
    const input = root.querySelector('input')!;
    expect(input.getAttribute('aria-invalid')).toBeNull();

    control.markAsTouched();
    await settle();
    expect(input.getAttribute('aria-invalid')).toBe('true');

    control.setValue('valid name');
    await settle();
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });
});
