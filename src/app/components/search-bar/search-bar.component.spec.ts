import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBarComponent, Instrument, Genre } from './search-bar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedDataService } from '../shared-data-service.component';
import { BehaviorSubject } from 'rxjs';
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {SharedModule} from "../../shared/shared.module";

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let sharedStub: any;

  beforeEach(async () => {
    // stub SharedDataService
    sharedStub = {
      instrumentsSubject: new BehaviorSubject<Instrument[] | null>(null),
      genresSubject: new BehaviorSubject<Genre[] | null>(null),
      instruments$: null,
      genres$: null,
      loadInstruments: jasmine.createSpy('loadInstruments'),
      loadGenres: jasmine.createSpy('loadGenres')
    };
    sharedStub.instruments$ = sharedStub.instrumentsSubject.asObservable();
    sharedStub.genres$ = sharedStub.genresSubject.asObservable();

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, NoopAnimationsModule, SharedModule],
      declarations: [SearchBarComponent],
      providers: [
        { provide: SharedDataService, useValue: sharedStub },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
  });

  it('ngOnInit subscribes and loads data', () => {
    const inst: Instrument[] = [{ id: 1, name: 'Guitar' }];
    const gen: Genre[] = [{ id: 2, name: 'Rock' }];
    sharedStub.instrumentsSubject.next(inst);
    sharedStub.genresSubject.next(gen);

    fixture.detectChanges();  // triggers ngOnInit

    expect(component.instruments).toEqual(inst);
    expect(component.genres).toEqual(gen);
    expect(sharedStub.loadInstruments).toHaveBeenCalled();
    expect(sharedStub.loadGenres).toHaveBeenCalled();
  });

  it('onInstrumentChange logs selectedInstrumentId', () => {
    spyOn(console, 'log');
    component.selectedInstrumentId = [5];
    component.onInstrumentChange();
    expect(console.log).toHaveBeenCalledWith('Selected Instrument ID:', [5]);
  });

  it('onGenreChange logs selectedGenreId', () => {
    spyOn(console, 'log');
    component.selectedGenreId = [7];
    component.onGenreChange();
    expect(console.log).toHaveBeenCalledWith('Selected genre ID:', [7]);
  });

  it('onProfileTypeChange logs selectedProfileType', () => {
    spyOn(console, 'log');
    component.selectedProfileType = 'Tutor';
    component.onProfileTypeChange();
    expect(console.log).toHaveBeenCalledWith('Selected profileType:', 'Tutor');
  });

  it('formatDate returns ISO string without milliseconds', () => {
    const dt = new Date('2025-04-19T12:34:56.789Z');
    const result = (component as any).formatDate(dt);
    expect(result).toBe('2025-04-19T12:34:56');
  });

  it('onSearchClick builds queryParams and navigates', () => {
    const dtStart = new Date(Date.UTC(2025, 3, 20, 8, 0, 0));
    const dtEnd = new Date(Date.UTC(2025, 3, 21, 18, 30, 0));
    (component.availability as any).startDate = dtStart;
    (component.availability as any).endDate = dtEnd;

    spyOn(console, 'log');
    component.searchQuery = 'test';
    component.selectedInstrumentId = [1];
    component.selectedGenreId = [2];
    component.selectedProfileType = 'Student';

    component.onSearchClick();

    // First log call: raw Date objects
    const calls = (console.log as jasmine.Spy).calls.allArgs();
    expect(calls[0]).toEqual(['Availability', dtStart, dtEnd]);

    // Second log call: formatted strings
    const formattedStart = component['formatDate'](dtStart);
    const formattedEnd = component['formatDate'](dtEnd);
    expect(calls[1]).toEqual(['Availability', formattedStart, formattedEnd]);

    // navigate with formatted values
    const expectedParams = {
      keyword: 'test',
      instruments: [1],
      genres: [2],
      profileType: 'Student',
      startDate: formattedStart,
      endDate: formattedEnd,
      page: 0,
      size: 8,
      sort: 'displayName,asc'
    };
    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['/profiles/search'],
      { queryParams: expectedParams }
    );
  });

  it('onSearchClick handles empty fields', () => {
    component.searchQuery = '';
    component.selectedInstrumentId = null;
    component.selectedGenreId = null;
    component.selectedProfileType = '';

    component.availability.startDate = null;
    component.availability.endDate = null;
    spyOn(console, 'log');
    component.onSearchClick();

    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['/profiles/search'],
      { queryParams: {
          keyword: null,
          instruments: null,
          genres: null,
          profileType: null,
          startDate: null,
          endDate: null,
          page: 0,
          size: 8,
          sort: 'displayName,asc'
        }}
    );
  });
});
