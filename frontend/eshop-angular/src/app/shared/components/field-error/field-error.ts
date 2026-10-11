import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';
import { getErrorMessage } from '../../validators/error-messages';

/** Drop-in for <mat-error>: renders the right message for whatever validator failed.
 *  Used as an attribute on mat-error so Material still controls when it shows (touched + invalid).
 *    <mat-error appFieldError [control]="form.controls.zip" label="PIN code" /> */
@Component({
  selector: 'mat-error[appFieldError]',
  template: '{{ message() }}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldError {
  readonly control = input.required<AbstractControl>();
  readonly label = input('This field');
  /** Per-error-key message overrides, e.g. { pattern: 'Use MM/YY format.' }. */
  readonly messages = input<Record<string, string>>({});

  // control.events fires on value/status/touched changes, so the message tracks the control
  // without relying on zone-based change detection.
  private readonly tick = toSignal(
    toObservable(this.control).pipe(switchMap((control) => control.events.pipe(startWith(null))))
  );

  protected readonly message = computed(() => {
    this.tick();
    return getErrorMessage(this.control().errors, this.label(), this.messages());
  });
}
