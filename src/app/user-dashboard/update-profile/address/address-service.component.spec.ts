import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { AuthenticatedUser } from '../../../authentication/authenticated-user.class';
import { HttpErrorResponse } from '@angular/common/http';
import {AddressDto, AddressService} from "./address-service.component";

describe('AddressService', () => {
  let service: AddressService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    spyOn(AuthenticatedUser, 'getAuthUserToken').and.returnValue('fake-token');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AddressService]
    });

    service = TestBed.inject(AddressService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAddressSuggestions', () => {
    const dummyResults: AddressDto[] = [
      {
        id: 1,
        postcode: '12345',
        city: 'Testville',
        country: 'Testland',
        addressLine1: '1 Test St',
        latitude: 10,
        longitude: 20
      }
    ];

    it('should fetch suggestions with the correct query params', () => {
      service.getAddressSuggestions('12345', 'Test St').subscribe(res => {
        expect(res).toEqual(dummyResults);
      });

      const req = httpMock.expectOne(r =>
        r.method === 'GET' &&
        r.url === 'http://localhost:8080/api/addresses/lookup' &&
        r.params.get('postcode') === '12345' &&
        r.params.get('streetName') === 'Test St'
      );

      req.flush(dummyResults);
    });

    it('should propagate HTTP errors', () => {
      let errorResponse: any;
      service.getAddressSuggestions('00000', 'None').subscribe({
        next: () => fail('should have errored'),
        error: err => (errorResponse = err)
      });

      const req = httpMock.expectOne(() => true);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });

      expect(errorResponse).toBeInstanceOf(HttpErrorResponse);
      expect((errorResponse as HttpErrorResponse).status).toBe(404);
    });
  });

  describe('getLessonTutorLocation', () => {
    const dummyLocation: AddressDto = {
      id: 2,
      postcode: '99999',
      city: 'Errorville',
      country: 'Errland',
      addressLine1: '2 Error Rd',
      latitude: 30,
      longitude: 40
    };

    it('should GET the lesson location with an Authorization header', () => {
      service.getLessonTutorLocation(77).subscribe(res => {
        expect(res).toEqual(dummyLocation);
      });

      const req = httpMock.expectOne(r =>
        r.method === 'GET' &&
        r.url === 'http://localhost:8080/api/addresses/lesson/77/location'
      );

      // auth header
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
      req.flush(dummyLocation);
    });

    it('should bubble up errors from the location call', () => {
      let caughtError: any;
      service.getLessonTutorLocation(88).subscribe({
        next: () => fail('expected an error'),
        error: (err: any) => (caughtError = err)
      });

      const req = httpMock.expectOne(() => true);
      req.error(new ProgressEvent('network'));
      expect(caughtError).toBeTruthy();
    });
  });
});
