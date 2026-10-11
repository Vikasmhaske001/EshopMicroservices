import { AdminNav } from '../../../shared/components/admin-nav/admin-nav';
import { EsInput } from '../../../shared/components/form-field/es-input';
import { FormField } from '../../../shared/components/form-field/form-field';
import { ProductImage } from '../../../shared/components/product-image/product-image';
import { InrPipe } from '../../../shared/pipes/inr.pipe';
import { AppValidators } from '../../../shared/validators/app-validators';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '../../../core/notifications/notification.service';
import { map } from 'rxjs';
import { CatalogService } from '../../catalog/catalog.service';
import { AppError } from '../../../shared/models/app-error.model';
import { Product } from '../../../shared/models/product.model';
import { ErrorBanner } from '../../../shared/components/error-banner/error-banner';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-product-admin',
  imports: [
    ReactiveFormsModule,
    MatProgressBarModule,
    InrPipe,
    AdminNav,
    ErrorBanner,
    EsInput,
    FormField,
    ProductImage,
  ],
  templateUrl: './product-admin.html',
  styleUrl: './product-admin.scss',
})
export class ProductAdmin {
  private readonly catalogService = inject(CatalogService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly editingId = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, AppValidators.notBlank, Validators.maxLength(100)]],
    categories: ['', [Validators.required, AppValidators.notBlank, AppValidators.categoryList]],
    description: ['', [Validators.required, AppValidators.notBlank, Validators.maxLength(1000)]],
    imageFile: ['', [Validators.required, AppValidators.imageFileName]],
    // Catalog.Api requires Price > 0; the upper bound keeps typos (an extra zero) from slipping in.
    price: [
      0,
      [Validators.required, Validators.min(0.01), Validators.max(10000000), AppValidators.maxDecimals(2)],
    ],
  });

  constructor() {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading.set(true);
    // MaxPageSize on the backend is 50 - comfortably covers this catalog's product count.
    this.catalogService.getProducts({ pageSize: 50 }).subscribe({
      next: (result) => {
        this.products.set(result.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  startEdit(product: Product): void {
    this.editingId.set(product.id);
    this.errorMessage.set(null);
    this.form.setValue({
      name: product.name,
      categories: product.categories.join(', '),
      description: product.description,
      imageFile: product.imageFile,
      price: product.price,
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.errorMessage.set(null);
    this.form.reset({ name: '', categories: '', description: '', imageFile: '', price: 0 });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    const payload = {
      name: raw.name,
      categories: raw.categories
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0),
      description: raw.description,
      imageFile: raw.imageFile,
      price: raw.price,
    };

    const editingId = this.editingId();
    // Both branches are normalized to Observable<void> - this component only cares that the
    // write succeeded, and a mixed Observable<string> | Observable<void> union isn't something
    // a single .subscribe() call can be typed against.
    const request = editingId
      ? this.catalogService.updateProduct({ id: editingId, ...payload })
      : this.catalogService.createProduct(payload).pipe(map(() => void 0));

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.notifications.success(
          editingId ? `Updated "${payload.name}".` : `Created "${payload.name}".`
        );
        this.cancelEdit();
        this.loadProducts();
      },
      error: (error: AppError) => {
        this.saving.set(false);
        this.errorMessage.set(error.detail ?? error.title);
      },
    });
  }

  deleteProduct(product: Product): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          title: 'Delete product',
          message: `Delete "${product.name}"? This cannot be undone.`,
          confirmLabel: 'Delete',
          destructive: true,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.catalogService.deleteProduct(product.id).subscribe({
          next: () => {
            this.notifications.success(`Deleted "${product.name}".`);
            this.loadProducts();
          },
          error: () => {},
        });
      });
  }
}
