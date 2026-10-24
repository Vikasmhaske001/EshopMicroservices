import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';
import { getErrorMessage } from '../../validators/error-messages';

let nextFieldId = 0;

/** A labelled field in the design's style: label above, input below, error line under that.
 *    <app-field label="PIN code" [control]="form.controls.zipCode">
 *      <input esInput formControlName="zipCode" />
 *    </app-field>
 *  The error shows once the control is invalid and touched, using the shared validator messages. */
@Component({
  selector: 'app-field',
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormField {
  readonly label = input.required<string>();
  readonly control = input.required<AbstractControl>();
  /** Per-error-key message overrides, e.g. { pattern: 'Use MM/YY format.' }. */
  readonly messages = input<Record<string, string>>({});
  /** Helper text shown while there is no error. */
  readonly hint = input('');
  /** Name used inside messages ("{label} is required"); defaults to the visible label. */
  readonly errorLabel = input('');

  // control.events fires on value, status and touched changes, so this re-evaluates without
  // depending on zone-based change detection.
  private readonly tick = toSignal(
    toObservable(this.control).pipe(switchMap((control) => control.events.pipe(startWith(null))))
  );

  /** Ids that tie the label, the projected input and the message together (see EsInput). */
  readonly inputId = `es-field-${nextFieldId++}`;
  readonly messageId = `${this.inputId}-message`;

  protected readonly error = computed(() => {
    this.tick();
    const control = this.control();
    if (!control.invalid || !control.touched) {
      return '';
    }
    return getErrorMessage(control.errors, this.errorLabel() || this.label(), this.messages());
  });

  /** id of the element that describes the input right now (error first, then hint), if any. */
  readonly describedBy = computed(() => (this.error() || this.hint() ? this.messageId : null));
}
