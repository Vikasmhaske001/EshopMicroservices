import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/notifications/notification.service';

@Component({
  selector: 'app-account',
  imports: [RouterLink],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account {
  protected readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  protected readonly initial = computed(
    () => this.authService.currentUser()?.userName.charAt(0).toUpperCase() ?? ''
  );
  protected readonly isAdmin = computed(() => this.authService.roles().includes('Admin'));

  logout(): void {
    this.authService.logout();
    this.notifications.info('You have been signed out.');
  }
}
