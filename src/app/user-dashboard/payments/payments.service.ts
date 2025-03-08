import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private apiUrl = 'http://localhost:8080/api/payments';

  constructor(private http: HttpClient) {}

  getPayments(profileId: number, statusParam: string | null, pageIndex: number, pageSize: number): Observable<any> {
    let params = new HttpParams()
      .set("profileId", profileId.toString())
      .set("page", pageIndex.toString())
      .set("size", pageSize.toString());

    if (statusParam && statusParam.toUpperCase() !== 'ALL') {
      params = params.set("status", statusParam.toUpperCase());
    }

    return this.http.get<any>(`${this.apiUrl}`, { params });
  }




  createPayment(paymentData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, paymentData);
  }


  markPaymentsAsPaid(paymentIds: number[]): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/mark-paid`,  paymentIds );
  }

  uploadInvoice(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/upload-invoice`, formData, {
      responseType: 'text' as 'text'
    });
  }

  deletePayment(paymentId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${paymentId}`);
  }

  sendRemindForPayment(paymentId: number) {
    return this.http.patch<any>(`${this.apiUrl}/send-reminder/${paymentId}`,{})
  }
}
