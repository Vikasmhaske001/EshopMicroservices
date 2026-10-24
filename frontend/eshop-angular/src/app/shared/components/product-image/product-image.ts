import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { IMAGE_BASE_URL } from '../../../core/api/api-config';

export type ProductArtKind = 'phone' | 'camera' | 'appliance' | 'kitchen' | 'generic';

// Mapped by category, never by product name. The seed data has quirks (Huawei and Xiaomi are
// under "White Appliances", the LG phone is under "Home Kitchen") - that data is left as it is,
// so those products intentionally show their category's illustration.
const KIND_BY_CATEGORY: Record<string, ProductArtKind> = {
  'smart phone': 'phone',
  camera: 'camera',
  'white appliances': 'appliance',
  'home kitchen': 'kitchen',
};

export function artKindForCategory(category: string | null | undefined): ProductArtKind {
  return KIND_BY_CATEGORY[(category ?? '').trim().toLowerCase()] ?? 'generic';
}

/** Product picture. Given the stored `imageFile` name it shows the photo served by Catalog.Api; if
 *  there is no file name, or the image fails to load, it draws the category illustration tile
 *  instead, so a product never renders blank. An explicit `src` overrides the computed URL. */
@Component({
  selector: 'app-product-image',
  templateUrl: './product-image.html',
  styleUrl: './product-image.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.tone-grape]': "tone() === 'grape'" },
})
export class ProductImage {
  /** Category of the product (first one); picks the illustration. */
  readonly category = input<string | null | undefined>('');
  /** Stored file name, e.g. "htc-u11-plus.jpg". */
  readonly imageFile = input<string | null | undefined>('');
  /** Full image URL; takes precedence over `imageFile`. */
  readonly src = input<string | null>(null);
  /** Accessible description of the product; empty marks the picture as decorative. */
  readonly alt = input<string>('');
  /** Tile background: mango (default) or the soft grape used on the empty-basket panel. */
  readonly tone = input<'mango' | 'grape'>('mango');

  private readonly imageBaseUrl = inject(IMAGE_BASE_URL);
  private readonly failedSrc = signal<string | null>(null);

  protected readonly kind = computed(() => artKindForCategory(this.category()));
  protected readonly resolvedSrc = computed(() => {
    const explicit = this.src();
    if (explicit) {
      return explicit;
    }
    const file = this.imageFile()?.trim();
    return file ? `${this.imageBaseUrl}/${encodeURIComponent(file)}` : null;
  });
  protected readonly showImage = computed(() => !!this.resolvedSrc() && this.failedSrc() !== this.resolvedSrc());

  protected onImageError(): void {
    this.failedSrc.set(this.resolvedSrc());
  }
}
