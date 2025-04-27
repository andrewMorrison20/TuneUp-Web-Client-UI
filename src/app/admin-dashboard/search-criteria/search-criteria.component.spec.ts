import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchCriteriaComponent } from './search-criteria.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SharedDataService } from '../../components/shared-data-service.component';
import { of } from 'rxjs';
import {SharedModule} from "../../shared/shared.module";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('SearchCriteriaComponent', () => {
  let component: SearchCriteriaComponent;
  let fixture: ComponentFixture<SearchCriteriaComponent>;
  let httpMock: HttpTestingController;
  let sharedDataSpy: jasmine.SpyObj<SharedDataService>;

  beforeEach(async () => {
    sharedDataSpy = jasmine.createSpyObj('SharedDataService', [
      'loadInstruments', 'loadGenres', 'loadQualifications',
      'refreshInstruments', 'refreshGenres'
    ], {
      instruments$: of([{ id: 1, name: 'Guitar' }]),
      genres$: of([{ id: 2, name: 'Rock' }]),
      qualifications$: of([{ id: 3, name: 'ABRSM Grade 5' }])
    });

    await TestBed.configureTestingModule({
      declarations: [SearchCriteriaComponent],
      imports: [HttpClientTestingModule, MatSnackBarModule, SharedModule, NoopAnimationsModule],
      providers: [
        { provide: SharedDataService, useValue: sharedDataSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchCriteriaComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    expect(component.instruments.length).toBe(1);
    expect(component.genres.length).toBe(1);
    expect(component.qualifications.length).toBe(1);
  });

  it('should store tab index in localStorage', () => {
    spyOn(localStorage, 'setItem');
    component.storeSelectedTab(1);
    expect(localStorage.setItem).toHaveBeenCalledWith('selectedAdminTab', '1');
  });

  it('should toggle selection correctly', () => {
    const set = new Set<number>();
    component.toggleSelection(set, 1);
    expect(set.has(1)).toBeTrue();
    component.toggleSelection(set, 1);
    expect(set.has(1)).toBeFalse();
  });

  it('should delete selected instruments and refresh list', fakeAsync(() => {
    component.selectedInstruments.add(1);
    component.deleteInstruments();

    const req = httpMock.expectOne('http://localhost:8080/api/instruments/delete-batch');
    expect(req.request.method).toBe('POST');
    req.flush({});

    tick(3000);

    expect(component.selectedInstruments.size).toBe(0);
  }));


  it('should show error if deleting fails', fakeAsync(() => {
    component.selectedGenres.add(2);
    component.deleteGenres();

    const req = httpMock.expectOne('http://localhost:8080/api/genres/delete-batch');
    req.error(new ErrorEvent('Network error'));
    tick(3000);
  }));

  it('should add instrument and refresh list on success', fakeAsync(() => {
    component.newInstrumentName = 'Violin';
    component.addInstrument();

    const req = httpMock.expectOne('http://localhost:8080/api/instruments');
    expect(req.request.method).toBe('POST');
    req.flush({});

    tick(3000);

    expect(component.newInstrumentName).toBe('');
  }));


  it('should not add empty instrument', () => {
    component.newInstrumentName = '   ';
    component.addInstrument();
    httpMock.expectNone('http://localhost:8080/api/instruments');
  });

  it('should add genre', fakeAsync(() => {
    component.newGenreName = 'Jazz';
    component.addGenre();

    const req = httpMock.expectOne('http://localhost:8080/api/genres');
    expect(req.request.body).toEqual({ name: 'Jazz' });
    req.flush({});

    tick(3000);

  }));

  it('should add qualification', fakeAsync(() => {
    component.newQualificationName = 'Diploma';
    component.addQualification();

    const req = httpMock.expectOne('http://localhost:8080/api/qualifications');
    expect(req.request.body).toEqual({ name: 'Diploma' });
    req.flush({});
    tick(3000);
  }));

  it('should refresh data based on endpoint', () => {
    component.refreshData('instruments');
    expect(sharedDataSpy.refreshInstruments).toHaveBeenCalled();

    component.refreshData('genres');
    expect(sharedDataSpy.refreshGenres).toHaveBeenCalled();

    component.refreshData('qualifications');
    expect(sharedDataSpy.loadQualifications).toHaveBeenCalled();
  });
});
