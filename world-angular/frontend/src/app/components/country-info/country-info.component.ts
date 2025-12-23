import { Component, Input } from '@angular/core';
import { Country } from '../../models/country.model';

@Component({
  selector: 'app-country-info',
  templateUrl: './country-info.component.html',
  styleUrls: ['./country-info.component.scss'],
  standalone: false
})
export class CountryInfoComponent {
  @Input() country: Country | null = null;
  @Input() isLoading = false;
  @Input() error: string | null = null;

  /**
   * Format population with thousand separators
   */
  formatPopulation(population: number): string {
    if (population === 0) {
      return 'N/A';
    }
    return population.toLocaleString('en-US');
  }
}
