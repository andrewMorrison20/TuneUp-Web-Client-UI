// search-bar.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  searchQuery: string = '';
  selectedLocation: string = '';
  selectedInstrument: string = '';

  locations: string[] = ['Northern Ireland', 'England', 'Scotland', 'Wales'];
  instruments: string[] = ['Guitar', 'Piano', 'Drums', 'Violin', 'Saxophone'];

  onLocationChange() {
    console.log('Selected Location:', this.selectedLocation);
  }

  onInstrumentChange() {
    console.log('Selected Instrument:', this.selectedInstrument);
  }

  onSearchClick() {
    console.log('Search Query:', this.searchQuery);
    console.log('Selected Location:', this.selectedLocation);
    console.log('Selected Instrument:', this.selectedInstrument);
  }
}
