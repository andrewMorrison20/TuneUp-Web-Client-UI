import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PaymentsService } from './payments.service';

import { of, throwError } from 'rxjs';
import {InvoiceDialogComponent} from "./Invoice-dialogue.component";
import {DomSanitizer} from "@angular/platform-browser";
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {UserDashboardModule} from "../user-dashboard.module";

describe('InvoiceDialogComponent', () => {
  let component: InvoiceDialogComponent;
  let fixture: ComponentFixture<InvoiceDialogComponent>;
  let paymentsService: jasmine.SpyObj<PaymentsService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<InvoiceDialogComponent>>;
  let sanitizer: DomSanitizer;
  const fakeBlob = new Blob(['pdf-content'], { type: 'application/pdf' });
  const fakeSafeUrl = {} as any;

  beforeEach(async () => {
    paymentsService = jasmine.createSpyObj('PaymentsService', ['getInvoice']);
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports:[UserDashboardModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { payment: { id: 123 } } },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: PaymentsService, useValue: paymentsService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    sanitizer = TestBed.inject(DomSanitizer);
    spyOn(sanitizer, 'bypassSecurityTrustResourceUrl').and.returnValue(fakeSafeUrl);

    fixture = TestBed.createComponent(InvoiceDialogComponent);
    component = fixture.componentInstance;
  });

  it('fetchInvoice success sets iframe url and flags', () => {
    paymentsService.getInvoice.and.returnValue(of(fakeBlob));
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob-url');
    component.ngOnInit();
    expect(paymentsService.getInvoice).toHaveBeenCalledWith(123);
    expect(component.invoiceBlob).toBe(fakeBlob);
    expect(window.URL.createObjectURL).toHaveBeenCalledWith(fakeBlob);
    expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('blob-url');
    expect(component.safeInvoiceUrl).toBe(fakeSafeUrl);
    expect(component.invoiceLoaded).toBeTrue();
    expect(component.errorMessage).toBeNull();
  });

  it('fetchInvoice error sets errorMessage', () => {
    paymentsService.getInvoice.and.returnValue(throwError(() => new Error()));
    component.fetchInvoice();
    expect(component.errorMessage).toBe('Error fetching invoice. Please try again later.');
    expect(component.invoiceLoaded).toBeFalse();
    expect(component.safeInvoiceUrl).toBeNull();
  });

  it('downloadInvoice does nothing when no blob', () => {
    spyOn(window.URL, 'createObjectURL');
    spyOn(window.URL, 'revokeObjectURL');
    const clickSpy = spyOn(HTMLAnchorElement.prototype, 'click');
    component.invoiceBlob = null;
    component.downloadInvoice();
    expect(window.URL.createObjectURL).not.toHaveBeenCalled();
    expect(clickSpy).not.toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  it('downloadInvoice creates link, clicks and revokes', () => {
    component.invoiceBlob = fakeBlob;
    (component.data.payment.id as any) = 456;
    const createSpy = spyOn(window.URL, 'createObjectURL').and.returnValue('download-url');
    const revokeSpy = spyOn(window.URL, 'revokeObjectURL');
    const clickSpy = spyOn(HTMLAnchorElement.prototype, 'click');
    component.downloadInvoice();
    expect(createSpy).toHaveBeenCalledWith(fakeBlob);
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalledWith('download-url');
  });

  it('closeDialog closes the dialog reference', () => {
    component.closeDialog();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
