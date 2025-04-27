import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PaymentsComponent, Payment } from './payments.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TuitionsService } from '../my-tuitions/tuitions.service';
import { PaymentsService } from './payments.service';
import { of, throwError } from 'rxjs';
import { AuthenticatedUser } from '../../authentication/authenticated-user.class';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../shared/shared.module';


describe('PaymentsComponent', () => {

  let component: PaymentsComponent;
  let fixture: ComponentFixture<PaymentsComponent>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockTuitionsService: jasmine.SpyObj<TuitionsService>;
  let mockPaymentsService: jasmine.SpyObj<PaymentsService>;

  beforeAll(() => {
    // Intercept every call to reloadPage on ALL instances:
    spyOn(PaymentsComponent.prototype, 'reloadPage').and.callFake(() => {});
  });

  beforeEach(async () => {
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockTuitionsService = jasmine.createSpyObj('TuitionsService', ['fetchTuitions', 'fetchTuitionLessons']);
    mockPaymentsService = jasmine.createSpyObj('PaymentsService', [
      'getPayments', 'uploadInvoice', 'createPayment', 'markPaymentsAsPaid', 'sendRemindForPayment', 'deletePayments'
    ]);

    // Default stubs
    mockPaymentsService.getPayments.and.returnValue(of({ content: [], totalElements: 0 } as any));
    mockTuitionsService.fetchTuitions.and.returnValue(of({ content: [] } as any));

    spyOn(AuthenticatedUser, 'getAuthUserProfileId').and.returnValue(1);
    spyOn(AuthenticatedUser, 'getAuthUserProfileType').and.returnValue('Tutor');

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SharedModule, NoopAnimationsModule],
      declarations: [PaymentsComponent],
      providers: [
        FormBuilder,
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: TuitionsService, useValue: mockTuitionsService },
        { provide: PaymentsService, useValue: mockPaymentsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should toggle dropdown open state', () => {
    expect(component.dropdownOpen).toBeFalse();
    component.toggleDropdown();
    expect(component.dropdownOpen).toBeTrue();
    component.toggleDropdown();
    expect(component.dropdownOpen).toBeFalse();
  });

  it('should close dropdown on outside click', () => {
    component.dropdownOpen = true;
    const fakeEvent = { target: { closest: () => null } } as any;
    component.closeDropdownOnOutsideClick(fakeEvent);
    expect(component.dropdownOpen).toBeFalse();
  });

  it('futureDateValidator should invalidate past dates', () => {
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const result = (component as any).futureDateValidator({ value: yesterday.toISOString() });
    expect(result).toEqual({ pastDate: true });
  });

  it('futureDateValidator should validate today or future', () => {
    const today = new Date();
    const result = (component as any).futureDateValidator({ value: today.toISOString() });
    expect(result).toBeNull();
  });

  it('fileValidator should invalidate wrong type or large size', () => {
    const badType = { type: 'text/plain', size: 100 };
    expect((component as any).fileValidator({ value: badType })).toEqual({ invalidFileType: true });
    const largeFile = { type: 'application/pdf', size: 6 * 1024 * 1024 };
    expect((component as any).fileValidator({ value: largeFile })).toEqual({ fileTooLarge: true });
  });

  it('fileValidator should validate correct file', () => {
    const okFile = { type: 'application/pdf', size: 1024 };
    expect((component as any).fileValidator({ value: okFile })).toBeNull();
  });

  it('formatDateToISO should convert date string to UTC ISO without timezone', () => {
    const input = '2025-04-20T10:00:00';
    const result = component.formatDateToISO(input);
    const expected = new Date(input).toISOString().slice(0, 19);
    expect(result).toBe(expected);
  });

  describe('submitPayment without invoice', () => {
    beforeEach(() => {
      component.paymentForm.patchValue({
        tuition:    1,
        lessonId:   2,
        amount:     100,
        invoice:    null,
        dueDate:    '2026-04-21',
        tuitionId:  3,
        lessonDate: '2025-04-20T10:00:00'
      });
      mockPaymentsService.createPayment.and.returnValue(of(null));
    });

    it('should create payment', fakeAsync(() => {
      component.submitPayment();
      tick(1000);

      expect(mockPaymentsService.createPayment).toHaveBeenCalled();
      expect(mockSnackBar.open)
        .toHaveBeenCalledWith('Payment successfully created!', 'OK', { duration: 3000 });
    }));
  });

  describe('submitPayment with invoice', () => {
    let fakeFile: File;

    beforeEach(() => {
      fakeFile = new File(['dummy'], 'invoice.pdf', { type: 'application/pdf' });

      component.paymentForm.patchValue({
        tuition:    1,
        lessonId:   5,
        amount:     200,
        invoice:    fakeFile,
        dueDate:    '2036-04-22',
        tuitionId:  6,
        lessonDate: '2025-04-22T12:00:00'
      });

      mockPaymentsService.uploadInvoice.and.returnValue(of('http://url'));
      mockPaymentsService.createPayment.and.returnValue(of(null));
    });

    it('should upload invoice then create payment', fakeAsync(() => {
      expect(component.paymentForm.valid).toBeTrue();

      component.submitPayment();
      tick(); // uploadInvoice
      tick(); // createPayment

      expect(mockPaymentsService.uploadInvoice)
        .toHaveBeenCalledWith(fakeFile);
      expect(mockPaymentsService.createPayment)
        .toHaveBeenCalledWith(jasmine.objectContaining({
          invoiceUrl: 'http://url',
          amount:     200,
          lessonId:   5,
          lessonDate: '2025-04-22T12:00:00',
          tuitionId:  6
        }));
    }));
  });

  it('toggleRow should add and remove payment', () => {
    const pay: Payment = { id: 1, lessonDate: '', tuitionId: 0, amount: '', dueDate: '', lessonId: 0 };
    component.toggleRow(pay);
    expect(component.selectedPayments).toContain(pay);
    component.toggleRow(pay);
    expect(component.selectedPayments).not.toContain(pay);
  });

  it('toggleAllRows should select and deselect all', () => {
    component.payments = [{ id: 1, lessonDate: '', tuitionId: 0, amount: '', dueDate: '', lessonId: 0 }];
    component.toggleAllRows();
    expect(component.selectedPayments.length).toBe(1);
    component.toggleAllRows();
    expect(component.selectedPayments.length).toBe(0);
  });

  it('hasPaidPayments should detect paid', () => {
    component.selectedPayments = [{ status: 'Paid', lessonDate: '', tuitionId: 0, amount: '', dueDate: '', lessonId: 0 } as any];
    expect(component.hasPaidPayments()).toBeTrue();
  });

  it('onFileSelect should patch form and set fileName', () => {
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    const event: any = { target: { files: [file] } };
    component.onFileSelect(event);
    expect(component.selectedFileName).toBe('test.pdf');
    expect(component.paymentForm.value.invoice).toBe(file);
  });

  it('onLessonChange should patch lesson fields', () => {
    component.lessons = [{ id: 10, tuitionId: 20, availabilityDto: { startTime: '2025-04-23T09:00:00' } } as any];
    component.onLessonChange(10);
    expect(component.paymentForm.value.lessonDate).toBe('2025-04-23T09:00:00');
    expect(component.paymentForm.value.tuitionId).toBe(20);
  });

  it('onTabChange should update status and fetch payments', () => {
    spyOn(component, 'fetchPayments');
    component.onTabChange({ index: 2 });
    expect(component.selectedStatus).toBe(component.statuses[2]);
    expect(component.pageIndex).toBe(0);
    expect(component.fetchPayments).toHaveBeenCalled();
  });

  it('applySorting should set sort and fetch', () => {
    spyOn(component, 'fetchPayments');
    component.applySorting('amount');
    expect(component.sortField).toBe('amount');
    expect(component.sortDirection).toBe('asc');
    expect(component.fetchPayments).toHaveBeenCalled();
  });

  it('applyProfileFilter should reset page and fetch', () => {
    spyOn(component, 'fetchPayments');
    component.applyProfileFilter();
    expect(component.pageIndex).toBe(0);
    expect(component.fetchPayments).toHaveBeenCalled();
  });

  it('resetFilters should clear profileId and fetch', () => {
    spyOn(component, 'fetchPayments');
    component.selectedProfileId = 5;
    component.resetFilters();
    expect(component.selectedProfileId).toBeNull();
    expect(component.pageIndex).toBe(0);
    expect(component.fetchPayments).toHaveBeenCalled();
  });

  it('onPageChange should update page and fetch', () => {
    spyOn(component, 'fetchPayments');
    component.onPageChange({ pageIndex: 3, pageSize: 15, length: 0 } as any);
    expect(component.pageIndex).toBe(3);
    expect(component.pageSize).toBe(15);
    expect(component.fetchPayments).toHaveBeenCalled();
  });

  it('viewInvoice should open dialog', () => {
    const pay: Payment = { lessonDate: '', tuitionId: 0, amount: '', dueDate: '', lessonId: 0 } as any;
    component.viewInvoice(pay);
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('sendReminder success and error', fakeAsync(() => {
    mockPaymentsService.sendRemindForPayment.and.returnValue(of(null));
    spyOn(component, 'fetchPayments');
    component.sendReminder(1);
    tick();
    expect(mockSnackBar.open).toHaveBeenCalledWith('Reminder sent successfully!', 'OK', { duration: 3000 });
    expect(component.fetchPayments).toHaveBeenCalled();

    mockPaymentsService.sendRemindForPayment.and.returnValue(throwError(() => new Error()));
    component.sendReminder(1);
    tick();
    expect(mockSnackBar.open).toHaveBeenCalledWith('Failed to send reminder. Try again later.', 'Close', { duration: 3000 });
  }));

  it('deletePayments should call service and fetch', () => {
    component.selectedPayments = [{ id: 7, lessonDate: '', tuitionId: 0, amount: '', dueDate: '', lessonId: 0 } as any];
    mockPaymentsService.deletePayments.and.returnValue(of(null));
    spyOn(component, 'fetchPayments');
    component.deletePayments();
    expect(mockSnackBar.open).toHaveBeenCalledWith('Payments deleted successfully!', 'OK', { duration: 3000 });
    expect(component.fetchPayments).toHaveBeenCalled();

    mockPaymentsService.deletePayments.and.returnValue(throwError(() => new Error()));
    component.deletePayments();
    expect(mockSnackBar.open).toHaveBeenCalledWith('Failed to delete payments. Try again later.', 'Close', { duration: 3000 });
  });

  it('fetchPayments success and error', fakeAsync(() => {
    mockPaymentsService.getPayments.and.returnValue(of({ content: [], totalElements: 0 } as any));
    component.fetchPayments();
    tick();
    expect(component.payments).toEqual([]);

    mockPaymentsService.getPayments.and.returnValue(throwError(() => new Error()));
    component.fetchPayments();
    tick();
    expect(component.isLoading).toBeFalse();
  }));

  it('fetchTuitions success and error', fakeAsync(() => {
    mockTuitionsService.fetchTuitions.and.returnValue(of({ content: [{}, {}] } as any));
    component.fetchTuitions();
    tick();
    expect(component.profiles.length).toBe(2);

    mockTuitionsService.fetchTuitions.and.returnValue(throwError(() => new Error()));
    component.fetchTuitions();
    tick();
    expect(component.isLoading).toBeFalse();
  }));

  it('fetchLessons success and error', fakeAsync(() => {
    mockTuitionsService.fetchTuitionLessons.and.returnValue(of([{ id: 1 } as any]));
    component.fetchLessons(1);
    tick();
    expect(component.lessons.length).toBe(1);

    mockTuitionsService.fetchTuitionLessons.and.returnValue(throwError(() => new Error()));
    component.fetchLessons(1);
    tick();
    expect(component.isLoading).toBeFalse();
  }));

  it('confirmDeletePayments should open confirmation dialog', () => {
    component.selectedPayments = [{ id: 1, lessonDate: '', tuitionId: 0, amount: '', dueDate: '', lessonId: 0 } as any];
    const ref = { afterClosed: () => of(true) };
    mockDialog.open.and.returnValue(ref as any);
    spyOn(component, 'deletePayments');
    component.confirmDeletePayments();
    expect(mockDialog.open).toHaveBeenCalledWith(DeleteConfirmationDialog, jasmine.any(Object));
  });

  describe('markAsPaid', () => {
    it('should do nothing when no payments selected', () => {
      component.selectedPayments = [];
      mockPaymentsService.markPaymentsAsPaid.and.throwError('should not call');
      component.markAsPaid();
      expect(mockPaymentsService.markPaymentsAsPaid).not.toHaveBeenCalled();
    });

    it('should call service and then fetchPayments when payments selected', fakeAsync(() => {
      spyOn(component, 'fetchPayments');
      component.selectedPayments = [
        { id: 42, lessonDate: '', tuitionId: 0, amount: '', dueDate: '', lessonId: 0 } as any,
        { id: 99, lessonDate: '', tuitionId: 0, amount: '', dueDate: '', lessonId: 0 } as any,
      ];
      mockPaymentsService.markPaymentsAsPaid.and.returnValue(of(null));
      component.markAsPaid();
      tick();
      expect(mockPaymentsService.markPaymentsAsPaid).toHaveBeenCalledWith([42, 99]);
      expect(component.fetchPayments).toHaveBeenCalled();
    }));
  });

  describe('removeSelectedFile', () => {
    it('should clear invoice control, selectedFileName and reset the input element', () => {
      const fakeFile = new File([''], 'foo.pdf', { type: 'application/pdf' });
      component.paymentForm.patchValue({ invoice: fakeFile });
      component.selectedFileName = 'foo.pdf';
      const input = document.createElement('input');
      input.value = 'someFileName';
      component.removeSelectedFile(input);
      expect(component.paymentForm.value.invoice).toBeNull();
      expect(component.paymentForm.get('invoice')!.valid).toBeTrue();
      expect(component.selectedFileName).toBeNull();
      expect(input.value).toBe('');
    });
  });
});
