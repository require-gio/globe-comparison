import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Country, HoverState } from '../models/country.model';

@Injectable({
  providedIn: 'root'
})
export class CountryStateService {
  private hoveredCountrySubject = new BehaviorSubject<HoverState>({ 
    countryCode: null, 
    mousePosition: null, 
    isLoading: false, 
    countryData: null, 
    error: null 
  });
  private selectedCountrySubject = new BehaviorSubject<Country | null>(null);

  /**
   * Observable for the currently hovered country
   */
  public hoveredCountry$: Observable<HoverState> = this.hoveredCountrySubject.asObservable();

  /**
   * Observable for the selected country data
   */
  public selectedCountry$: Observable<Country | null> = this.selectedCountrySubject.asObservable();

  /**
   * Set the currently hovered country
   * @param countryCode - ISO 3166-1 alpha-2 country code or null
   * @param mousePosition - Mouse position for popover placement
   */
  setHoveredCountry(countryCode: string | null, mousePosition: { x: number; y: number } | null = null): void {
    const currentState = this.hoveredCountrySubject.value;
    this.hoveredCountrySubject.next({ 
      ...currentState,
      countryCode, 
      mousePosition 
    });
  }

  /**
   * Set the selected country data
   * @param country - Country data or null
   */
  setSelectedCountry(country: Country | null): void {
    this.selectedCountrySubject.next(country);
  }

  /**
   * Get the current hovered country code
   */
  getCurrentHoveredCountry(): string | null {
    return this.hoveredCountrySubject.value.countryCode;
  }

  /**
   * Get the current selected country
   */
  getCurrentSelectedCountry(): Country | null {
    return this.selectedCountrySubject.value;
  }

  /**
   * Set loading state for country data fetch
   */
  setLoading(isLoading: boolean): void {
    const currentState = this.hoveredCountrySubject.value;
    this.hoveredCountrySubject.next({ ...currentState, isLoading });
  }

  /**
   * Set country data after successful fetch
   */
  setCountryData(countryData: Country | null): void {
    const currentState = this.hoveredCountrySubject.value;
    this.hoveredCountrySubject.next({ ...currentState, countryData, isLoading: false, error: null });
  }

  /**
   * Set error state
   */
  setError(error: string | null): void {
    const currentState = this.hoveredCountrySubject.value;
    this.hoveredCountrySubject.next({ ...currentState, error, isLoading: false });
  }

  /**
   * Clear all state
   */
  clearState(): void {
    this.hoveredCountrySubject.next({ 
      countryCode: null, 
      mousePosition: null, 
      isLoading: false, 
      countryData: null, 
      error: null 
    });
    this.selectedCountrySubject.next(null);
  }
}
