import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { Genre, Instrument, Qualification, SharedDataService } from '../../components/shared-data-service.component';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-search-criteria',
  templateUrl: './search-criteria.component.html',
  styleUrl: './search-criteria.component.scss'
})
export class SearchCriteriaComponent implements OnInit {
  instruments: Instrument[] = [];
  genres: Genre[] = [];
  qualifications: Qualification[] = [];
  selectedTabIndex = parseInt(localStorage.getItem('selectedAdminTab') || '0', 10);

  selectedInstruments: Set<number> = new Set();
  selectedGenres: Set<number> = new Set();
  selectedQualifications: Set<number> = new Set();

  newInstrumentName = '';
  newGenreName = '';
  newQualificationName = '';
  private baseUrl = environment.apiUrl;

  constructor(
    private sharedDataService: SharedDataService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  /** Load all reference data on component initialization */
  ngOnInit(): void {
    this.sharedDataService.instruments$.subscribe(data => this.instruments = data ?? []);
    this.sharedDataService.genres$.subscribe(data => this.genres = data ?? []);
    this.sharedDataService.qualifications$.subscribe(data => this.qualifications = data ?? []);

    this.sharedDataService.loadInstruments();
    this.sharedDataService.loadGenres();
    this.sharedDataService.loadQualifications();
  }

  /**
   * Remember which tab the admin selected.
   * @param index zero-based tab index
   */
  storeSelectedTab(index: number): void {
    localStorage.setItem('selectedAdminTab', index.toString());
    this.selectedTabIndex = index;
  }

  /**
   * Toggle an ID in a Set of selections.
   * @param set the Set to modify
   * @param id  the ID to add or remove
   */
  toggleSelection(set: Set<number>, id: number): void {
    set.has(id) ? set.delete(id) : set.add(id);
  }

  /**
   * Batch-delete selected items, then refresh.
   * @param set       selected IDs
   * @param endpoint  API endpoint (e.g. 'genres')
   * @param label     human-readable label for notifications
   */
  deleteSelected(set: Set<number>, endpoint: string, label: string): void {
    const ids = Array.from(set);
    if (!ids.length) return;

    this.http.post(`${this.baseUrl}/${endpoint}/delete-batch`, ids).subscribe({
      next: () => {
        this.snackBar.open(`${label} deleted successfully`, 'Close', { duration: 3000 });
        set.clear();
        this.refreshData(endpoint);
      },
      error: () => {
        this.snackBar.open(`Failed to delete ${label}`, 'Close', { duration: 3000 });
      }
    });
  }

  /** Helper to reload data after deletion */
  private refreshData(endpoint: string): void {
    switch (endpoint) {
      case 'instruments':
        this.sharedDataService.refreshInstruments();
        break;
      case 'genres':
        this.sharedDataService.refreshGenres();
        break;
      case 'qualifications':
        this.sharedDataService.loadQualifications();
        break;
    }
  }

  /** Delete all selected genres */
  deleteGenres() {
    this.deleteSelected(this.selectedGenres, 'genres', 'Genres');
  }

  /** Delete all selected instruments */
  deleteInstruments() {
    this.deleteSelected(this.selectedInstruments, 'instruments', 'Instruments');
  }

  /** Delete all selected qualifications */
  deleteQualifications() {
    this.deleteSelected(this.selectedQualifications, 'qualifications', 'Qualifications');
  }

  /** Add a new instrument and refresh list on success */
  addInstrument(): void {
    const name = this.newInstrumentName.trim();
    if (!name) return;

    this.http.post(`${this.baseUrl}/instruments`, { name }).subscribe({
      next: () => {
        this.snackBar.open('Instrument added', 'Close', { duration: 3000 });
        this.newInstrumentName = '';
        this.sharedDataService.refreshInstruments();
      },
      error: () => {
        this.snackBar.open('Failed to add instrument', 'Close', { duration: 3000 });
      }
    });
  }

  /** Add a new genre and refresh list on success */
  addGenre(): void {
    const name = this.newGenreName.trim();
    if (!name) return;

    this.http.post(`${this.baseUrl}/genres`, { name }).subscribe({
      next: () => {
        this.snackBar.open('Genre added', 'Close', { duration: 3000 });
        this.newGenreName = '';
        this.sharedDataService.refreshGenres();
      },
      error: () => {
        this.snackBar.open('Failed to add genre', 'Close', { duration: 3000 });
      }
    });
  }

  /** Add a new qualification and refresh list on success */
  addQualification(): void {
    const name = this.newQualificationName.trim();
    if (!name) return;

    this.http.post(`${this.baseUrl}/api/qualifications`, { name }).subscribe({
      next: () => {
        this.snackBar.open('Qualification added', 'Close', { duration: 3000 });
        this.newQualificationName = '';
        this.sharedDataService.loadQualifications();
      },
      error: () => {
        this.snackBar.open('Failed to add qualification', 'Close', { duration: 3000 });
      }
    });
  }
}
