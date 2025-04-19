import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountSettingsComponent } from './account-settings.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AccountSettingsService, AccountResponse } from './account-settings.service';
import {AddressDto, AddressService} from '../user-dashboard/update-profile/address/address-service.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AuthenticatedUser } from '../authentication/authenticated-user.class';

describe('AccountSettingsComponent', () => {
  let component: AccountSettingsComponent;
  let fixture: ComponentFixture<AccountSettingsComponent>;
  let accountServiceSpy: jasmine.SpyObj<AccountSettingsService>;
  let addressServiceSpy: jasmine.SpyObj<AddressService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockAccount: AccountResponse = { id: 123, name: 'Alice', email: 'a@b.com',password:'password', username:'test' };

  beforeEach(async () => {
    spyOn(AuthenticatedUser, 'getAuthUserId').and.returnValue(123);

    accountServiceSpy = jasmine.createSpyObj('AccountSettingsService', [
      'getUserAccountDetails',
      'updateUserDetails',
      'deleteAccount'
    ]);
    accountServiceSpy.getUserAccountDetails.and.returnValue(of(mockAccount));
    accountServiceSpy.updateUserDetails.and.returnValue(of({ ...mockAccount, name: 'Bob' }));
    accountServiceSpy.deleteAccount.and.returnValue(of(void 0));

    addressServiceSpy = jasmine.createSpyObj('AddressService', ['getAddressSuggestions']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AccountSettingsComponent],
      providers: [
        FormBuilder,
        { provide: AccountSettingsService, useValue: accountServiceSpy },
        { provide: AddressService, useValue: addressServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit
  });

  it('should load account details on init', () => {
    expect(accountServiceSpy.getUserAccountDetails).toHaveBeenCalledWith(123);
    expect(component.accountDetails).toEqual(mockAccount);
  });

  it('setFeedback sets message and type', () => {
    // @ts-ignore access private
    component['setFeedback']('test', 'success');
    expect(component.feedbackMessage).toBe('test');
    expect(component.feedbackType).toBe('success');
  });

  describe('onSubmitName', () => {
    it('shows error when form invalid', () => {
      component.nameForm.controls['name'].setValue('');
      component.onSubmitName();
      expect(accountServiceSpy.updateUserDetails).not.toHaveBeenCalled();
      expect(component.feedbackType).toBe('error');
      expect(component.feedbackMessage).toContain('valid');
    });

    it('calls service and shows success on valid', () => {
      component.nameForm.controls['name'].setValue('Charlie');
      component.onSubmitName();
      expect(accountServiceSpy.updateUserDetails)
        .toHaveBeenCalledWith(123, { name: 'Charlie' });
      expect(component.accountDetails!.name).toBe('Bob');
      expect(component.feedbackType).toBe('success');
      expect(component.feedbackMessage).toContain('updated successfully');
    });

    it('shows error on service failure', () => {
      accountServiceSpy.updateUserDetails.and.returnValue(throwError(() => new Error()));
      component.nameForm.controls['name'].setValue('Charlie');
      component.onSubmitName();
      expect(component.feedbackType).toBe('error');
      expect(component.feedbackMessage).toContain('Failed to update name');
    });
  });

  describe('onSubmitEmail', () => {
    it('shows error when invalid', () => {
      component.emailForm.controls['email'].setValue('not-an-email');
      component.onSubmitEmail();
      expect(accountServiceSpy.updateUserDetails).not.toHaveBeenCalled();
      expect(component.feedbackType).toBe('error');
    });

    it('updates on valid', () => {
      component.emailForm.controls['email'].setValue('x@y.com');
      component.onSubmitEmail();
      expect(accountServiceSpy.updateUserDetails)
        .toHaveBeenCalledWith(123, { email: 'x@y.com' });
      expect(component.feedbackType).toBe('success');
    });
  });

  describe('onSubmitAddress', () => {
    it('shows error when invalid', () => {
      component.addressForm.controls['postcode'].setValue('');
      component.onSubmitAddress();
      expect(accountServiceSpy.updateUserDetails).not.toHaveBeenCalled();
      expect(component.feedbackType).toBe('error');
    });

    it('updates on valid', () => {
      component.addressForm.setValue({
        postcode: '12345', addressLine1: 'A', addressLine2: '', city: 'C', country: 'X', latitude: null, longitude: null
      });
      component.onSubmitAddress();
      expect(accountServiceSpy.updateUserDetails)
        .toHaveBeenCalledWith(123, { address: component.addressForm.value });
      expect(component.feedbackType).toBe('success');
    });
  });

  describe('onSubmitPassword', () => {
    it('shows error when invalid', () => {
      component.passwordForm.controls['password'].setValue('short');
      component.passwordForm.controls['confirmPassword'].setValue('short');
      component.onSubmitPassword();
      expect(accountServiceSpy.updateUserDetails).not.toHaveBeenCalled();
      expect(component.feedbackType).toBe('error');
    });

    it('shows mismatch error', () => {
      component.passwordForm.controls['password'].setValue('longenough');
      component.passwordForm.controls['confirmPassword'].setValue('different');
      component.onSubmitPassword();
      expect(accountServiceSpy.updateUserDetails).not.toHaveBeenCalled();
      expect(component.feedbackMessage).toContain('do not match');
      expect(component.feedbackType).toBe('error');
    });

    it('updates on valid match', () => {
      component.passwordForm.controls['password'].setValue('longenough');
      component.passwordForm.controls['confirmPassword'].setValue('longenough');
      component.onSubmitPassword();
      expect(accountServiceSpy.updateUserDetails)
        .toHaveBeenCalledWith(123, { password: 'longenough' });
      expect(component.feedbackType).toBe('success');
    });
  });

  describe('address lookup and selection', () => {
    it('does not call service when fields missing', () => {
      component.addressForm.controls['postcode'].setValue('');
      component.addressForm.controls['addressLine1'].setValue('');
      component.onAddressSearch();
      expect(addressServiceSpy.getAddressSuggestions).not.toHaveBeenCalled();
    });

    it('calls service with valid inputs', () => {
      const fakeAddresses: AddressDto[] = [{
        id: 1,
        addressLine1: 'L1',
        addressLine2: '',
        city: 'X',
        postcode: 'P1',
        country: 'C1',
        latitude: 0,
        longitude: 0
      }];

      addressServiceSpy.getAddressSuggestions
        .and.returnValue(of(fakeAddresses));

      component.addressForm.controls['postcode'].setValue('pc');
      component.addressForm.controls['addressLine1'].setValue('st');

      component.onAddressSearch();

      expect(addressServiceSpy.getAddressSuggestions)
        .toHaveBeenCalledWith('pc', 'st');

      expect(component.addressSuggestions)
        .toEqual(fakeAddresses);
    });

    it('patches form on selectAddress', () => {
      const addr = { addressLine1: 'L1', addressLine2: 'L2', city: 'C', postcode: 'P', country: 'Co', latitude: 1, longitude: 2 };
      component.selectAddress(addr);
      expect(component.selectedAddress as any).toEqual(addr);
      expect(component.addressForm.value.addressLine1).toBe('L1');
    });
  });

  describe('onDeleteAccount', () => {
    it('does not delete if cancelled', () => {
      const dialogRef = { afterClosed: () => of(false) } as MatDialogRef<any>;
      dialogSpy.open.and.returnValue(dialogRef);
      component.onDeleteAccount();
      expect(accountServiceSpy.deleteAccount).not.toHaveBeenCalled();
    });

    it('deletes and shows success', () => {
      const dialogRef = { afterClosed: () => of(true) } as MatDialogRef<any>;
      dialogSpy.open.and.returnValue(dialogRef);
      accountServiceSpy.deleteAccount.and.returnValue(of(void 0));
      component.onDeleteAccount();
      expect(accountServiceSpy.deleteAccount).toHaveBeenCalled();
      expect(snackBarSpy.open).toHaveBeenCalledWith('Account deleted successfully.', 'Close', { duration: 3000 });
    });

    it('shows error on delete failure', () => {
      const dialogRef = { afterClosed: () => of(true) } as MatDialogRef<any>;
      dialogSpy.open.and.returnValue(dialogRef);
      accountServiceSpy.deleteAccount.and.returnValue(throwError(() => new Error()));
      component.onDeleteAccount();
      expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to delete account. Please try again.', 'Close', { duration: 4000 });
    });
  });
});
