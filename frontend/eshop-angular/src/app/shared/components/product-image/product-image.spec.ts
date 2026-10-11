import { TestBed } from '@angular/core/testing';
import { ProductImage, artKindForCategory } from './product-image';

describe('artKindForCategory', () => {
  it('maps the four seeded categories', () => {
    expect(artKindForCategory('Smart Phone')).toBe('phone');
    expect(artKindForCategory('Camera')).toBe('camera');
    expect(artKindForCategory('White Appliances')).toBe('appliance');
    expect(artKindForCategory('Home Kitchen')).toBe('kitchen');
  });

  it('ignores case and surrounding spaces', () => {
    expect(artKindForCategory('  smart phone ')).toBe('phone');
  });

  it('falls back to a generic tile for unknown or missing categories', () => {
    expect(artKindForCategory('Gardening')).toBe('generic');
    expect(artKindForCategory('')).toBe('generic');
    expect(artKindForCategory(null)).toBe('generic');
    expect(artKindForCategory(undefined)).toBe('generic');
  });
});

describe('ProductImage', () => {
  function create(inputs: Record<string, unknown>) {
    const fixture = TestBed.createComponent(ProductImage);
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
    return fixture;
  }

  const el = (f: ReturnType<typeof create>) => f.nativeElement as HTMLElement;

  it('draws the category illustration when there is no src', () => {
    const fixture = create({ category: 'Camera' });
    expect(el(fixture).querySelector('.camera')).toBeTruthy();
    expect(el(fixture).querySelector('img')).toBeNull();
  });

  it('renders an <img> when src is given', () => {
    const fixture = create({ category: 'Camera', src: '/img/a.png', alt: 'Lumix' });
    const img = el(fixture).querySelector('img');
    expect(img?.getAttribute('src')).toBe('/img/a.png');
    expect(img?.getAttribute('alt')).toBe('Lumix');
    expect(el(fixture).querySelector('.camera')).toBeNull();
  });

  it('falls back to the illustration when the image fails to load', () => {
    const fixture = create({ category: 'Smart Phone', src: '/img/missing.png' });
    el(fixture).querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(el(fixture).querySelector('img')).toBeNull();
    expect(el(fixture).querySelector('.phone')).toBeTruthy();
  });

  it('shows the caption only when asked and a file name exists', () => {
    expect(el(create({ category: 'Camera', imageFile: 'product-1.png' })).querySelector('.caption')).toBeNull();

    const withCaption = create({ category: 'Camera', imageFile: 'product-1.png', showCaption: true });
    expect(el(withCaption).querySelector('.caption')?.textContent).toContain('product-1.png');
  });

  it('switches to the grape tone on request', () => {
    expect((create({ category: 'Home Kitchen' }).nativeElement as HTMLElement).classList.contains('tone-grape')).toBe(false);
    expect((create({ category: 'Home Kitchen', tone: 'grape' }).nativeElement as HTMLElement).classList.contains('tone-grape')).toBe(true);
  });

  it('is exposed to assistive tech only when alt text is provided', () => {
    const decorative = create({ category: 'Camera' });
    expect(el(decorative).querySelector('.art')?.getAttribute('aria-hidden')).toBe('true');

    const described = create({ category: 'Camera', alt: 'Panasonic Lumix' });
    expect(el(described).querySelector('.art')?.getAttribute('role')).toBe('img');
    expect(el(described).querySelector('.art')?.getAttribute('aria-label')).toBe('Panasonic Lumix');
  });
});
