import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Instrument {
  name: string;
  id: number;
}

export interface Genre {
  name: string;
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class SharedDataService {
  private instrumentsCache: Instrument[] | null = null;
  private genresCache: Genre[] | null = null;

  private instrumentsSubject = new BehaviorSubject<Instrument[] | null>(null);
  private genresSubject = new BehaviorSubject<Genre[] | null>(null);

  instruments$ = this.instrumentsSubject.asObservable();
  genres$ = this.genresSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadInstruments(): void {
    if (this.instrumentsCache) {
      this.instrumentsSubject.next(this.instrumentsCache);
    } else {
      this.http
        .get<Instrument[]>('http://localhost:8080/api/instruments')
        .pipe(
          tap((data) => {
            this.instrumentsCache = data; // Cache the data
            this.instrumentsSubject.next(data);
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
          })
        )
        .subscribe();
    }
  }

  // Manual refresh methods
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
}
