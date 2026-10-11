import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CatalogLookup } from './catalog-lookup.service';

describe('CatalogLookup', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    return { lookup: TestBed.inject(CatalogLookup), http: TestBed.inject(HttpTestingController) };
  }

  const product = (id: string, categories: string[], imageFile: string) => ({
    id,
    name: `Product ${id}`,
    categories,
    description: '',
    imageFile,
    price: 10,
  });

  it('maps product ids to their first category and picture file', () => {
    const { lookup, http } = setup();
    http.expectOne((r) => r.url.endsWith('/catalog-service/products')).flush({
      products: {
        pageIndex: 1,
        pageSize: 50,
        count: 2,
        totalPages: 1,
        data: [product('a', ['Camera', 'Gadgets'], 'a.jpg'), product('b', [], 'b.jpg')],
      },
    });

    expect(lookup.categoryById().get('a')).toBe('Camera');
    expect(lookup.imageFileById().get('a')).toBe('a.jpg');
    // A product without categories still resolves, with an empty category.
    expect(lookup.categoryById().get('b')).toBe('');
    expect(lookup.imageFileById().get('b')).toBe('b.jpg');
    http.verify();
  });

  it('stays empty when the catalog request fails', () => {
    const { lookup, http } = setup();
    http.expectOne((r) => r.url.endsWith('/catalog-service/products')).flush('boom', {
      status: 500,
      statusText: 'Server Error',
    });

    expect(lookup.categoryById().size).toBe(0);
    expect(lookup.imageFileById().size).toBe(0);
    http.verify();
  });
});
