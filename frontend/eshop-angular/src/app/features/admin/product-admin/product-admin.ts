import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { map } from 'rxjs';
import { CatalogService } from '../../catalog/catalog.service';
import { AppError } from '../../../shared/models/app-error.model';
import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'app-product-admin',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    CurrencyPipe,
  ],
  templateUrl: './product-admin.html',
  styleUrl: './product-admin.scss',
})
export class ProductAdmin {
  private readonly catalogService = inject(CatalogService);
  private readonly fb = inject(FormBuilder);

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly editingId = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    categories: ['', Validators.required],
    description: ['', Validators.required],
    imageFile: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
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
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }

    this.catalogService.deleteProduct(product.id).subscribe({
      next: () => this.loadProducts(),
      error: () => {},
    });
  }
}
