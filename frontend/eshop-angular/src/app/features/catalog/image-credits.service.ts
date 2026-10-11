import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { IMAGE_BASE_URL } from '../../core/api/api-config';

export interface ImageCredit {
  /** Title of the work on Wikimedia Commons. */
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  /** Page where the photo comes from. */
  source: string;
  /** Plain-language note, e.g. when the photo shows a sibling model. */
  note: string;
}

/** The product photos are reused under Creative Commons licences, which require visible credit.
 *  Catalog.Api ships a credits.json next to the pictures; this reads it once. */
@Injectable({ providedIn: 'root' })
export class ImageCredits {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(IMAGE_BASE_URL);

  /** File name -> credit. Empty if the file is missing or the request fails (credits are optional). */
  readonly credits = toSignal(
    this.http.get<Record<string, ImageCredit>>(`${this.baseUrl}/credits.json`).pipe(
      catchError(() => of({} as Record<string, ImageCredit>))
    ),
    { initialValue: {} as Record<string, ImageCredit> }
  );
}
