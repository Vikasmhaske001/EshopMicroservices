import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { IMAGE_BASE_URL } from '../../core/api/api-config';
import { ImageCredit, ImageCredits } from './image-credits.service';

const CREDITS_URL = 'http://localhost:6004/catalog-service/images/products/credits.json';

describe('ImageCredits', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    return {
      service: TestBed.inject(ImageCredits),
      http: TestBed.inject(HttpTestingController),
    };
  }

  it('reads credits.json from the image folder', () => {
    const { service, http } = setup();
    expect(TestBed.inject(IMAGE_BASE_URL)).toBe('http://localhost:6004/catalog-service/images/products');

    const credit: ImageCredit = {
      title: 'LG G7 ThinQ.jpg',
      author: 'LG Electronics',
      license: 'CC BY 2.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
      source: 'https://commons.wikimedia.org/wiki/File:LG_G7_ThinQ.jpg',
      note: 'LG G7 ThinQ.',
    };
    http.expectOne(CREDITS_URL).flush({ 'lg-g7-thinq.jpg': credit });

    expect(service.credits()['lg-g7-thinq.jpg']).toEqual(credit);
    http.verify();
  });

  it('treats a missing credits file as "no credits" instead of failing', () => {
    const { service, http } = setup();
    http.expectOne(CREDITS_URL).flush('not found', { status: 404, statusText: 'Not Found' });

    expect(service.credits()).toEqual({});
    http.verify();
  });
});
