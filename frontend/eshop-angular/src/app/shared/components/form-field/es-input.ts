import { Directive, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { FormField } from './form-field';

/** Gives an <input> the design's field look (see .es-input in form-field.scss), links it to its
 *  <app-field> label and message, and exposes the invalid state to assistive tech. */
@Directive({
  selector: 'input[esInput], select[esInput], textarea[esInput]',
  host: {
    class: 'es-input',
    '[attr.id]': 'field?.inputId ?? null',
    '[attr.aria-describedby]': 'field?.describedBy() ?? null',
    '[attr.aria-invalid]': 'invalid ? "true" : null',
  },
})
export class EsInput {
  private readonly control = inject(NgControl, { optional: true, self: true });
  protected readonly field = inject(FormField, { optional: true });

  protected get invalid(): boolean {
    return !!this.control && !!this.control.invalid && !!this.control.touched;
  }
}
