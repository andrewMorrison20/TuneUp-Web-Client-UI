import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import {AuthenticatedUser} from "../../authentication/authenticated-user.class";


@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private apiUrl = 'http://localhost:8080/api/payments';

  constructor(private http: HttpClient) {}

  getPayments(profileId: number, statusParam: string | null, profileFilterId: number | null, pageIndex: number, pageSize: number, sortField: string, sortDirection: string) {
    let params: any = {
      profileId: profileId.toString(),
      page: pageIndex.toString(),
      size: pageSize.toString(),
      sort: `${sortField},${sortDirection}`
    };

    if (statusParam) {
      params.status = statusParam.toUpperCase();
    }

    if (profileFilterId) {
      params.profileFilterId = profileFilterId.toString();
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

  deletePayments(paymentIds: any[]): Observable<any> {
    return this.http.request<any>('DELETE', `${this.apiUrl}/delete`, {
      body: paymentIds
    });
  }

  sendRemindForPayment(paymentId: number) {
    return this.http.patch<any>(`${this.apiUrl}/send-reminder/${paymentId}`,{})
  }

  //Yet another instance of auth interceptor being bypassed by a single method in the same service!
  getInvoice(paymentId: number): Observable<Blob> {
    const authToken = AuthenticatedUser.getAuthUserToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${authToken}`,
      Accept: 'application/pdf'
    });

    return this.http.get(`${this.apiUrl}/invoice/${paymentId}`, { headers, responseType: 'blob' });
  }
}
