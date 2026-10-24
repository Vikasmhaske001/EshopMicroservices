import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let open: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    open = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: MatSnackBar, useValue: { open } }],
    });
    service = TestBed.inject(NotificationService);
  });

  it('applies the kind class, default action and default duration', () => {
    service.success('Saved');
    expect(open).toHaveBeenCalledWith('Saved', 'Dismiss', {
      duration: 4000,
      panelClass: ['toast', 'toast-success'],
      politeness: 'polite',
    });
  });

  it('keeps errors on screen longer and announces them assertively', () => {
    service.error('Boom');
    expect(open).toHaveBeenCalledWith(
      'Boom',
      'Dismiss',
      expect.objectContaining({ duration: 6000, politeness: 'assertive', panelClass: ['toast', 'toast-error'] })
    );
  });

  it('honours a custom action label and duration', () => {
    service.info('Added', { action: 'View Basket', duration: 1000 });
    expect(open).toHaveBeenCalledWith(
      'Added',
      'View Basket',
      expect.objectContaining({ duration: 1000, panelClass: ['toast', 'toast-info'] })
    );
  });

  it('uses the warning style', () => {
    service.warning('Careful');
    expect(open).toHaveBeenCalledWith(
      'Careful',
      'Dismiss',
      expect.objectContaining({ panelClass: ['toast', 'toast-warning'] })
    );
  });
});
