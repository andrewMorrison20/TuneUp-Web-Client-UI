import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { AccountSettingsService, AccountResponse } from './account-settings.service';
import { environment } from '../../environments/environment';

describe('AccountSettingsService', () => {
  let service: AccountSettingsService;
  let http: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AccountSettingsService]
    });
    service = TestBed.inject(AccountSettingsService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify(); // ensure no outstanding HTTP calls
  });

  it('should GET user details by ID', () => {
    const mock: AccountResponse = {
      id: 42,
      name: 'Alice',
      email: 'a@b.com',
      password: '',
      username: 'alice',
      address: {
        postcode: '12345',
        addressLine1: '1 Main St',
        city: 'Town',
        country: 'UK'
      }
    };

    service.getUserAccountDetails(42).subscribe(result => {
      expect(result).toEqual(mock);
    });

    const req = http.expectOne(`${baseUrl}/users/42`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('should PUT updated details', () => {
    const update: Partial<AccountResponse> = { name: 'Bob', email: 'bob@c.com' };
    const returned: AccountResponse = {
      id: 99,
      name: 'Bob',
      email: 'bob@c.com',
      password: '',
      username: 'bob'
    };

    service.updateUserDetails(99, update).subscribe(result => {
      expect(result).toEqual(returned);
    });

    const req = http.expectOne(`${baseUrl}/users/update`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ id: 99, ...update });
    req.flush(returned);
  });

  it('should DELETE (anonymise) the account and yield null', () => {
    service.deleteAccount().subscribe(result => {
      expect(result).toBeNull();
    });

    const req = http.expectOne(`${baseUrl}/users/anonymise`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
