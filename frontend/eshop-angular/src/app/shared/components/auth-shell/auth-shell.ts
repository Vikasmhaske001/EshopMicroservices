import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The split sign-in / register card: brand panel on the left, the form (projected) on the right.
 *  The brand panel is hidden below 900px. */
@Component({
  selector: 'app-auth-shell',
  templateUrl: './auth-shell.html',
  styleUrl: './auth-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthShell {
  /** Big headline on the brand panel, e.g. "Your basket is waiting." */
  headline = input.required<string>();
  /** Supporting sentence under the headline. */
  blurb = input('');
}
