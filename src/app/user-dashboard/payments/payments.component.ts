import {Component, Inject, OnInit} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ViewChild } from '@angular/core';
import {TuitionsService} from "../my-tuitions/tuitions.service";
import {AuthenticatedUser} from "../../authentication/authenticated-user.class";
import {tap} from "rxjs/operators";
import {catchError, EMPTY} from "rxjs";
import {TutorProfile} from "../../profiles/interfaces/tutor.model";
import {StudentProfile} from "../../profiles/interfaces/student.model";
import {LessonSummary} from "../my-tuitions/tuition-summary/lesson-summary/lesson-summary.model";

interface Payment {
  name: string;
  lessonDate: string;
  amount: string;
  status: 'Due' | 'Paid' | 'Overdue';
  dueDate: string;
  paidOn?: string;
}
type Profile = TutorProfile | StudentProfile;
@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  paymentForm: FormGroup;
  statuses = ['All', 'Due', 'Paid', 'Overdue'];
  selectedStatus = 'All';
  payments: Payment[] = [];
  displayedColumns: string[] = ['name', 'lessonDate', 'amount', 'status', 'dueDate', 'actions'];
  dataSource = new MatTableDataSource<Payment>(this.payments);
  profiles: Profile[] = [];
  lessons: LessonSummary [] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private fb: FormBuilder, private dialog: MatDialog,private tuitionsService:TuitionsService) {
    this.paymentForm = this.fb.group({
      tuition: [''],
      lesson: [''],
      amount: [''],
      invoice: [null],
      dueDate: ['']
    });
  }

  ngOnInit(): void {
    this.fetchPayments();
    this.fetchTuitions();
  }

  fetchPayments(): void {
    // TODO: Replace with real API call
    this.payments = [
      { name: 'John Doe', lessonDate: '2024-02-25', amount: '$100', status: 'Due', dueDate: '2024-03-01' },
      { name: 'Jane Smith', lessonDate: '2024-02-20', amount: '$120', status: 'Paid', dueDate: '2024-02-22', paidOn: '2024-02-22' },
      { name: 'Alice Brown', lessonDate: '2024-02-10', amount: '$80', status: 'Overdue', dueDate: '2024-02-15' }
    ];
    this.dataSource = new MatTableDataSource<Payment>(this.payments);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(): void {
    if (this.selectedStatus === 'All') {
      this.dataSource.data = this.payments;
    } else {
      this.dataSource.data = this.payments.filter(p => p.status === this.selectedStatus);
    }
  }

  submitPayment(): void {
    console.log('Submitting payment:', this.paymentForm.value);
    // TODO: Implement API call for submitting payment
  }

  viewInvoice(payment: Payment): void {
    this.dialog.open(InvoiceDialogComponent, {
      data: { payment }
    });
  }

  sendReminder(payment: Payment): void {
    console.log('Sending reminder for:', payment);
    // TODO: Implement API call to send reminders
  }

  //THIS NEEDS CHANGED< DONT WANT PAGINATION
  fetchTuitions() {
    this.isLoading = true;
    const profileId = AuthenticatedUser.getAuthUserProfileId();
    this.tuitionsService.fetchTuitions(profileId, true, this.pageIndex, this.pageSize)
      .pipe(
        tap(response => {
          this.profiles = response.content;
          this.totalElements = response.totalElements;
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

    var studentId = null;
    var tutorId = null;

    if(AuthenticatedUser.getAuthUserProfileType() ==='Tutor'){
       studentId = profileId;
       tutorId =AuthenticatedUser.getAuthUserProfileId()
    } else{
      studentId = AuthenticatedUser.getAuthUserProfileId();
      tutorId = profileId
    }
    this.tuitionsService.fetchTuitionLessons(studentId,tutorId)
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
}

@Component({
  selector: 'app-invoice-dialog',
  template: `
    <h1 mat-dialog-title>Invoice</h1>
    <div mat-dialog-content>
      <p>Invoice details for {{data.payment.name}}</p>
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
