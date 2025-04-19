import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiltersSideBarComponent } from './filters-side-bar.component';
import { SharedDataService, Instrument, Genre, Qualification } from '../shared-data-service.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TuitionRegion } from '../../profiles/interfaces/tuition-region.model';
import { FiltersSideBarModule } from './filters-side-bar.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('FiltersSideBarComponent', () => {
  let component: FiltersSideBarComponent;
  let fixture: ComponentFixture<FiltersSideBarComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let sharedStub: any;

  beforeEach(async () => {
    sharedStub = {
      instrumentsSubject: new BehaviorSubject<Instrument[] | null>(null),
      genresSubject: new BehaviorSubject<Genre[] | null>(null),
      qualificationsSubject: new BehaviorSubject<Qualification[] | null>(null),
      regionsSubject: new BehaviorSubject<any[]>([]),
      instruments$: null,
      genres$: null,
      qualifications$: null,
      regions$: null,
      loadInstruments: jasmine.createSpy('loadInstruments'),
      loadGenres: jasmine.createSpy('loadGenres'),
      loadQualifications: jasmine.createSpy('loadQualifications'),
      searchRegions: jasmine.createSpy('searchRegions'),
      selectRegion: jasmine.createSpy('selectRegion'),
    };
    sharedStub.instruments$ = sharedStub.instrumentsSubject.asObservable();
    sharedStub.genres$ = sharedStub.genresSubject.asObservable();
    sharedStub.qualifications$ = sharedStub.qualificationsSubject.asObservable();
    sharedStub.regions$ = sharedStub.regionsSubject.asObservable();

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FiltersSideBarModule, NoopAnimationsModule],
      providers: [
        { provide: SharedDataService, useValue: sharedStub },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltersSideBarComponent);
    component = fixture.componentInstance;
  });

  it('getStars should return correct star array', () => {
    expect(component.getStars(0)).toEqual([
      'star_border', 'star_border', 'star_border', 'star_border', 'star_border',
    ]);
    expect(component.getStars(3)).toEqual([
      'star', 'star', 'star', 'star_border', 'star_border',
    ]);
    expect(component.getStars(5)).toEqual([
      'star', 'star', 'star', 'star', 'star',
    ]);
  });

  it('selectRating sets selectedRating and calls onRatingChange', () => {
    spyOn(component, 'onRatingChange');
    component.selectRating(4);
    expect(component.selectedRating).toBe(4);
    expect(component.onRatingChange).toHaveBeenCalled();
  });

  it('ngOnInit subscribes and loads data', () => {
    const inst: Instrument[] = [{ id: 1, name: 'G' }];
    const gen: Genre[] = [{ id: 2, name: 'R' }];
    const qual: Qualification[] = [{ id: 3, name: 'Q' }];
    const regions = [
      { id: 5, name: 'Reg5', parentRegionName: '', latitude: 0, longitude: 0, country: 'UK' },
    ];
    sharedStub.instrumentsSubject.next(inst);
    sharedStub.genresSubject.next(gen);
    sharedStub.qualificationsSubject.next(qual);
    sharedStub.regionsSubject.next(regions);

    fixture.detectChanges(); // ngOnInit

    expect(component.instruments).toEqual(
      inst.map((i) => ({ ...i, selected: false }))
    );
    expect(component.genres).toEqual(
      gen.map((g) => ({ ...g, selected: false }))
    );
    expect(component.qualifications).toEqual(
      qual.map((q) => ({ ...q, selected: false }))
    );
    expect(component.regionSuggestions).toEqual(regions);

    expect(sharedStub.loadInstruments).toHaveBeenCalled();
    expect(sharedStub.loadGenres).toHaveBeenCalled();
    expect(sharedStub.loadQualifications).toHaveBeenCalled();
  });

  it('getSelected... filters selected items', () => {
    component.genres = [
      { id: 1, name: 'a', selected: true },
      { id: 2, name: 'b', selected: false }
    ];
    const selectedGenres = component.getSelectedGenres();
    expect(selectedGenres.length).toBe(1);
    expect(selectedGenres[0]).toEqual(
      jasmine.objectContaining({ id: 1, name: 'a' })
    );

    component.instruments = [
      { id: 3, name: 'x', selected: false },
      { id: 4, name: 'y', selected: true }
    ];
    const selectedInstruments = component.getSelectedInstruments();
    expect(selectedInstruments.length).toBe(1);
    expect(selectedInstruments[0]).toEqual(
      jasmine.objectContaining({ id: 4, name: 'y' })
    );

    component.qualifications = [
      { id: 5, name: 'q1', selected: true },
      { id: 6, name: 'q2', selected: false }
    ];
    expect(component.getSelectedQualifications()).toEqual([5]);

    component.lessonTypes[1].selected = true;
    expect(component.getSelectedLessonTypes()).toEqual(['In Person']);
  });

  it('onRegionSearch calls searchRegions', () => {
    component.regionSearchQuery = 'foo';
    component.onRegionSearch();
    expect(sharedStub.searchRegions).toHaveBeenCalledWith('foo');
  });

  it('selectRegion sets selectedRegion and calls shared selectRegion', () => {
    const region: TuitionRegion = {
      id: 7,
      name: 'Region7',
      parentRegionName: '',
      latitude: 0,
      longitude: 0,
      country: 'UK',
    };
    component.selectRegion(region);
    expect(component.selectedRegion).toBe(region);
    expect(sharedStub.selectRegion).toHaveBeenCalledWith(region);
  });

  it('clearSelection resets selectedRegion to null', () => {
    component.selectedRegion = {
      id: 9,
      name: 'R9',
      parentRegionName: '',
      latitude: 0,
      longitude: 0,
      country: 'UK',
    } as TuitionRegion;
    component.clearSelection();
    expect(component.selectedRegion).toBeNull();
  });


  it('clearRating resets rating and calls onRatingChange', () => {
    component.selectedRating = 3;
    spyOn(component, 'onRatingChange');
    component.clearRating();
    expect(component.selectedRating).toBe(0);
    expect(component.onRatingChange).toHaveBeenCalled();
  });
  describe('onPriceChange', () => {
    let component: FiltersSideBarComponent;

    beforeEach(() => {
      // create a bare instance (no Angular TestBed required for this pure method)
      component = new FiltersSideBarComponent(
        /* http */ null as any,
        /* router */ null as any,
        /* sharedDataService */ null as any
      );
    });

    it('logs an error and collapses both min & max to the smaller value when inverted', () => {
      spyOn(console, 'error');
      spyOn(console, 'log');

      component.priceRange = { min: 500, max: 100 };
      component.onPriceChange();

      expect(console.error)
        .toHaveBeenCalledWith('Min price cannot be greater than max price.');
      expect(component.priceRange).toEqual({ min: 100, max: 100 });
      expect(console.log)
        .toHaveBeenCalledWith('Updated price range:', { min: 100, max: 100 });
    });

    it('does nothing (no error) when min ≤ max', () => {
      spyOn(console, 'error');
      spyOn(console, 'log');

      component.priceRange = { min: 50, max: 100 };
      component.onPriceChange();

      expect(console.error).not.toHaveBeenCalled();
      expect(component.priceRange).toEqual({ min: 50, max: 100 });
      expect(console.log)
        .toHaveBeenCalledWith('Updated price range:', { min: 50, max: 100 });
    });
  });


  it('applyFilters builds queryParams and navigates', () => {
    component.searchQuery = 'test';
    component.instruments = [
      { id: 10, name: 'i', selected: true },
    ];
    component.genres = [
      { id: 20, name: 'g', selected: true },
    ];
    component.qualifications = [
      { id: 30, name: 'q', selected: true },
    ];
    component.lessonTypes = [
      { id: 'A', name: 'a', selected: true },
      { id: 'B', name: 'b', selected: false },
    ];
    component.selectedRating = 2;
    component.selectedRegion = {
      id: 40,
      name: 'Reg40',
      parentRegionName: '',
      latitude: 0,
      longitude: 0,
      country: 'UK',
    } as TuitionRegion;
    component.priceRange = { min: 0, max: 1000 };

    component.applyFilters();

    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['/profiles/search'],
      {
        queryParams: {
          keyword: 'test',
          instruments: [10],
          qualifications: [30],
          genres: [20],
          lessonType: ['A'],
          rating: 2,
          regionId: 40,
          priceRange: null,
          profileType: null,
          page: 0,
          size: 8,
          sort: 'displayName,asc',
        },
      }
    );
  });
});
