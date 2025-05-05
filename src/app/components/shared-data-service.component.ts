import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "../../environments/environment";

export interface Instrument { name: string; id: number; }
export interface Genre      { name: string; id: number; }
export interface Qualification { name: string; id: number; }
export interface InstrumentQualification {
  qualificationName: string;
  qualificationId: number;
  instrumentName: string;
  instrumentId: number;
}

@Injectable({ providedIn: 'root' })
export class SharedDataService {
  private instrumentsCache: Instrument[] | null = null;
  private genresCache: Genre[] | null = null;
  private qualificationsCache: Qualification[] | null = null;

  private readonly baseUrl = environment.apiUrl;

  private instrumentsSubject    = new BehaviorSubject<Instrument[] | null>(null);
  private genresSubject         = new BehaviorSubject<Genre[]      | null>(null);
  private regionsSubject        = new BehaviorSubject<any[]>([]);
  private qualificationsSubject = new BehaviorSubject<any[]>([]);

  regions$        = this.regionsSubject.asObservable();
  instruments$    = this.instrumentsSubject.asObservable();
  genres$         = this.genresSubject.asObservable();
  qualifications$ = this.qualificationsSubject.asObservable();

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  /** Load instruments (uses cache if available, otherwise fetches from API). */
  loadInstruments(): void {
    if (this.instrumentsCache) {
      this.instrumentsSubject.next(this.instrumentsCache);
    } else {
      this.http.get<Instrument[]>(`${this.baseUrl}/instruments`)
        .pipe(
          tap(data => {
            this.instrumentsCache = data;
            this.instrumentsSubject.next(data);
          }),
          catchError(err => {
            this.snackBar.open('Failed to fetch instruments. Please refresh the page.', 'Close', { duration: 3000 });
            console.error('Error fetching instruments:', err);
            return [];
          })
        )
        .subscribe();
    }
  }

  /** Load genres (uses cache if available, otherwise fetches from API). */
  loadGenres(): void {
    if (this.genresCache) {
      this.genresSubject.next(this.genresCache);
    } else {
      this.http.get<Genre[]>(`${this.baseUrl}/genres`)
        .pipe(
          tap(data => {
            this.genresCache = data;
            this.genresSubject.next(data);
          }),
          catchError(err => {
            this.snackBar.open('Failed to fetch genres. Please refresh the page.', 'Close', { duration: 3000 });
            console.error('Error fetching genres:', err);
            return [];
          })
        )
        .subscribe();
    }
  }

  /** Load qualifications (uses cache if available, otherwise fetches, sorts, and emits). */
  loadQualifications(): void {
    if (this.qualificationsCache) {
      this.qualificationsSubject.next(this.qualificationsCache);
    } else {
      this.http.get<Qualification[]>(`${this.baseUrl}/qualifications`)
        .pipe(
          tap((data) => {
            const sortedData = data.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
            this.qualificationsCache = sortedData;
            this.qualificationsSubject.next(sortedData);
          }),
          catchError(err => {
            this.snackBar.open('Failed to fetch qualifications. Please refresh the page.', 'Close', { duration: 3000 });
            console.error('Error fetching qualifications:', err);
            return [];
          })
        )
        .subscribe();
    }
  }

  /** Refresh instruments from the API and update cache & subject. */
  refreshInstruments(): void {
    this.http.get<Instrument[]>(`${this.baseUrl}/instruments`)
      .pipe(
        tap(data => {
          this.instrumentsCache = data;
          this.instrumentsSubject.next(data);
        })
      )
      .subscribe();
  }

  /** Refresh genres from the API and update cache & subject. */
  refreshGenres(): void {
    this.http.get<Genre[]>(`${this.baseUrl}/genres`)
      .pipe(
        tap(data => {
          this.genresCache = data;
          this.genresSubject.next(data);
        })
      )
      .subscribe();
  }

  /**
   * Search regions matching the query (min length 3),
   * emitting results or clearing if query too short.
   */
  searchRegions(query: string): void {
    if (query.trim().length > 2) {
      this.http.get<any[]>(`${this.baseUrl}/regions?query=${query.trim()}`)
        .subscribe(data => this.regionsSubject.next(data));
    } else {
      this.regionsSubject.next([]);
    }
  }

  /** Select a region by emitting it (and clear suggestions). */
  selectRegion(region: any): void {
    this.regionsSubject.next([]);
  }
}
