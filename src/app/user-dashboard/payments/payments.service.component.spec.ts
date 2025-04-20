import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PaymentsService } from './payments.service';
import { AuthenticatedUser } from '../../authentication/authenticated-user.class';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api/payments';

  beforeEach(() => {
    spyOn(AuthenticatedUser, 'getAuthUserToken').and.returnValue('fake-token');
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymentsService]
    });
    service = TestBed.inject(PaymentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getPayments should call GET with correct params', () => {
    service.getPayments(1, 'due', 2, 0, 10, 'field', 'asc').subscribe();

    const req = httpMock.expectOne(r =>
      r.method === 'GET' &&
      r.url === apiUrl
    );

    expect(req.request.params.get('profileId')).toBe('1');
    expect(req.request.params.get('status')).toBe('DUE');
    expect(req.request.params.get('profileFilterId')).toBe('2');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    expect(req.request.params.get('sort')).toBe('field,asc');

    req.flush({ content: [], totalElements: 0 });
  });


  it('createPayment should POST paymentData', () => {
    const data = { amount: 100 };
    service.createPayment(data).subscribe();
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush({});
  });

  it('markPaymentsAsPaid should PATCH to /mark-paid', () => {
    const ids = [1, 2, 3];
    service.markPaymentsAsPaid(ids).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/mark-paid`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(ids);
    req.flush({});
  });

  it('uploadInvoice should POST FormData and return text', () => {
    const fakeFile = new File([''], 'test.pdf', { type: 'application/pdf' });
    service.uploadInvoice(fakeFile).subscribe(res => {
      expect(res).toBe('uploaded-url');
    });
    const req = httpMock.expectOne(`${apiUrl}/upload-invoice`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush('uploaded-url', { status: 200, statusText: 'OK' });
  });

  it('deletePayments should DELETE with body', () => {
    const ids = [4, 5];
    service.deletePayments(ids).subscribe();
    const req = httpMock.expectOne(r =>
      r.method === 'DELETE' &&
      r.url === `${apiUrl}/delete`
    );
    expect(req.request.body).toEqual(ids);
    req.flush({});
  });

  it('sendRemindForPayment should PATCH to /send-reminder/:id', () => {
    service.sendRemindForPayment(7).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/send-reminder/7`);
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });

  it('getInvoice should GET blob with auth header', () => {
    service.getInvoice(9).subscribe(blob => {
      expect(blob).toBeTruthy();
    });
    const req = httpMock.expectOne(r =>
      r.method === 'GET' &&
      r.url === `${apiUrl}/invoice/9`
    );
    expect(req.request.responseType).toBe('blob');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    expect(req.request.headers.get('Accept')).toBe('application/pdf');
    req.flush(new Blob());
  });
});
