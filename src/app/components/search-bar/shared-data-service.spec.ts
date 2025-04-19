import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import {Genre, Qualification, SharedDataService} from "../shared-data-service.component";
import {Instrument} from "./search-bar.component";

describe('SharedDataService', () => {
  let service: SharedDataService;
  let httpMock: HttpTestingController;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SharedDataService,
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    });

    service = TestBed.inject(SharedDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch and cache instruments on first load', () => {
    const mockInstruments: Instrument[] = [{ id: 1, name: 'Guitar' }];
    let received: Instrument[] = [];

    service.instruments$.subscribe(data => {
      if (data) {
        received = data;
      }
    });
    service.loadInstruments();

    const req = httpMock.expectOne('http://localhost:8080/api/instruments');
    expect(req.request.method).toBe('GET');
    req.flush(mockInstruments);

    expect(received).toEqual(mockInstruments);

    // second call should use cache, no HTTP
    service.loadInstruments();
    httpMock.expectNone('http://localhost:8080/api/instruments');
  });

  it('should show error snackbar on instruments load failure', () => {
    service.loadInstruments();
    const req = httpMock.expectOne('http://localhost:8080/api/instruments');
    req.error(new ErrorEvent('Network error'));

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Failed to fetch instruments. Please refresh the page.',
      'Close',
      { duration: 3000 }
    );
  });

  it('should fetch and cache genres on first load', () => {
    const mockGenres: Genre[] = [{ id: 2, name: 'Rock' }];
    let received: Genre[] = [];

    service.genres$.subscribe(data => {
      if (data) {
        received = data;
      }
    });
    service.loadGenres();

    const req = httpMock.expectOne('http://localhost:8080/api/genres');
    expect(req.request.method).toBe('GET');
    req.flush(mockGenres);

    expect(received).toEqual(mockGenres);

    // second call should use cache, no HTTP
    service.loadGenres();
    httpMock.expectNone('http://localhost:8080/api/genres');
  });

  it('should fetch, sort, and cache qualifications on first load', () => {
    const mockQuals: Qualification[] = [
      { id: 1, name: 'B2' },
      { id: 2, name: 'A1' }
    ];
    let received: Qualification[] = [];

    service.qualifications$.subscribe(data => {
      if (data) {
        received = data;
      }
    });
    service.loadQualifications();

    const req = httpMock.expectOne('http://localhost:8080/api/qualifications');
    expect(req.request.method).toBe('GET');
    req.flush(mockQuals);

    const expectedSorted: Qualification[] = [
      { id: 2, name: 'A1' },
      { id: 1, name: 'B2' }
    ];
    expect(received).toEqual(expectedSorted);

    // second call should use cache, no HTTP
    service.loadQualifications();
    httpMock.expectNone('http://localhost:8080/api/qualifications');
  });

  it('refreshInstruments always triggers HTTP and updates cache', () => {
    const data1: Instrument[] = [{ id: 1, name: 'Guitar' }];
    const data2: Instrument[] = [{ id: 2, name: 'Piano' }];
    const results: (Instrument[] | null)[] = [];

    service.instruments$.subscribe(d => results.push(d));

    // initial refresh
    service.refreshInstruments();
    let req = httpMock.expectOne('http://localhost:8080/api/instruments');
    expect(req.request.method).toBe('GET');
    req.flush(data1);

    // second refresh
    service.refreshInstruments();
    req = httpMock.expectOne('http://localhost:8080/api/instruments');
    req.flush(data2);

    const expected: (Instrument[] | null)[] = [null, data1, data2];
    expect(results).toEqual(expected);
  });

  it('searchRegions emits [] for short queries', () => {
    const results: any[][] = [];
    service.regions$.subscribe(r => results.push(r));

    service.searchRegions('ab');
    expect(results.pop()).toEqual([]);
  });

  it('searchRegions fetches and emits data for long queries', () => {
    const mockRegions = [{ name: 'Reg1' }];
    const results: any[][] = [];
    service.regions$.subscribe(r => results.push(r));

    service.searchRegions('abc');
    const req = httpMock.expectOne('http://localhost:8080/api/regions?query=abc');
    expect(req.request.method).toBe('GET');
    req.flush(mockRegions);

    expect(results.pop()).toEqual(mockRegions);
  });

  it('should show error snackbar on qualifications load failure', () => {
    service.loadQualifications();
    const req = httpMock.expectOne('http://localhost:8080/api/qualifications');
    req.error(new ErrorEvent('Network error'));

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Failed to fetch qualifications. Please refresh the page.',
      'Close',
      { duration: 3000 }
    );
  });

  it('selectRegion clears regionsSubject', () => {
    const results: any[][] = [];
    service.regions$.subscribe(r => results.push(r));

    // simulate a prior region list
    service.searchRegions('abc');
    httpMock.expectOne('http://localhost:8080/api/regions?query=abc').flush([{ name: 'x' }]);

    service.selectRegion({});
    expect(results.pop()).toEqual([]);
  });

  it('should show error snackbar on genres load failure', () => {
    service.loadGenres();
    const req = httpMock.expectOne('http://localhost:8080/api/genres');
    req.error(new ErrorEvent('Network error'));

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Failed to fetch genres. Please refresh the page.',
      'Close',
      { duration: 3000 }
    );
  });

  it('should show error snackbar on instruments load failure', () => {
    service.loadInstruments();
    const req = httpMock.expectOne('http://localhost:8080/api/instruments');
    req.error(new ErrorEvent('Network error'));

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Failed to fetch instruments. Please refresh the page.',
      'Close',
      { duration: 3000 }
    );
  });
});
