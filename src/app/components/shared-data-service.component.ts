import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, catchError, Observable} from 'rxjs';
import { tap } from 'rxjs/operators';
import {MatSnackBar} from "@angular/material/snack-bar";

export interface Instrument {
  name: string;
  id: number;
}

export interface Genre {
  name: string;
  id: number;
}

export interface Qualification {
  name: string;
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class SharedDataService {
  private instrumentsCache: Instrument[] | null = null;
  private genresCache: Genre[] | null = null;
  private qualificationsCache: Qualification[] | null = null;

  private instrumentsSubject = new BehaviorSubject<Instrument[] | null>(null);
  private genresSubject = new BehaviorSubject<Genre[] | null>(null);
  private regionsSubject = new BehaviorSubject<any[]>([]);
  private qualificationsSubject = new BehaviorSubject<any[]>([]);

  regions$ = this.regionsSubject.asObservable();
  instruments$ = this.instrumentsSubject.asObservable();
  genres$ = this.genresSubject.asObservable();
  qualifications$ = this.qualificationsSubject.asObservable();

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  loadInstruments(): void {
    if (this.instrumentsCache) {
      this.instrumentsSubject.next(this.instrumentsCache);
    } else {
      this.http
        .get<Instrument[]>('http://localhost:8080/api/instruments')
        .pipe(
          tap((data) => {
            this.instrumentsCache = data;
            this.instrumentsSubject.next(data);
          }),
          catchError((err) => {
            this.snackBar.open('Failed to fetch instruments. Please refresh the page.', 'Close', { duration: 3000 });
            console.error('Error fetching instruments:', err);
            return [];
          })
        )
        .subscribe();
    }
  }

  loadGenres(): void {
    if (this.genresCache) {
      this.genresSubject.next(this.genresCache);
    } else {
      this.http
        .get<Genre[]>('http://localhost:8080/api/genres')
        .pipe(
          tap((data) => {
            this.genresCache = data;
            this.genresSubject.next(data);
          }),
          catchError((err) => {
            this.snackBar.open('Failed to fetch genres. Please refresh the page.', 'Close', { duration: 3000 });
            console.error('Error fetching genres:', err);
            return [];
          })
        )
        .subscribe();
    }
  }

  loadQualifications(): void {
    if (this.qualificationsCache) {
      this.qualificationsSubject.next(this.qualificationsCache);
    } else {
      this.http
        .get<Qualification[]>('http://localhost:8080/api/qualifications')
        .pipe(
          tap((data) => {
            const sortedData = data.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
            this.qualificationsCache = sortedData;
            this.qualificationsSubject.next(sortedData);
          }),
          catchError((err) => {
            this.snackBar.open('Failed to fetch qualifications. Please refresh the page.', 'Close', { duration: 3000 });
            console.error('Error fetching qualifications:', err);
            return [];
          })
        )
        .subscribe();
    }
  }


  refreshInstruments(): void {
    this.http
      .get<Instrument[]>('http://localhost:8080/api/instruments')
      .pipe(
        tap((data) => {
          this.instrumentsCache = data; // Update cache
          this.instrumentsSubject.next(data);
        })
      )
      .subscribe();
  }

  refreshGenres(): void {
    this.http
      .get<Genre[]>('http://localhost:8080/api/genres')
      .pipe(
        tap((data) => {
          this.genresCache = data; // Update cache
          this.genresSubject.next(data);
        })
      )
      .subscribe();
  }

  searchRegions(query: string): void {
    if (query.trim().length > 2) {
      this.http
        .get<any[]>(`http://localhost:8080/api/regions?query=${query.trim()}`)
        .subscribe((data) => {
          this.regionsSubject.next(data);
        });
    } else {
      this.regionsSubject.next([]);
    }
  }

  selectRegion(region: any): void {
    this.regionsSubject.next([]);

  }



}
