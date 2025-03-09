import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PaymentsService } from './payments.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import {Payment} from "./payments.component";


@Component({
  selector: 'app-invoice-dialog',
  template: `
    <h1 mat-dialog-title>Invoice</h1>
    <div mat-dialog-content class="invoice-container">
      <iframe *ngIf="safeInvoiceUrl" [src]="safeInvoiceUrl"></iframe>
      <p *ngIf="errorMessage" class="error-text">{{ errorMessage }}</p>
    </div>
    <div mat-dialog-actions class="button-container">
      <button mat-button (click)="downloadInvoice()" [disabled]="!invoiceLoaded">Download Invoice</button>
      <button mat-button (click)="closeDialog()">Close</button>

    </div>
  `,
  styles: [`
    .invoice-container {
      width: 80vh;
      height: 80vh; /* Increase height */
      display: flex;
      justify-content: center;
      align-items: center;
    }

    iframe {
      width: 100%;
      height: 100%; /* Fill container */
      border: none;
      min-height: 600px; /* Ensure visibility */
    }

    .error-text {
      color: red;
      font-weight: bold;
      text-align: center;
    }

    .button-container {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }
  `]
})
export class InvoiceDialogComponent implements OnInit {
  safeInvoiceUrl: SafeResourceUrl | null = null;
  invoiceLoaded = false;
  errorMessage: string | null = null;
  invoiceBlob: Blob | null = null;

  constructor(
    public dialogRef: MatDialogRef<InvoiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { payment: Payment },
    private paymentsService: PaymentsService,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    console.log(this.data)
    this.fetchInvoice();
  }

  fetchInvoice(): void {
    console.log('payment',this.data.payment.id);
    this.paymentsService.getInvoice(this.data.payment.id).subscribe({
      next: (blob) => {
        this.invoiceBlob = blob;
        const url = window.URL.createObjectURL(blob);
        this.safeInvoiceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.invoiceLoaded = true;
      },
      error: () => {
        this.errorMessage = 'Error fetching invoice. Please try again later.';
      }
    });
  }

  downloadInvoice(): void {
    if (!this.invoiceBlob) return;

    const url = window.URL.createObjectURL(this.invoiceBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${this.data.payment.id}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}
