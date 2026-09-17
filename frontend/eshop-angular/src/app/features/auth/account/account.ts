import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-account',
  imports: [MatButtonModule],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account {
  protected readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
