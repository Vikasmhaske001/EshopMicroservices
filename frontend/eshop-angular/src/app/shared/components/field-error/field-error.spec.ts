import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FieldError } from './field-error';

@Component({
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, FieldError],
  template: `
    <mat-form-field>
      <mat-label>Username</mat-label>
      <input matInput [formControl]="control" />
      <mat-error appFieldError [control]="control" label="Username" />
    </mat-form-field>
  `,
})
class Host {
  control = new FormControl('', [Validators.required, Validators.minLength(3)]);
}

describe('FieldError', () => {
  it('shows the message for the current error once the field is touched', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const read = () => fixture.nativeElement.querySelector('mat-error')?.textContent?.trim() ?? '';
    expect(read()).toBe(''); // pristine: Material hides mat-error

    fixture.componentInstance.control.markAsTouched();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(read()).toBe('Username is required.');

    fixture.componentInstance.control.setValue('ab');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(read()).toBe('Username must be at least 3 characters.');
  });
});
