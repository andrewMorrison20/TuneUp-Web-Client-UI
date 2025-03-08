import {Component, HostListener, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
import { TuitionsService } from '../my-tuitions/tuitions.service';
import { AuthenticatedUser } from '../../authentication/authenticated-user.class';
import {tap, catchError, take} from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { TutorProfile } from '../../profiles/interfaces/tutor.model';
import { StudentProfile } from '../../profiles/interfaces/student.model';
import { LessonSummary } from '../my-tuitions/tuition-summary/lesson-summary/lesson-summary.model';
import {PaymentsService} from "./payments.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DeleteConfirmationDialog} from "./DeleteConfirmationDialog";

interface Payment {
  id?: any;
  displayName?: string;
  lessonDate: string;
  tuitionId:number,
  amount: string;
  status?: 'Due' | 'Paid' | 'Overdue';
  dueDate: string;
  paidOn?: string;
  invoiceUrl?: string;
  lessonId:number;
}

type Profile = TutorProfile | StudentProfile;

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  dropdownOpen = false;
  paymentForm: FormGroup;
  statuses = ['All', 'Due', 'Paid', 'Overdue'];
  selectedStatus = 'All';
  payments: Payment[] = [];
  displayedColumns: string[] = ['select', 'displayName', 'lessonDate', 'amount', 'status', 'dueDate', 'actions'];
  dataSource = new MatTableDataSource<Payment>(this.payments);
  profiles: Profile[] = [];
  lessons: LessonSummary[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  isLoading = true;
  selectedPayments: Payment[] = [];
  reminderSentOn: string | null = null;
  selectedFileName: string | null = null;
  sortField: string = 'dueDate';
  sortDirection: 'asc' | 'desc' = 'desc'

  selectedProfileId: number | null = null


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private fb: FormBuilder,
              private dialog: MatDialog,
              private tuitionsService: TuitionsService,
              private paymentsService: PaymentsService,
              private snackBar: MatSnackBar) {
    this.paymentForm = this.fb.group({
      tuition: ['', Validators.required],
      lessonId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      invoice: [null, [this.fileValidator]],
      dueDate: ['', [Validators.required, this.futureDateValidator]],
      tuitionId: ['', [Validators.required, Validators.min(1)]],
      lessonDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.fetchPayments();
    this.fetchTuitions();
  }


  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }



  @HostListener('document:click', ['$event'])
  closeDropdownOnOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.sort-filter-container')) {
      this.dropdownOpen = false;
    }
  }

  futureDateValidator(control: any) {
    if (!control.value) {
      return null;
    }
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today ? null : {pastDate: true};
  }

  onLessonChange(lessonId: number): void {
    const selectedLesson = this.lessons.find(lesson => lesson.id === lessonId);

    if (selectedLesson) {
      this.paymentForm.patchValue({
        tuitionId: selectedLesson.tuitionId,
        lessonDate: selectedLesson.availabilityDto.startTime,
        lessonId: selectedLesson.id
      });

      console.log(selectedLesson)

    }
  }

  onTabChange(event: any): void {
    this.selectedStatus = this.statuses[event.index];
    this.pageIndex = 0;
    this.fetchPayments();
  }


  fileValidator(control: any) {
    if (!control.value) {
      return null;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const file = control.value;

    if (!allowedTypes.includes(file.type)) {
      return {invalidFileType: true};
    }

    if (file.size > maxSize) {
      return {fileTooLarge: true};
    }

    return null;
  }

  formatDateToISO(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19); // Trim timezone (Z) if backend doesn't support it
  }

  submitPayment(): void {
    if (this.paymentForm.invalid) return;

    const formattedDueDate = this.formatDateToISO(this.paymentForm.value.dueDate);

    const paymentData: Payment = {
      amount: this.paymentForm.value.amount,
      dueDate: formattedDueDate,
      lessonId: this.paymentForm.value.lessonId,
      lessonDate: this.paymentForm.value.lessonDate,
      tuitionId: this.paymentForm.value.tuitionId
    };

    const invoiceFile = this.paymentForm.value.invoice;

    if (invoiceFile) {
      // Upload invoice first since we need url for payment creation
      this.paymentsService.uploadInvoice(invoiceFile)
        .pipe(take(1))
        .subscribe({
          next: (invoiceUrl) => {
            paymentData.invoiceUrl = invoiceUrl;

            // Create payment with invoice URL
            this.paymentsService.createPayment(paymentData)
              .pipe(take(1))
              .subscribe({
                next: () => {
                  console.log('Payment created with invoice');
                  this.fetchPayments();
                },
                error: (err) => console.error('Error creating payment:', err)
              });
          },
          error: (err) => console.error('Invoice upload failed:', err)
        });
    } else {
      // No invoice, create payment directly
      this.paymentsService.createPayment(paymentData)
        .pipe(take(1))
        .subscribe({
          next: () => {
            console.log('Payment created without invoice');
            this.fetchPayments();
            this.snackBar.open('Payment successfully created!', 'OK', {duration: 3000});
            setTimeout(() => {
              window.location.reload();
            }, 1000)
          },
          error: (err) => console.error('Error creating payment:', err)
        });
    }
  }

  toggleRow(payment: Payment): void {
    const index = this.selectedPayments.findIndex(p => p.id === payment.id);
    if (index > -1) {
      this.selectedPayments.splice(index, 1);
    } else {
      this.selectedPayments.push(payment);
    }
  }

  removeSelectedFile(fileInput: HTMLInputElement): void {
    this.paymentForm.patchValue({invoice: null});
    this.paymentForm.get('invoice')?.updateValueAndValidity();
    this.paymentForm.patchValue({invoice: null});
    this.selectedFileName = null;
    fileInput.value = '';
  }

  toggleAllRows(): void {
    if (this.selectedPayments.length === this.payments.length) {
      this.selectedPayments = [];
    } else {
      this.selectedPayments = [...this.payments];
    }
  }

  markAsPaid(): void {
    if (!this.selectedPayments.length) return;

    const paymentIds = this.selectedPayments.map(p => p.id);
    this.paymentsService.markPaymentsAsPaid(paymentIds)
      .pipe(take(1))
      .subscribe(() => {
        console.log('Payments marked as paid');
        this.fetchPayments();
      });
  }

  fetchPayments(): void {
    this.isLoading = true;
    const profileId = AuthenticatedUser.getAuthUserProfileId();
    const statusParam = this.selectedStatus === 'All' ? null : this.selectedStatus;

    this.paymentsService.getPayments(profileId, statusParam, this.selectedProfileId, this.pageIndex, this.pageSize, this.sortField, this.sortDirection)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.payments = response.content;
          this.totalElements = response.totalElements;
          this.dataSource.data = this.payments;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching payments:', error);
          this.isLoading = false;
        }
      });
  }



  viewInvoice(payment: Payment): void {
    this.dialog.open(InvoiceDialogComponent, {
      data: {payment}
    });
  }

  sendReminder(paymentId: number): void {
    console.log('Sending reminder for:', paymentId);

    this.paymentsService.sendRemindForPayment(paymentId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.snackBar.open('Reminder sent successfully!', 'OK', {duration: 3000});
          this.fetchPayments();
        },
        error: (err) => {
          console.error('Error sending reminder:', err);
          this.snackBar.open('Failed to send reminder. Try again later.', 'Close', {duration: 3000});
        }
      });
  }


  fetchTuitions() {
    this.isLoading = true;
    const profileId = AuthenticatedUser.getAuthUserProfileId();
    this.tuitionsService.fetchTuitions(profileId, true)
      .pipe(
        tap(response => {
          this.profiles = response.content;
          this.isLoading = false;
        }),
        catchError(error => {
          console.error('Error fetching profiles:', error);
          this.isLoading = false;
          return EMPTY;
        })
      )
      .subscribe();
  }

  fetchLessons(profileId: number) {
    this.isLoading = true;
    let studentId = AuthenticatedUser.getAuthUserProfileType() === 'Tutor' ? profileId : AuthenticatedUser.getAuthUserProfileId();
    let tutorId = AuthenticatedUser.getAuthUserProfileType() === 'Tutor' ? AuthenticatedUser.getAuthUserProfileId() : profileId;

    this.tuitionsService.fetchTuitionLessons(studentId, tutorId)
      .pipe(
        tap(lessons => {
          this.lessons = lessons;
          this.isLoading = false;
        }),
        catchError(error => {
          console.error('Error fetching lessons:', error);
          this.isLoading = false;
          return EMPTY;
        })
      )
      .subscribe();
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.paymentForm.patchValue({invoice: file});
      this.paymentForm.get('invoice')?.updateValueAndValidity();
      this.selectedFileName = file.name;
    }
  }

  hasPaidPayments(): boolean {
    return this.selectedPayments.some(payment => payment.status === 'Paid');
  }

  protected readonly AuthenticatedUser = AuthenticatedUser;


  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchPayments();
  }

  applySorting(sortField: string): void {
    this.sortField = sortField;
    this.sortDirection = 'asc';
    this.fetchPayments();
  }


  applyProfileFilter(): void {
    this.pageIndex = 0;
    this.fetchPayments();
  }

  resetFilters(): void {
    this.selectedProfileId = null;
    this.pageIndex = 0;
    this.fetchPayments();
  }

  confirmDeletePayments(): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialog, {
      width: '400px',
      data: { count: this.selectedPayments.length }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deletePayments();
      }
    });
  }

  deletePayments(): void {
    const paymentIds = this.selectedPayments.map(p => p.id);

    this.paymentsService.deletePayments(paymentIds).subscribe({
      next: () => {
        this.snackBar.open('Payments deleted successfully!', 'OK', { duration: 3000 });
        this.fetchPayments();
      },
      error: (err) => {
        console.error('Error deleting payments:', err);
        this.snackBar.open('Failed to delete payments. Try again later.', 'Close', { duration: 3000 });
      }
    });
  }
}
@Component({
  selector: 'app-invoice-dialog',
  template: `
    <h1 mat-dialog-title>Invoice</h1>
    <div mat-dialog-content>
      <p>Invoice details for {{data.payment.displayName}}</p>
      <p>Amount: {{data.payment.amount}}</p>
      <p>Status: {{data.payment.status}}</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Close</button>
    </div>
  `
})
export class InvoiceDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { payment: Payment }) {}
}
