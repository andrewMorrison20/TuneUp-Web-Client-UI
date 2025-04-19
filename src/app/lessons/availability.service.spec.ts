import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { AvailabilityService } from './availability.service';
import { AuthenticatedUser } from '../authentication/authenticated-user.class';


describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Spy on AuthenticatedUser static methods
    spyOn(AuthenticatedUser, 'getAuthUserToken').and.returnValue('fake-token');
    spyOn(AuthenticatedUser, 'getAuthUserProfileId').and.returnValue(123);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AvailabilityService]
    });

    service = TestBed.inject(AvailabilityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should post createAvailability', () => {
    service.createAvailability(1, '2025-01-01T10:00', '2025-01-01T11:00')
      .subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/availability/1');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ profileId: 1, startTime: '2025-01-01T10:00', endTime: '2025-01-01T11:00' });
    req.flush({});
  });

  it('should post sendAvailabilityRequest', () => {
    const body = {
      requestedStartTime: 's',
      requestedEndTime: 'e',
      studentProfileId: 10,
      tutorProfileId: 20,
      status: 'PENDING',
      availabilityId: 5,
      lessonType: null
    };
    service.sendAvailabilityRequest('s', 'e', 10, 20, 5, null).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/lessonRequest');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('should getLessonRequestsByIds with headers and params', () => {
    service.getLessonRequestsByIds(10, 20, 1, 2).subscribe();

    const req = httpMock.expectOne(r => r.url === 'http://localhost:8080/api/lessonRequest');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('studentId')).toBe('10');
    expect(req.request.params.get('tutorId')).toBe('20');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('2');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    req.flush([]);
  });

  it('should fetchRequestProfiles with params', () => {
    service.fetchRequestProfiles(99, 3, 4).subscribe();

    const req = httpMock.expectOne(r => r.url === 'http://localhost:8080/api/lessonRequest/students/99');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('3');
    expect(req.request.params.get('size')).toBe('4');
    req.flush([]);
  });

  it('should patch updateLessonRequestStatus', () => {
    service.updateLessonRequestStatus(7, 'CONFIRMED', true).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/lessonRequest/status/7');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'CONFIRMED', autoDeclineConflicts: true });
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    req.flush({});
  });

  it('should fetchTuitions with params', () => {
    service.fetchTuitions(55, false, 0, 5).subscribe();

    const req = httpMock.expectOne(r => r.url === 'http://localhost:8080/api/tuitions/tuitionsByProfile/55');
    expect(req.request.params.get('active')).toBe('false');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('5');
    req.flush([]);
  });

  it('should getTuitionSummary with params', () => {
    service.getTuitionSummary(8, 9).subscribe();

    const req = httpMock.expectOne(r => r.url === 'http://localhost:8080/api/tuitions/byStudentAndTutor');
    expect(req.request.params.get('studentProfileId')).toBe('8');
    expect(req.request.params.get('tutorProfileId')).toBe('9');
    req.flush({});
  });

  it('should getTuitionLessonSummary taps console.log', () => {
    spyOn(console, 'log');
    service.getTuitionLessonSummary(3, 'a', 'b').subscribe();

    const req = httpMock.expectOne(r => r.url === 'http://localhost:8080/api/lessons/3');
    expect(req.request.params.get('start')).toBe('a');
    expect(req.request.params.get('end')).toBe('b');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    req.flush([]);
    expect(console.log).toHaveBeenCalledWith('Request Sent Successfully');
  });

  it('should getAllLessons with HttpParams', () => {
    service.getAllLessons(4, 's', 'e').subscribe();

    const req = httpMock.expectOne(r => r.url === 'http://localhost:8080/api/lessons/profileLessons/4');
    expect(req.request.params.get('start')).toBe('s');
    expect(req.request.params.get('end')).toBe('e');
    req.flush({});
  });

  it('should patch updateAvailability', () => {
    service.updateAvailability(12, 'st', 'et').subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/availability/update/123');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ id: 12, startTime: 'st', endTime: 'et' });
    req.flush({});
  });

  it('should deleteAvailability with params', () => {
    service.deleteAvailability(99).subscribe();

    const req = httpMock.expectOne(r => r.url === 'http://localhost:8080/api/availability/delete/123');
    expect(req.request.method).toBe('DELETE');
    expect(req.request.params.get('availabilityId')).toBe('99');
    req.flush({});
  });

  it('should getPeriodAvailabilityForProfile', () => {
    service.getPeriodAvailabilityForProfile(77, 'st', 'en').subscribe();

    const req = httpMock.expectOne(r => r.url === 'http://localhost:8080/api/availability/77/period');
    expect(req.request.params.get('start')).toBe('st');
    expect(req.request.params.get('end')).toBe('en');
    req.flush([]);
  });

  it('should fetchLessonSummaryByAvailabilityId', () => {
    service.fetchLessonSummaryByAvailabilityId(22).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/lessons/byAvailability/22');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should cancelLessonById with headers and params', () => {
    service.cancelLessonById(5, true).subscribe();

    const req = httpMock.expectOne(r => r.url === 'http://localhost:8080/api/lessons/cancel/5');
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    expect(req.request.params.get('resetAvailability')).toBe('true');
    req.flush({});
  });

  it('should batchCreateAvailability', () => {
    const slots = [{ start: 'a', end: 'b' }];
    service.batchCreateAvailability(6, slots).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/availability/6/batchCreate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(slots);
    req.flush({});
  });

  it('should updateLessonStatus with headers and params', () => {
    service.updateLessonStatus('foo', 3).subscribe();

    const req = httpMock.expectOne(r => r.url === 'http://localhost:8080/api/lessons/updateStatus/3');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    expect(req.request.params.get('lessonStatus')).toBe('foo');
    req.flush({});
  });
});
