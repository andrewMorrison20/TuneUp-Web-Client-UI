import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpHeaders } from '@angular/common/http';
import {TuitionsService} from "../tuitions.service";
import {AuthenticatedUser} from "../../../authentication/authenticated-user.class";


describe('TuitionsService', () => {
  let service: TuitionsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TuitionsService]
    });
    service = TestBed.inject(TuitionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('deactivateTuition', () => {
    it('should send PATCH and complete on success', (done) => {
      spyOn(console, 'log');
      service.deactivateTuition(42).subscribe({
        next: () => {
          expect(console.log).toHaveBeenCalledWith('Tuition 42 deactivated successfully');
          done();
        },
        error: () => fail('Should not error')
      });

      const req = httpMock.expectOne('http://localhost:8080/api/tuitions/42/deactivate');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });

    it('should propagate error on failure', (done) => {
      spyOn(console, 'error');
      service.deactivateTuition(99).subscribe({
        next: () => fail('Should error'),
        error: (err) => {
          expect(console.error).toHaveBeenCalledWith('Error in deactivateTuition:', err);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8080/api/tuitions/99/deactivate');
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('fetchTuitions', () => {
    const mockResponse = { content: ['a','b'], totalElements: 2 };

    it('should GET tuitions with default params', () => {
      spyOn(console, 'log');
      service.fetchTuitions(7).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(r =>
        r.method === 'GET' &&
        r.url === 'http://localhost:8080/api/tuitions/tuitionsByProfile/7' &&
        r.params.get('page') === '0' &&
        r.params.get('size') === '10' &&
        r.params.get('active') === 'true'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
      expect(console.log).toHaveBeenCalledWith('Fetched tuitions for profileId 7');
    });

    it('should propagate error on failure', (done) => {
      spyOn(console, 'error');
      service.fetchTuitions(8, false, 1, 5).subscribe({
        next: () => fail('Should error'),
        error: err => {
          expect(console.error).toHaveBeenCalledWith('Error fetching tuitions:', err);
          done();
        }
      });

      const req = httpMock.expectOne(r =>
        r.url.includes('/tuitionsByProfile/8') &&
        r.params.get('active') === 'false' &&
        r.params.get('page') === '1' &&
        r.params.get('size') === '5'
      );
      req.error(new ErrorEvent('Server error'));
    });
  });

  describe('fetchTuitionLessons', () => {
    const lessons = [{}, {}];

    it('should GET completed lessons', () => {
      spyOn(console, 'log');
      service.fetchTuitionLessons(11, 22).subscribe(response => {
        expect(response).toEqual(lessons);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/lessons/completed/11/22');
      expect(req.request.method).toBe('GET');
      req.flush(lessons);
      expect(console.log).toHaveBeenCalledWith('Fetched 2 lessons for tuition relating to 22, 11');
    });

    it('should propagate error on failure', (done) => {
      spyOn(console, 'error');
      service.fetchTuitionLessons(33, 44).subscribe({
        next: () => fail('Should error'),
        error: err => {
          expect(console.error).toHaveBeenCalledWith('Error fetching lessons:', err);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8080/api/lessons/completed/33/44');
      req.error(new ErrorEvent('404 Not Found'));
    });
  });

  describe('fetchTuitionsNoChatHistory', () => {
    const mockProfiles = { content: [{ id:5 }], totalElements: 1 };

    beforeEach(() => {
      spyOn(AuthenticatedUser, 'getAuthUserToken').and.returnValue('abc.token');
    });

    it('should GET no-chat profiles with auth header', () => {
      spyOn(console, 'log');
      service.fetchTuitionsNoChatHistory(5, 2, 3, true).subscribe(response => {
        expect(response).toEqual(mockProfiles);
      });

      const req = httpMock.expectOne(r =>
        r.method === 'GET' &&
        r.url === 'http://localhost:8080/api/chats/noHistory/5?page=2&size=3&active=true'
      );
      const expectedHeaders = new HttpHeaders({ 'Authorization': 'Bearer abc.token' });
      expect(req.request.headers.get('Authorization')).toBe('Bearer abc.token');
      req.flush(mockProfiles);
      expect(console.log).toHaveBeenCalledWith('Fetched 1 profiles for tuition relating to 5');
    });

    it('should propagate error on failure', (done) => {
      spyOn(console, 'error');
      service.fetchTuitionsNoChatHistory(6, 0, 1, false).subscribe({
        next: () => fail('Should error'),
        error: err => {
          expect(console.error).toHaveBeenCalledWith('Error fetching profiles:', err);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8080/api/chats/noHistory/6?page=0&size=1&active=false');
      req.error(new ErrorEvent('Network failure'));
    });
  });
});
