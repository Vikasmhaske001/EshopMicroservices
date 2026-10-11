import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

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

/** Product picture. The backend only stores an `imageFile` name and has no endpoint that serves
 *  it, so by default this draws the category illustration tile. Pass `src` once a real image URL
 *  exists: it renders an <img> and falls back to the tile if the image fails to load. */
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
  /** Stored file name, e.g. "product-5.png" - only used for the optional caption. */
  readonly imageFile = input<string>('');
  /** Real image URL, when one is available. */
  readonly src = input<string | null>(null);
  /** Accessible description of the product; empty marks the picture as decorative. */
  readonly alt = input<string>('');
  /** Tile background: mango (default) or the soft grape used on the empty-basket panel. */
  readonly tone = input<'mango' | 'grape'>('mango');
  /** Show the small "file name - no image endpoint yet" caption (product details only). */
  readonly showCaption = input(false);

  private readonly failedSrc = signal<string | null>(null);

  protected readonly kind = computed(() => artKindForCategory(this.category()));
  protected readonly showImage = computed(() => !!this.src() && this.failedSrc() !== this.src());
  protected readonly caption = computed(() =>
    this.showCaption() && this.imageFile() ? `${this.imageFile()} · no image endpoint yet` : ''
  );

  protected onImageError(): void {
    this.failedSrc.set(this.src());
  }
}
