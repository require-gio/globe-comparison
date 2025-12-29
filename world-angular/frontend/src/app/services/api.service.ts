import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { Country } from '../models/country.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Derive API base URL from runtime `env.js` if available, otherwise fallback to localhost:3000
  private readonly REQUEST_TIMEOUT = 5000; // 5 seconds
  private readonly RETRY_ATTEMPTS = 2;
  private API_BASE_URL: string;

  constructor(private http: HttpClient) {
    const runtimeApiUrl = (window as any)?.__APP_ENV__?.API_URL;
    const base = runtimeApiUrl ? runtimeApiUrl.replace(/\/$/, '') : 'http://localhost:3000';
    this.API_BASE_URL = `${base}/api`;
    // Helpful debug log to confirm runtime API selection in browser console
    console.info('[ApiService] API_BASE_URL set to', this.API_BASE_URL);
  }

  /**
   * Retrieve country information by ISO 3166-1 alpha-2 country code
   * 
   * @param code - Two-letter country code (e.g., 'US', 'FR', 'JP')
   * @returns Observable<Country> with country data or fallback data on error
   */
  getCountry(code: string): Observable<Country> {
    const upper = code.toUpperCase();
    const url = `${this.API_BASE_URL}/country/${upper}`;
    console.debug('[ApiService] getCountry', upper, '->', url);

    return this.http.get<Country>(url).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError((error: HttpErrorResponse) => this.handleError(error, code))
    );
  }

  /**
   * Handle API errors and return fallback data
   */
  private handleError(error: HttpErrorResponse, code: string): Observable<Country> {
    console.error(`Error fetching country ${code}:`, error);

    // Return fallback data with "Information unavailable" message
    const fallbackCountry: Country = {
      code: code.toUpperCase(),
      name: 'Information unavailable',
      population: 0,
      capital: 'Information unavailable',
      region: 'Unknown'
    };

    return of(fallbackCountry);
  }
}
